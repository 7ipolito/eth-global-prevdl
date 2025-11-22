'use client'

import { Button } from '@/components/ui/button'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { Lock, Unlock } from 'lucide-react'

export default function Home() {
  const { login, logout, authenticated, user } = usePrivy()
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">ETH LATAM ADSZK</h1>
          <p className="text-xl text-muted-foreground">
            Privacy-Preserving Encryption Platform
          </p>
        </div>

        <div className="flex justify-center">
          {authenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email?.address || user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4)}
              </span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={login} size="lg">
              Login
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/encryption')}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 hover:bg-accent transition-colors"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Encryption</h2>
              <p className="text-sm text-muted-foreground text-center">
                Encrypt your sensitive data securely using FHE
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/decryption')}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 hover:bg-accent transition-colors"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Unlock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Decryption</h2>
              <p className="text-sm text-muted-foreground text-center">
                Decrypt your encrypted data with your private key
              </p>
            </div>
          </button>
        </div>
      </div>
    </main>
  )
}
