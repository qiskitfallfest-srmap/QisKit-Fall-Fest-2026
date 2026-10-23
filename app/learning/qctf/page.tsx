'use client';

import React, { Suspense } from 'react';
import { QctfGate } from '@/components/qctf/QctfGate';
import { QctfArena } from '@/components/qctf/QctfArena';

export default function QctfArenaPage() {
  return (
    <QctfGate>
      <Suspense fallback={null}>
        <QctfArena />
      </Suspense>
    </QctfGate>
  );
}
