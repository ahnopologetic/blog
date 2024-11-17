import Link from 'next/link';
import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="text-white p-4">
        <Link href="/" className="hover:underline">
          <h1 className="text-xl">Ahnopologetic</h1>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
