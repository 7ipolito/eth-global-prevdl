import { Button } from '@/components/ui/button'

export default function EncryptionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Encryption</h1>
          <p className="text-xl text-muted-foreground">
            Encrypt your data securely
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="plaintext"
              className="block text-sm font-medium mb-2"
            >
              Data to Encrypt
            </label>
            <textarea
              id="plaintext"
              className="w-full min-h-32 p-3 rounded-md border border-input bg-background"
              placeholder="Enter text to encrypt..."
            />
          </div>

          <Button className="w-full">Encrypt Data</Button>

          <div>
            <label
              htmlFor="ciphertext"
              className="block text-sm font-medium mb-2"
            >
              Encrypted Output
            </label>
            <textarea
              id="ciphertext"
              className="w-full min-h-32 p-3 rounded-md border border-input bg-muted"
              placeholder="Encrypted data will appear here..."
              readOnly
            />
          </div>
        </div>
      </div>
    </main>
  )
}
