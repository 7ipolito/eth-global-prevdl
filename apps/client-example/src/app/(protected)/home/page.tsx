'use client';

import { UserForm } from '@/components/UserForm';
import { VerifyIdentity } from '@/components/VerifyIdentity';
import { useState } from 'react';

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 mb-16">
      {!isVerified ? (
        <VerifyIdentity onVerified={() => setIsVerified(true)} />
      ) : (
        <UserForm />
      )}
    </div>
  );
}
