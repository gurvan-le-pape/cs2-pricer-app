"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { apiFetch } from '@/lib/api';

interface NavbarProps {
  readonly showSignOut?: boolean;
}

export function Navbar({ showSignOut = false }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm">CS2 Pricer</Link>
        <div className="flex items-center gap-3">
          {showSignOut && (
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
