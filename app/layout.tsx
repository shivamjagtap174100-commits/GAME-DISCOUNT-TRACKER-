import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Watermark from '@/components/Watermark';

export const metadata: Metadata = {
  title: 'Game Discount Tracker — Never Miss a Game Deal',
  description: 'Track real-time game prices, steep discounts, historical lows, and free promotions across Steam and Epic Games Store.',
  keywords: ['game deals', 'steam sales', 'epic games discount', 'free pc games', 'game price tracker', 'india gaming deals'],
  authors: [{ name: 'Shivam Jagtap', url: 'https://github.com/shivamjagtap174100-commits' }],
  creator: 'Shivam Jagtap',
  openGraph: {
    title: 'Game Discount Tracker — Never Miss a Game Deal',
    description: 'Track real-time game prices, steep discounts, historical lows, and free promotions across Steam and Epic Games Store.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary antialiased selection:bg-accent-amber selection:text-[#101214]">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Watermark />
        </AppProvider>
      </body>
    </html>
  );
}
