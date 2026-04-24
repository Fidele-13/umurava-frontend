import type { Metadata } from 'next';
import './globals.css';
import { AppShellProvider } from '@/app/components/app-shell';

export const metadata: Metadata = {
  title: 'Hork HR Dashboard',
  description:
    'Production-ready HR dashboard UI with responsive sidebar and hiring analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AppShellProvider>{children}</AppShellProvider>
      </body>
    </html>
  );
}
