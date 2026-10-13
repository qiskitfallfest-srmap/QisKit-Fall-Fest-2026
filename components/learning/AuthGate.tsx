'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Lock,
  AlertCircle,
  X,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Building2,
  Phone,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { REGISTRATION_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/constants';

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


const BACKGROUND_ROLES = [
  'Undergraduate Student (B.Tech / B.Sc / BCA)',
  'Postgraduate Student (M.Tech / M.Sc / MCA)',
  'Research Scholar / PhD Candidate',
  'Faculty / Academic / Educator',
  'Industry Professional / Developer',
  'Quantum Enthusiast / Self-Learner',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th+ Year'];

const INTEREST_TRACKS = [
  'Quantum SDK & Qiskit',
  '24h Quantum Hackathon',
  'Quantum AI & ML',
  'Creative Tracks (Poster/Essay/Reels)',
  'Offline Campus Summit (26–30 Oct)',
];

export function AuthGate({ children, onSessionChange }: AuthGateProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Instant On-Site Registration State
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ email: string; fullName: string } | null>(null);
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState(BACKGROUND_ROLES[0]);
  const [regInstitution, setRegInstitution] = useState('SRM University-AP');
  const [regPhone, setRegPhone] = useState('');
  const [regYear, setRegYear] = useState('2nd Year');
  const [regInterests, setRegInterests] = useState<string[]>([
    'Quantum SDK & Qiskit',
    '24h Quantum Hackathon',
  ]);
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const currentSessionRef = useRef<AuthSession | null>(null);
  const isSyncingRef = useRef(false);

  function notifyAuthChange(newSession: AuthSession | null) {
    currentSessionRef.current = newSession;
    setSession(newSession);
    onSessionChange?.(newSession);
    if (typeof window !== 'undefined') {
      import('@/lib/session-client').then((m) => m.invalidateClientSessionCache());
      window.dispatchEvent(new CustomEvent('qff_auth_change', { detail: newSession }));
    }
  }

  async function syncSessionWithBackend(email: string, fullName: string) {
    if (isSyncingRef.current) return false;
    isSyncingRef.current = true;

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
        setShowRegistrationForm(false);

        // Clean up URL OAuth code/token params if present
        if (typeof window !== 'undefined') {
          if (
            window.location.search.includes('code=') ||
            window.location.hash.includes('access_token')
          ) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          // Return to destination route if set
          const returnUrl = sessionStorage.getItem('qff_auth_return_url');
          if (
            returnUrl &&
            returnUrl !== window.location.pathname &&
            returnUrl.startsWith('/learning')
          ) {
            sessionStorage.removeItem('qff_auth_return_url');
            window.location.href = returnUrl;
          }
        }
        return true;
      } else if (verifyData.requiresRegistration) {
        // User authenticated with Google but not yet registered -> Open seamless onboarding form
        setPendingUser({
          email: verifyData.email || email,
          fullName: verifyData.fullName || fullName || email.split('@')[0],
        });
        setRegFullName(verifyData.fullName || fullName || email.split('@')[0]);
        setShowRegistrationForm(true);
        setIsLoading(false);
        setIsSubmitting(false);
        return false;
      } else if (verifyRes.status === 403) {
        // Fallback for unexpected 403
        setPendingUser({ email, fullName: fullName || email.split('@')[0] });
        setRegFullName(fullName || email.split('@')[0]);
        setShowRegistrationForm(true);
        setIsLoading(false);
        setIsSubmitting(false);
        return false;
      } else {
        await supabase.auth.signOut();
        notifyAuthChange(null);
        setShowToast(true);
        setErrorMessage(verifyData.error || 'Authentication failed. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Session sync error:', err);
      setErrorMessage(err?.message || 'Network error during authentication.');
      setShowToast(true);
    } finally {
      isSyncingRef.current = false;
      setIsLoading(false);
      setIsSubmitting(false);
    }
    return false;
  }

  // 1. Check existing session on mount and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    // Check for OAuth error in URL on return
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const oauthError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

      if (oauthError) {
        setErrorMessage(oauthError);
        setShowToast(true);
        setIsLoading(false);
        setIsSubmitting(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (searchParams.has('code') || hashParams.has('access_token')) {
        setIsSubmitting(true);
      }
    }

    async function checkCurrentSession() {
      try {
        setIsLoading(true);
        // 1. Check server session cookie first via deduplicated client cache
        const { getClientSession } = await import('@/lib/session-client');
        const data = await getClientSession();

        if (data.authenticated && data.session) {
          if (isMounted) {
            notifyAuthChange(data.session);
            setIsLoading(false);
            setIsSubmitting(false);
          }
          return;
        }

        // 2. If no server cookie, check Supabase auth
        const {
          data: { session: sbSession },
        } = await supabase.auth.getSession();

        if (sbSession?.user?.email) {
          const fullName =
            sbSession.user.user_metadata?.full_name ||
            sbSession.user.user_metadata?.name ||
            sbSession.user.user_metadata?.preferred_username ||
            '';
          await syncSessionWithBackend(sbSession.user.email, fullName);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) {
          const hasCode =
            typeof window !== 'undefined' &&
            (window.location.search.includes('code=') ||
              window.location.hash.includes('access_token'));
          if (!hasCode) {
            setIsLoading(false);
          }
        }
      }
    }

    checkCurrentSession();

    // 3. Listen to Supabase auth events (initial session, sign-in, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
        sbSession?.user?.email
      ) {
        if (currentSessionRef.current?.email === sbSession.user.email.toLowerCase()) {
          if (isMounted) {
            setIsLoading(false);
            setIsSubmitting(false);
          }
          return;
        }

        const fullName =
          sbSession.user.user_metadata?.full_name ||
          sbSession.user.user_metadata?.name ||
          sbSession.user.user_metadata?.preferred_username ||
          '';
        await syncSessionWithBackend(sbSession.user.email, fullName);
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          notifyAuthChange(null);
          setShowRegistrationForm(false);
          setPendingUser(null);
          setIsLoading(false);
          setIsSubmitting(false);
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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'qff_auth_return_url',
          window.location.pathname + window.location.search
        );
      }
      const siteUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL || '');
      const redirectUrl = `${siteUrl}/learning`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setShowToast(true);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in failed');
      setShowToast(true);
      setIsSubmitting(false);
    }
  }

  // 3. Instant On-Site Registration Submission
  async function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingUser?.email) return;

    setRegError('');
    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regInstitution.trim() || regInstitution.trim().length < 2) {
      setRegError('Please enter your university, college, or organization.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 7) {
      setRegError('Please enter a valid WhatsApp or contact phone number.');
      return;
    }

    try {
      setRegSubmitting(true);
      const isStudent = regRole.includes('Student');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          fullName: regFullName.trim(),
          role: regRole,
          institution: regInstitution.trim(),
          phone: regPhone.trim(),
          yearOfStudy: isStudent ? regYear : null,
          interests: regInterests,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.session) {
        notifyAuthChange(data.session);
        setShowRegistrationForm(false);
        setPendingUser(null);
      } else {
        setRegError(data.error || 'Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegError(err?.message || 'Network error occurred during registration.');
    } finally {
      setRegSubmitting(false);
    }
  }

  // Handle interest toggle
  function toggleInterest(track: string) {
    setRegInterests((prev) =>
      prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]
    );
  }

  // Cancel registration and sign out
  async function handleCancelRegistration() {
    await supabase.auth.signOut();
    setShowRegistrationForm(false);
    setPendingUser(null);
    setRegError('');
  }

  if (isLoading) {
    return (
      <div key="auth-gate-loading" className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Verifying authorized access...
          </p>
        </div>
      </div>
    );
  }

  if (session) {
    return <React.Fragment key="auth-gate-authenticated">{children}</React.Fragment>;
  }

  // =========================================================================
  // VIEW B: Instant Onboarding Registration Form (Zero Waiting Gap)
  // =========================================================================
  if (showRegistrationForm && pendingUser) {
    const isStudent = regRole.includes('Student');

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Instant On-Site Registration</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              Complete Your Festival Profile
            </h2>
            <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Welcome to IBM Qiskit Fall Fest 2026. Complete these details to instantly unlock masterclasses, quizzes, and Hackathon Phase 1.
            </p>
          </div>

          {regError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleCompleteRegistration} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none"
                />
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Verified Email (Locked) */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verified Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={pendingUser.email}
                  className="w-full pl-9 pr-24 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300 font-mono text-xs cursor-not-allowed"
                />
                <CheckCircle2 className="w-4 h-4 absolute left-3 top-3 text-emerald-600 dark:text-emerald-400" />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Verified
                </span>
              </div>
            </div>

            {/* Background / Role */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Background
              </label>
              <div className="relative">
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none cursor-pointer"
                >
                  {BACKGROUND_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Institution / University */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  College, University, or Organization
                </label>
                {regInstitution !== 'SRM University-AP' && (
                  <button
                    type="button"
                    onClick={() => setRegInstitution('SRM University-AP')}
                    className="text-[10px] text-burgundy dark:text-[#E89BA5] hover:underline font-mono"
                  >
                    Set to SRM University-AP
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regInstitution}
                  onChange={(e) => setRegInstitution(e.target.value)}
                  placeholder="e.g. SRM University-AP, IIT Madras, Tech Corp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none"
                />
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* WhatsApp / Phone Number */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Contact Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none"
                />
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Required for team formation, hackathon alerts, and critical event updates.
              </span>
            </div>

            {/* Conditional: Year of Study */}
            {isStudent && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Year of Study
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {YEAR_OPTIONS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setRegYear(yr)}
                      className={`py-1.5 text-center rounded-md font-mono text-[11px] border transition-colors ${
                        regYear === yr
                          ? 'bg-burgundy text-white border-burgundy'
                          : 'bg-slate-50 dark:bg-[#1C0A0D] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#3D1418] hover:border-slate-400'
                      }`}
                    >
                      {yr.replace(' Year', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tracks of Interest */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tracks You Plan to Participate In
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_TRACKS.map((track) => {
                  const selected = regInterests.includes(track);
                  return (
                    <button
                      key={track}
                      type="button"
                      onClick={() => toggleInterest(track)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-burgundy/10 dark:bg-burgundy/25 text-burgundy dark:text-[#E89BA5] border-burgundy/40'
                          : 'bg-slate-50 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#3D1418] hover:border-slate-300'
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      <span>{track}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 space-y-2">
              <button
                type="submit"
                disabled={regSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-burgundy hover:bg-burgundy-deep text-white font-semibold text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {regSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating Access...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration & Enter Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelRegistration}
                className="w-full py-1.5 text-center text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancel and use a different account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW A: Participant Gateway (High Discoverability & Instant Access Signifiers)
  // =========================================================================
  return (
    <div key="auth-gate-login" className="min-h-[70vh] flex items-center justify-center p-4 relative font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 sm:right-6 z-50 max-w-md w-[calc(100%-2.5rem)] bg-white dark:bg-[#18080B] border-2 border-rose-300 dark:border-rose-800 rounded-xl shadow-xl p-4 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 dark:text-[#FAF6F3] text-sm">Notice</h4>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl shadow-lg p-6 sm:p-8 font-sans">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Deadline Extended: 17 Oct 2026</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
            Qiskit Fall Fest 2026 Portal
          </h2>
          <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1">
            Online Phase Learning Platform & Hackathon Workspace
          </p>
        </div>

        {/* Feature Highlights Card */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200/80 dark:border-[#3D1418] text-xs space-y-2">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
            <span>Instant Free Participant Access</span>
          </div>
          <ul className="text-slate-600 dark:text-slate-400 space-y-1 pl-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>5 IBM Quantum Masterclasses & Concept Quizzes</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>3 Creative Competitions (Reels, Poster, Essay)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>9 Qiskit Browser Challenges & Hackathon Workspace</span>
            </li>
          </ul>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Google Sign In / Instant Registration Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] rounded-xl text-sm font-semibold text-slate-800 dark:text-[#FAF6F3] hover:bg-slate-50 dark:hover:bg-[#250D11] hover:border-slate-400 dark:hover:border-burgundy/50 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-4 h-4 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
              <span>Connecting with Google...</span>
            </span>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#3D1418] text-center space-y-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            First time here? Sign in with Google to complete your 30-second profile setup and get immediate access.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs font-mono font-semibold">
            <a
              href="/"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Main Site
            </a>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>WhatsApp Support</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
