import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { SiteShell } from '@/components/layout/SiteShell';
import { profile } from '@/data/profile';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.title}`,
  description: profile.summary,
  keywords: ['CV', 'portfolio', 'developer', 'software engineer', 'lap trinh vien'],
  authors: [{ name: profile.name }],
  openGraph: {
    title: `${profile.name} | ${profile.title}`,
    description: profile.summary,
    type: 'profile',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${fraunces.variable} scroll-smooth`}
    >
      <body className="overflow-x-hidden antialiased">
        <a href="#main-content" className="skip-link">
          Bỏ qua điều hướng
        </a>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}