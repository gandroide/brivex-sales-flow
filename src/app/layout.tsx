
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Brivex-Sales-Flow',
  description: 'Herramienta de Automatización de Ventas de Lujo',
};

import { ToastProvider } from '@/context/ToastContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased bg-luxury-black text-luxury-white`}>
        <ToastProvider>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="text-center py-6 text-white/20 text-sm">
            Brivex - Ontiveros & Montilla © 2026
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
