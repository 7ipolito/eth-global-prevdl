import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/providers/privy-provider'

export const metadata: Metadata = {
  title: 'Client Example',
  description: 'ETH LATAM ADSZK Client Example',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
