'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/api';

interface InventoryItem {
  listingId: string | null;
  marketHashName: string;
  imageUrl: string;
  currentPrice: number | null;
  predictedPrice: number | null;
  undervaluePct: number | null;
  totalSupply: number | null;
}

type SortKey = 'price_desc' | 'price_asc' | 'undervalue_desc' | 'overvalue_desc';

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return '—';
  if (price < 0.01) return `€${price.toFixed(4)}`;
  return `€${price.toFixed(2)}`;
}

function sortItems(items: InventoryItem[], key: SortKey): InventoryItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case 'price_desc': return (b.currentPrice ?? 0) - (a.currentPrice ?? 0);
      case 'price_asc': return (a.currentPrice ?? 0) - (b.currentPrice ?? 0);
      case 'undervalue_desc': return (b.undervaluePct ?? -Infinity) - (a.undervaluePct ?? -Infinity);
      case 'overvalue_desc': return (a.undervaluePct ?? Infinity) - (b.undervaluePct ?? Infinity);
    }
  });
}

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('price_desc');
  const [discontinuedOnly, setDiscontinuedOnly] = useState(false);

  useEffect(() => {
    apiFetch('/api/inventory', { cache: 'no-store' })
      .then(res => {
        if (res.status === 401) { router.replace('/'); return null; }
        if (!res.ok) throw new Error('Failed to fetch inventory');
        return res.json();
      })
      .then((data: InventoryItem[] | null) => { if (data) setItems(data); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = discontinuedOnly ? items.filter(i => i.predictedPrice !== null) : items;
  const sorted = sortItems(filtered, sort);
  const totalValue = items.reduce((sum, i) => sum + (i.currentPrice ?? 0), 0);
  const totalFairValue = items.filter(i => i.predictedPrice !== null).reduce((sum, i) => sum + (i.predictedPrice ?? 0), 0);

  if (loading) return (
    <>
      <Navbar showSignOut />
      <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted-foreground">Loading inventory...</p>
      </main>
    </>
  );

  if (error) return (
    <>
      <Navbar showSignOut />
      <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-destructive">{error}</p>
      </main>
    </>
  );

  return (
    <>
      <Navbar showSignOut />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Inventory</h1>
          <p className="text-muted-foreground mt-1">{items.length} items</p>
          <div className="flex gap-8 mt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Value</p>
              <p className="text-2xl font-semibold mt-1">€{totalValue.toFixed(2)}</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Fair Value</p>
              <p className="text-2xl font-semibold mt-1">€{totalFairValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="undervalue_desc">Most Undervalued</SelectItem>
              <SelectItem value="overvalue_desc">Most Overvalued</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setDiscontinuedOnly(v => !v)}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
              discontinuedOnly
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Discontinued only
          </button>

          <p className="text-sm text-muted-foreground ml-auto">{sorted.length} shown</p>
        </div>

        <div className="flex flex-col gap-2">
          {sorted.map(item => (
            <Card key={item.marketHashName} className="p-0">
              <div className="flex items-center gap-4 px-4 py-3">
                <img src={item.imageUrl} alt={item.marketHashName} className="w-14 h-14 object-contain shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.marketHashName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.totalSupply ? `${item.totalSupply.toLocaleString()} in circulation` : 'Supply unknown'}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="font-semibold text-sm">{formatPrice(item.currentPrice)}</p>
                  {item.predictedPrice !== null && (
                    <p className="text-xs text-muted-foreground">Fair: {formatPrice(item.predictedPrice)}</p>
                  )}
                  {item.undervaluePct !== null && (
                    <p className={`text-xs font-semibold ${item.undervaluePct > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.undervaluePct > 0 ? '+' : ''}{(item.undervaluePct * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
