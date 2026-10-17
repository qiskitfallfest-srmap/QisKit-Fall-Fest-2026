'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function OAuthRedirectHandler() {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    // Check if URL contains Supabase OAuth hash fragments
    if (hash && (hash.includes('access_token=') || hash.includes('error='))) {
      handleOAuthHash();
    }

    // Also listen to Supabase auth state change for SIGNED_IN event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token && !isSyncingRef.current) {
        isSyncingRef.current = true;
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: session.access_token }),
          });

          // Clean URL hash
          if (window.location.hash && window.history?.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }

          // If on home page, forward to /learning
          if (window.location.pathname === '/') {
            window.location.replace('/learning');
          }
        } catch (err) {
          console.error('Error synchronizing auth session:', err);
        } finally {
          isSyncingRef.current = false;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleOAuthHash() {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      // Allow Supabase SDK to parse the hash fragment from window.location
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('OAuth session extraction error:', error);
        return;
      }

      if (session?.access_token) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.access_token }),
        });

        // Clean up hash fragment from the URL for security and clean navigation
        if (window.history?.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        // Redirect from root to /learning
        if (window.location.pathname !== '/learning') {
          window.location.replace('/learning');
        }
      }
    } catch (err) {
      console.error('Failed to handle OAuth hash redirect:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }

  return null;
}
