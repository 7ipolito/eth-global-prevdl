'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import {
  MiniKit,
  ISuccessResult,
  type VerifyCommandInput,
} from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Component for verifying user identity using World ID
 * This should be shown after wallet authentication and before the user form
 */
interface VerifyIdentityProps {
  onVerified?: () => void;
}

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}

async function verifyIdentity({
  action,
  signal,
}: {
  action: string;
  signal?: string;
}): Promise<{ success: boolean }> {
  try {
    // Prepare verify command input according to World ID documentation
    // https://docs.world.org/mini-apps/commands/verify
    const verifyPayload: VerifyCommandInput = {
      action,
      ...(signal && { signal }), 
    };

    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    if (finalPayload.status === 'error') {
      const errorMessage =
        (finalPayload as any)?.error_code ||
        (finalPayload as any)?.error ||
        'Verification failed';
      throw new Error(errorMessage);
    }

    if (finalPayload.status !== 'success') {
      throw new Error(
        `Unexpected verification status: ${(finalPayload as any).status}`,
      );
    }

    const verifyResponse = await fetch('/api/verify-proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: finalPayload as ISuccessResult,
        action,
        signal,
      } as IRequestPayload),
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));

      if (errorData.code === 'invalid_nullifier') {
        return { success: true };
      }

      const errorMessage =
        errorData.error ||
        errorData.detail ||
        `Server verification failed (${verifyResponse.status})`;
      throw new Error(errorMessage);
    }

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.verifyRes?.success) {
      const errorDetail =
        verifyResult.verifyRes?.detail ||
        verifyResult.error ||
        'Verification failed';
      throw new Error(errorDetail);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('required') || errorMsg.includes('attribute')) {
        const app_id = process.env.NEXT_PUBLIC_APP_ID;
        const hasAppId = !!app_id;
        const isValidFormat = app_id?.trim().startsWith('app_') ?? false;
        
        throw new Error("Error verifying identity");
      }
      throw error;
    }
    throw new Error('An unexpected error occurred during verification');
  }
}

export function VerifyIdentity({ onVerified }: VerifyIdentityProps) {
  const { isInstalled } = useMiniKit();
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: async () => {
      const rawAppId = process.env.NEXT_PUBLIC_APP_ID;
      
      if (!rawAppId) {
        throw new Error(
          'NEXT_PUBLIC_APP_ID is not configured. ' +
          'Please set it in your .env.local file and restart the development server.'
        );
      }

      // Trim whitespace
      const app_id = rawAppId.trim();
      
      if (!app_id.startsWith('app_')) {
        throw new Error(
          `NEXT_PUBLIC_APP_ID format is invalid. Expected format: app_xxxxx, got: ${app_id.substring(0, 20)}...`
        );
      }

      const action = 'verify';
      const signal = session?.user?.walletAddress?.toLowerCase();

      return verifyIdentity({ action, signal });
    },
    onSuccess: () => {
      onVerified?.();
    },
  });

  const handleVerify = () => {
    if (!isInstalled || mutation.isPending) {
      return;
    }
    mutation.mutate();
  };

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-green-600">
          Identity verified successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
      <p className="text-center text-gray-600 mb-6">
        Please verify your identity using World ID to continue.
      </p>
      {mutation.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'An unexpected error occurred during verification'}
          </p>
        </div>
      )}
      <LiveFeedback
        label={{
          failed: 'Verification failed',
          pending: 'Verifying identity',
          success: 'Identity verified',
        }}
        state={mutation.isPending ? 'pending' : mutation.error ? 'failed' : undefined}
      >
        <Button
          onClick={handleVerify}
          disabled={mutation.isPending || !isInstalled}
          size="lg"
          variant="secondary"
        >
          Verify Identity
        </Button>
      </LiveFeedback>
    </div>
  );
}

