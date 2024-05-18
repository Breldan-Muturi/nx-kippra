import { auth } from '@/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KIPPRA Online Registration Portal',
  description: 'Register for KIPPRAs online courses',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          <TooltipProvider delayDuration={300}>
            <Toaster richColors closeButton />
            {children}
          </TooltipProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
