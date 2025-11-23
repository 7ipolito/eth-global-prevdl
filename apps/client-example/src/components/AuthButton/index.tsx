'use client';
import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

/**
 * Component for authenticating a user with World App Wallet
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();
  const router = useRouter();

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) {
      return;
    }
    setIsPending(true);
    try {
      await walletAuth();
      // Use router.push instead of NextAuth redirect for miniapp compatibility
      // Small delay to ensure session is created
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push('/home');
    } catch (error) {
      console.error('Wallet authentication error', error);
      setIsPending(false);
    }
  }, [isInstalled, isPending, router]);

  return (
    <LiveFeedback
      label={{
        failed: 'Failed to login',
        pending: 'Logging in',
        success: 'Logged in',
      }}
      state={isPending ? 'pending' : undefined}
    >
      <Button
        onClick={onClick}
        disabled={isPending || !isInstalled}
        size="lg"
        variant="secondary"
      >
        Login with Wallet
      </Button>
    </LiveFeedback>
  );
};
