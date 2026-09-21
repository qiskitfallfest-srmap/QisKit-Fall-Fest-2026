import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Navbar } from '@/components/shared/Navbar';
import { LoadScreen } from '@/components/shared/LoadScreen';
import { CustomCursor } from '@/components/shared/CustomCursor';
import { SmoothScrollProvider } from '@/components/shared/SmoothScrollProvider';
import './globals.css'; // Global styles

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiskitfallfest2026.srmap.edu.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Qiskit Fall Fest 2026 | SRM University-AP',
    template: '%s | Qiskit Fall Fest 2026',
  },
  description: 'Qiskit Fall Fest 2026 — SRM University-AP × IBM. A global technology and quantum computing gathering.',
  openGraph: {
    title: 'Qiskit Fall Fest 2026 | SRM University-AP',
    description: 'Qiskit Fall Fest 2026 — SRM University-AP × IBM. A global technology and quantum computing gathering.',
    url: siteUrl,
    siteName: 'Qiskit Fall Fest 2026',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qiskit Fall Fest 2026 | SRM University-AP',
    description: 'Qiskit Fall Fest 2026 — SRM University-AP × IBM. A global technology and quantum computing gathering.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-burgundy selection:text-ivory" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SmoothScrollProvider>
            <CustomCursor />
            <LoadScreen />
            <Navbar />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
