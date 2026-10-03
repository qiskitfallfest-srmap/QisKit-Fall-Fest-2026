'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  Lock,
  ArrowRight,
  LogOut,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface AuthSession {
  email: string;
  fullName: string;
  role: string;
  isAdmin: boolean;
}

interface AuthGateProps {
  children: React.ReactNode;
  onSessionChange?: (session: AuthSession | null) => void;
}

const UNSTOP_REGISTRATION_URL =
  'https://unstop.com/college-fests/qiskit-fall-fest-srmap-2026-srm-university-amaravati-515345';

export function AuthGate({ children, onSessionChange }: AuthGateProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  function notifyAuthChange(newSession: AuthSession | null) {
    setSession(newSession);
    onSessionChange?.(newSession);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qff_auth_change', { detail: newSession }));
    }
  }

  async function syncSessionWithBackend(email: string, fullName: string) {
    try {
      const verifyRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        notifyAuthChange(verifyData.session);
        return true;
      } else if (verifyRes.status === 403) {
        // User is not whitelisted / not eligible
        await supabase.auth.signOut();
        notifyAuthChange(null);
        setShowToast(true);
        setErrorMessage(
          verifyData.error ||
            'You are not eligible participant. Please register in Unstop and check back after October 7, 11:59 PM.'
        );
        return false;
      }
    } catch (err) {
      console.error('Session sync error:', err);
    }
    return false;
  }

  // 1. Check existing session on mount and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      try {
        setIsLoading(true);
        // Check server session cookie first
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.authenticated && data.session) {
          if (isMounted) {
            notifyAuthChange(data.session);
            setIsLoading(false);
          }
          return;
        }

        // If no server cookie, check Supabase auth
        const {
          data: { session: sbSession },
        } = await supabase.auth.getSession();

        if (sbSession?.user?.email) {
          await syncSessionWithBackend(
            sbSession.user.email,
            sbSession.user.user_metadata?.full_name || ''
          );
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkCurrentSession();

    // Listen to Supabase auth events (initial session, sign-in, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
        sbSession?.user?.email
      ) {
        await syncSessionWithBackend(
          sbSession.user.email,
          sbSession.user.user_metadata?.full_name || ''
        );
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          notifyAuthChange(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Google OAuth sign-in handler
  async function handleGoogleSignIn() {
    setErrorMessage('');
    setShowToast(false);
    try {
      setIsSubmitting(true);
      const siteUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL || '');
      const redirectUrl = `${siteUrl}/learning`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setShowToast(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in failed');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // 3. Direct Gmail sign-in handler (checks whitelist and issues session)
  async function handleDirectEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setShowToast(false);

    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address.');
      setShowToast(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: inputName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setShowToast(true);
        setErrorMessage(
          data.error ||
            'You are not eligible participant. Please register in Unstop and check back after October 7, 11:59 PM.'
        );
        return;
      }

      notifyAuthChange(data.session);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate email.');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // 4. Sign out
  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    await supabase.auth.signOut();
    notifyAuthChange(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verifying authorized access...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  // If not authenticated, render login gate + Toast
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 relative font-sans">
      {/* Toast Notification for Ineligible Participants */}
      {showToast && (
        <div className="fixed top-5 right-5 sm:right-6 z-50 max-w-md w-[calc(100%-2.5rem)] bg-white dark:bg-[#18080B] border-2 border-rose-300 dark:border-rose-800 rounded-xl shadow-xl p-4 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 dark:text-[#FAF6F3] text-sm">Access Restricted</h4>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                You are not eligible participant. Please register in{' '}
                <a
                  href={UNSTOP_REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-burgundy dark:text-[#E89BA5] underline inline-flex items-center gap-1 hover:text-burgundy-deep"
                >
                  Unstop
                  <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and check back after <strong>October 7, 11:59 PM</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-sm p-6 sm:p-8 font-sans">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <div className="font-mono text-[11px] font-semibold text-burgundy dark:text-[#E89BA5] uppercase tracking-[0.2em] mb-1">
            PARTICIPANT GATEWAY
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
            Qiskit Fall Fest 2026 Portal
          </h2>
          <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1">
            Online Phase Learning Platform & Hackathon Workspace
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="leading-relaxed">
              <span>You are not eligible participant. Please register in </span>
              <a
                href={UNSTOP_REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-burgundy dark:text-[#E89BA5] underline inline-flex items-center gap-1 hover:text-burgundy-deep"
              >
                Unstop
                <ExternalLink className="w-3 h-3 inline" />
              </a>
              <span> and check back after <strong>October 7, 11:59 PM</strong>.</span>
            </div>
          </div>
        )}

        {/* Primary Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] rounded-lg text-sm font-medium text-slate-800 dark:text-[#FAF6F3] hover:bg-slate-50 dark:hover:bg-[#250D11] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-[#3D1418]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#150709] px-2 text-slate-500 dark:text-slate-400 font-medium">Or enter registered Gmail</span>
          </div>
        </div>

        {/* Direct Email Validation Entry */}
        <form onSubmit={handleDirectEmailSignIn} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Registered Gmail Address
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="e.g. participant@gmail.com"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your Full Name (Optional)
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. A. Sharma"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-burgundy text-white text-sm font-semibold rounded-lg hover:bg-burgundy-deep transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking Whitelist...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Enter Learning Portal
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#3D1418] text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Access during testing is limited to whitelisted test Gmail accounts and organizing leads.
            Registered Unstop participants will be granted full access upon registration closure.
          </p>
        </div>
      </div>
    </div>
  );
}
