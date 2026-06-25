'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.replace('/inventory');
    } else {
      router.replace('/');
    }
  }, [params, router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Signing in...</p>
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
