'use client';

import { AuthButton } from '../components/AuthButton';

export default function Home() {
  console.log('app_id', process.env.NEXT_PUBLIC_APP_ID);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome to PrevDL</h1>
      </div>
      <AuthButton />
    </div>
  );
}
