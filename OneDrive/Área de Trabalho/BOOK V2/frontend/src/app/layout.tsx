import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui'
import { BookProvider } from '@/contexts/BookContext'
import { UserProvider } from '@/contexts/UserContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ScrollManager } from '@/components/layout/ScrollManager'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OursBook - Plataforma Digital de Livros',
  description: 'Descubra, leia e gerencie sua coleção de livros digitais com uma experiência moderna e intuitiva.',
  keywords: ['livros', 'leitura', 'biblioteca digital', 'ebooks', 'plataforma de livros'],
  authors: [{ name: 'OursBook Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366F1' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark no-scroll-behavior">
      <body className={`${inter.className} bg-theme-black text-theme-white antialiased no-scroll-behavior`}>
        <ThemeProvider>
          <UserProvider>
            <BookProvider>
              <NotificationProvider>
                <ToastProvider>
                  <ScrollManager />
                  <div id="root" className="min-h-screen no-scroll-behavior">
                    {children}
                  </div>
                  <div id="modal-root" />
                </ToastProvider>
              </NotificationProvider>
            </BookProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}