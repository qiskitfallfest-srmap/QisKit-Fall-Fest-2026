'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthGate } from '@/components/learning/AuthGate';
import type { QctfMe } from '@/data/qctf/tracks';
import { QctfLockedScreen } from './QctfLockedScreen';

interface QctfMeContextValue {
  me: QctfMe;
  setMe: (me: QctfMe) => void;
  refreshMe: () => Promise<void>;
}

const QctfMeContext = createContext<QctfMeContextValue | null>(null);

export function useQctfMe(): QctfMeContextValue {
  const value = useContext(QctfMeContext);
  if (!value) throw new Error('useQctfMe must be used inside QctfGate');
  return value;
}

/** Signs the visitor in, loads their arena access and team, then shows the arena or the locked screen. */
export function QctfGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <QctfMeLoader>{children}</QctfMeLoader>
    </AuthGate>
  );
}

function QctfMeLoader({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<QctfMe | null>(null);
  const [failed, setFailed] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch('/api/qctf/me', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMe(data.me);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
  }, []);

  // Re-check every 30 s so released blocks and state changes reach open tabs without a reload
  useEffect(() => {
    refreshMe();
    const timer = setInterval(refreshMe, 30000);
    return () => clearInterval(timer);
  }, [refreshMe]);

  if (!me) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {failed ? (
          <span>Could not load QCTF. Refresh the page to try again.</span>
        ) : (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading QCTF
          </>
        )}
      </div>
    );
  }

  if (!me.canEnter) return <QctfLockedScreen state={me.state} />;

  return <QctfMeContext.Provider value={{ me, setMe, refreshMe }}>{children}</QctfMeContext.Provider>;
}
