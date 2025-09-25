
import type {Metadata} from 'next';
import './globals.css';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import Header from '@/components/header';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'HapoHub',
  description: 'A Digital Marketing Content Hub.',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  // Make sure your site.webmanifest file is also inside public/favicon/
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <ToastProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
