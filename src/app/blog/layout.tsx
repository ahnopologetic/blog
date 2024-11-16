import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl">My Blog</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
