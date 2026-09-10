import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiLayout, FiGrid, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { label: 'Home', href: '/', icon: FiLayout },
  { label: 'Boards', href: '/boards', icon: FiGrid },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-100 text-zinc-800">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-zinc-200 flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shrink-0
      `}>
        <div className="px-5 h-16 flex items-center gap-2 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-extrabold text-lg tracking-tight">Cardigo</span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}><FiX className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">U</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">User</p>
            <p className="text-xs text-zinc-400 truncate">Member</p>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="flex-1 h-screen flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 bg-white border-b border-zinc-200 flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden p-1" onClick={() => setOpen(true)}><FiMenu className="w-5 h-5" /></button>
          <Link href="/" className="font-bold text-lg leading-tight lg:hidden">Cardigo</Link>
          <div className="flex-1" />
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}