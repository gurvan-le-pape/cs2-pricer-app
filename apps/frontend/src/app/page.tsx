'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    apiFetch('/api/auth/me').then(res => {
      if (res.ok) setLoggedIn(true);
    });
  }, []);

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setLoggedIn(false);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen gap-6 text-center">
      <div className="absolute top-4 right-6 flex items-center gap-3">
        {loggedIn ? (
          <>
            <Button variant="ghost" onClick={() => router.push('/inventory')}>
              Inventory
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        ) : (
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/steam`}>
            <Button>Sign in with Steam</Button>
          </a>
        )}
      </div>
      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight">CS2 Skin Pricer</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Find overvalued and undervalued CS2 skins using machine learning.
        </p>
      </div>
    </main>
  );
}
