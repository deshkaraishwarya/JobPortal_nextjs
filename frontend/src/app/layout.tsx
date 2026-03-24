import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

/**
 * WHY next/font?
 * Next.js has a built-in font optimization system. Instead of letting the
 * browser download fonts from Google's servers (which adds latency and may
 * leak user data), next/font downloads the font at BUILD TIME and serves it
 * from your own domain. Zero external font requests = faster + more private.
 *
 * The `variable` property creates a CSS custom property (--font-inter)
 * that we apply to the body, making the font available everywhere.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

/**
 * Metadata: Next.js 14 App Router's built-in SEO system.
 * We export a `metadata` object instead of manually adding <head> tags.
 * Next.js merges this into the HTML <head> automatically.
 * Child layouts and pages can OVERRIDE these defaults with their own metadata.
 */
export const metadata: Metadata = {
  title: {
    default: 'JobTrackr — Find Your Dream Job',
    template: '%s | JobTrackr', // e.g., "Senior Dev Role | JobTrackr"
  },
  description:
    'JobTrackr helps you find, apply, and track job opportunities all in one place.',
  keywords: ['jobs', 'careers', 'job board', 'hiring', 'employment'],
  authors: [{ name: 'JobTrackr Team' }],
  openGraph: {
    title: 'JobTrackr — Find Your Dream Job',
    description: 'Find, apply, and track job opportunities.',
    type: 'website',
  },
};

/**
 * RootLayout: The top-level layout wrapping ALL pages in the app.
 *
 * WHY does every App Router project need this?
 * The App Router REQUIRES a root layout that renders <html> and <body>.
 * Every page in your app is rendered INSIDE this layout's {children}.
 *
 * Think of it like the shell of your single-page app — it never unmounts.
 * Shared UI like <Navbar> and <Footer> belongs here.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
