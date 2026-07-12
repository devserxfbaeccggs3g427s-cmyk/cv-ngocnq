import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer, SideNav } from '@/components/layout';
import { profile } from '@/data/profile';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="vi" className="scroll-smooth">
      <body className={`${inter.className} overflow-x-hidden bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <Header />
        <SideNav />
        <main className="relative pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
