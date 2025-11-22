import { Button } from '@/components/ui/button'

export default function DecryptionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Decryption</h1>
          <p className="text-xl text-muted-foreground">
            Decrypt your encrypted data
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="ciphertext"
              className="block text-sm font-medium mb-2"
            >
              Encrypted Data
            </label>
            <textarea
              id="ciphertext"
              className="w-full min-h-32 p-3 rounded-md border border-input bg-background"
              placeholder="Enter encrypted data..."
            />
          </div>

          <Button className="w-full">Decrypt Data</Button>

          <div>
            <label
              htmlFor="plaintext"
              className="block text-sm font-medium mb-2"
            >
              Decrypted Output
            </label>
            <textarea
              id="plaintext"
              className="w-full min-h-32 p-3 rounded-md border border-input bg-muted"
              placeholder="Decrypted data will appear here..."
              readOnly
            />
          </div>
        </div>
      </div>
    </main>
  )
}
