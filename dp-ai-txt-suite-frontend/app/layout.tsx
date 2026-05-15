import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/contexts/AppContext'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { FooterWrapper } from '@/components/FooterWrapper'
import { ToastWrapper } from '@/components/ToastWrapper'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AI Text Suite',
  description: 'Three powerful AI text processing tools in one suite',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 min-h-screen flex flex-col">
        <AppProvider>
          <HeaderWrapper />
          <main className="relative flex-1">
            {children}
          </main>
          <FooterWrapper />
          <ToastWrapper />
          <Analytics />
        </AppProvider>
      </body>
    </html>
  )
}
