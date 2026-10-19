'use client';

import React, { Suspense } from 'react';
import { AuthGate } from '@/components/learning/AuthGate';
import { ProfileView } from '@/components/learning/profile/ProfileView';

export default function ProfilePage() {
  return (
    <AuthGate>
      <Suspense fallback={null}>
        <ProfileView />
      </Suspense>
    </AuthGate>
  );
}
