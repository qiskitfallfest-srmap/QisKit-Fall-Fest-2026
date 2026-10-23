'use client';

import React, { use } from 'react';
import { QctfGate } from '@/components/qctf/QctfGate';
import { QctfChallengeView } from '@/components/qctf/QctfChallengeView';

export default function QctfChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <QctfGate>
      <QctfChallengeView challengeId={id} />
    </QctfGate>
  );
}
