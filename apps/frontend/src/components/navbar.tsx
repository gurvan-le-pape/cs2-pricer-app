'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { apiFetch } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Me {
  steamId: string;
  displayName: string;
  avatar: string;
}

export function Navbar() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then((data: Me | null) => setMe(data));
  }, []);

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    router.replace('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="px-6 h-14 flex items-center justify-between">
        <Link href={me ? '/inventory' : '/'} className="font-semibold text-sm">
          CS2 Pricer
        </Link>
        <div className="flex items-center gap-3">
          {me ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <img
                    src={me.avatar}
                    alt={me.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{me.displayName}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/inventory')}>
                  Inventory
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-500"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/steam`}>
              <button className="text-sm font-medium hover:text-muted-foreground transition-colors">
                Sign in with Steam
              </button>
            </a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
