import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Cinzel } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Alcateia RPG - Criador de Personagens',
  description: 'Crie fichas de personagem para D&D 5e com estilo dark fantasy. O Fim Começa Agora.',
}

export const viewport: Viewport = {
  themeColor: '#1a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${cinzel.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
