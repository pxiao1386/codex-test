'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: '首页' },
  { href: '/practice', label: '句子练习' },
  { href: '/live', label: '观众提问' },
  { href: '/rewrite', label: '改句子' },
  { href: '/review', label: '复习错误' }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-rose/40 bg-white/90 p-2 backdrop-blur">
      <ul className="grid grid-cols-5 gap-1 text-center text-xs">
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-xl px-1 py-2 ${pathname === item.href ? 'bg-blush font-semibold' : 'text-coffee/70'}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
