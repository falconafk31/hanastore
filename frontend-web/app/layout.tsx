import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HanaStore - Sewa Alat Berat',
  description: 'Platform sewa alat berat terpercaya',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-amber-600">HanaStore</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/catalog" className="hover:text-amber-600">Katalog</Link>
              <Link href="/dashboard" className="hover:text-amber-600">Dashboard</Link>
              <Link href="/login" className="px-3 py-1 bg-amber-600 text-white rounded">Masuk</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-gray-500 py-8 border-t mt-10">© 2026 HanaStore Heavy Equipment</footer>
      </body>
    </html>
  );
}
