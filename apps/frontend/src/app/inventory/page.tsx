'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { apiFetch } from '@/lib/api';

interface InventoryItem {
  listingId: string | null;
  marketHashName: string;
  imageUrl: string;
  currentPrice: number | null;
  predictedPrice: number | null;
  undervaluePct: number | null;
  totalSupply: number | null;
  weaponType: string | null;
  weapon: string | null;
  collection: string | null;
  rarity: string | null;
  wear: string | null;
  isStatTrak: boolean;
  isSouvenir: boolean;
  float: number | null;
  paintSeed: number | null;
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

function pinAll(a: string, b: string) {
  if (a === 'all') return -1;
  if (b === 'all') return 1;
  return a.localeCompare(b);
}

function ValuationBadge({ pct }: { pct: number }) {
  const isUnder = pct > 0;
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
      isUnder ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
    }`}>
      {isUnder ? '+' : ''}{(pct * 100).toFixed(1)}%
    </span>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-md border transition-colors whitespace-nowrap ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'border-border text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function SkinCard({ item }: { item: InventoryItem }) {
  const baseName = item.weapon && item.marketHashName.includes('|')
    ? item.marketHashName.replace('StatTrak™ ', '').replace('Souvenir ', '').split('(')[0].trim()
    : item.marketHashName;

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:border-muted-foreground/50 transition-colors">
      <div className="relative bg-muted/30 flex items-center justify-center p-4 aspect-square">
        <img
          src={item.imageUrl}
          alt={item.marketHashName}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {item.isStatTrak && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">ST</span>
          )}
          {item.isSouvenir && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">SV</span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold leading-tight line-clamp-2">{baseName}</p>
        {item.wear && <p className="text-xs text-muted-foreground">{item.wear}</p>}
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-bold">{formatPrice(item.currentPrice)}</p>
          {item.undervaluePct !== null && <ValuationBadge pct={item.undervaluePct} />}
        </div>
        {item.predictedPrice !== null && (
          <p className="text-xs text-muted-foreground">Fair: {formatPrice(item.predictedPrice)}</p>
        )}
        {(item.float !== null || item.paintSeed !== null) && (
          <div className="flex items-center gap-2 mt-1">
            {item.float !== null && <p className="text-xs text-muted-foreground/60">{item.float.toFixed(4)}</p>}
            {item.paintSeed !== null && <p className="text-xs text-muted-foreground/60">#{item.paintSeed}</p>}
          </div>
        )}
        {item.totalSupply && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{item.totalSupply.toLocaleString()} in circulation</p>
        )}
      </div>
    </div>
  );
}

interface FiltersProps {
  sort: SortKey;
  setSort: (v: SortKey) => void;
  filterWeaponType: string;
  setFilterWeaponType: (v: string) => void;
  filterWeapon: string;
  setFilterWeapon: (v: string) => void;
  filterCollection: string;
  setFilterCollection: (v: string) => void;
  filterRarity: string;
  setFilterRarity: (v: string) => void;
  filterStatTrak: boolean;
  setFilterStatTrak: (v: boolean) => void;
  filterSouvenir: boolean;
  setFilterSouvenir: (v: boolean) => void;
  discontinuedOnly: boolean;
  setDiscontinuedOnly: (v: boolean) => void;
  weaponTypes: string[];
  weapons: string[];
  collections: string[];
  rarities: string[];
  isFiltered: boolean;
  onReset: () => void;
}

function FilterControls({
  sort, setSort,
  filterWeaponType, setFilterWeaponType,
  filterWeapon, setFilterWeapon,
  filterCollection, setFilterCollection,
  filterRarity, setFilterRarity,
  filterStatTrak, setFilterStatTrak,
  filterSouvenir, setFilterSouvenir,
  discontinuedOnly, setDiscontinuedOnly,
  weaponTypes, weapons, collections, rarities,
  isFiltered, onReset,
}: FiltersProps) {
  const handleWeaponTypeChange = (v: string) => {
    setFilterWeaponType(v);
    setFilterWeapon('all');
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Sort</p>
        <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="undervalue_desc">Most Undervalued</SelectItem>
            <SelectItem value="overvalue_desc">Most Overvalued</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Type</p>
        <Select value={filterWeaponType} onValueChange={handleWeaponTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
            {weaponTypes.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Weapon</p>
        <Select value={filterWeapon} onValueChange={setFilterWeapon}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
            {weapons.map(w => <SelectItem key={w} value={w}>{w === 'all' ? 'All Weapons' : w}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Collection</p>
        <Select value={filterCollection} onValueChange={setFilterCollection}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
            {collections.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Collections' : c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Rarity</p>
        <Select value={filterRarity} onValueChange={setFilterRarity}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
            {rarities.map(r => <SelectItem key={r} value={r}>{r === 'all' ? 'All Rarities' : r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Tags</p>
        <div className="flex flex-wrap gap-2">
          <FilterButton active={discontinuedOnly} onClick={() => setDiscontinuedOnly(!discontinuedOnly)}>Discontinued</FilterButton>
          <FilterButton active={filterStatTrak} onClick={() => setFilterStatTrak(!filterStatTrak)}>StatTrak</FilterButton>
          <FilterButton active={filterSouvenir} onClick={() => setFilterSouvenir(!filterSouvenir)}>Souvenir</FilterButton>
        </div>
      </div>
      {isFiltered && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Reset filters
        </button>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('price_desc');
  const [discontinuedOnly, setDiscontinuedOnly] = useState(false);
  const [filterWeaponType, setFilterWeaponType] = useState('all');
  const [filterWeapon, setFilterWeapon] = useState('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterStatTrak, setFilterStatTrak] = useState(false);
  const [filterSouvenir, setFilterSouvenir] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const weaponTypes = useMemo(() =>
    ['all', ...new Set(items.map(i => i.weaponType).filter(Boolean) as string[])].sort(pinAll), [items]);
  const weapons = useMemo(() => {
    const base = items.filter(i => filterWeaponType === 'all' || i.weaponType === filterWeaponType);
    return ['all', ...new Set(base.map(i => i.weapon).filter(Boolean) as string[])].sort(pinAll);
  }, [items, filterWeaponType]);
  const collections = useMemo(() =>
    ['all', ...new Set(items.map(i => i.collection).filter(Boolean) as string[])].sort(pinAll), [items]);
  const rarities = useMemo(() =>
    ['all', ...new Set(items.map(i => i.rarity).filter(Boolean) as string[])].sort(pinAll), [items]);

  const isFiltered = filterWeaponType !== 'all' || filterWeapon !== 'all' || filterCollection !== 'all' || filterRarity !== 'all' || filterStatTrak || filterSouvenir || discontinuedOnly;

  const resetFilters = () => {
    setFilterWeaponType('all');
    setFilterWeapon('all');
    setFilterCollection('all');
    setFilterRarity('all');
    setFilterStatTrak(false);
    setFilterSouvenir(false);
    setDiscontinuedOnly(false);
  };

  const filtered = useMemo(() => items.filter(i => {
    if (discontinuedOnly && i.predictedPrice === null) return false;
    if (filterWeaponType !== 'all' && i.weaponType !== filterWeaponType) return false;
    if (filterWeapon !== 'all' && i.weapon !== filterWeapon) return false;
    if (filterCollection !== 'all' && i.collection !== filterCollection) return false;
    if (filterRarity !== 'all' && i.rarity !== filterRarity) return false;
    if (filterStatTrak && !i.isStatTrak) return false;
    if (filterSouvenir && !i.isSouvenir) return false;
    return true;
  }), [items, discontinuedOnly, filterWeaponType, filterWeapon, filterCollection, filterRarity, filterStatTrak, filterSouvenir]);

  const sorted = sortItems(filtered, sort);
  const totalValue = items.reduce((sum, i) => sum + (i.currentPrice ?? 0), 0);
  const totalFairValue = items.filter(i => i.predictedPrice !== null).reduce((sum, i) => sum + (i.predictedPrice ?? 0), 0);

  const filterProps: FiltersProps = {
    sort, setSort,
    filterWeaponType, setFilterWeaponType,
    filterWeapon, setFilterWeapon,
    filterCollection, setFilterCollection,
    filterRarity, setFilterRarity,
    filterStatTrak, setFilterStatTrak,
    filterSouvenir, setFilterSouvenir,
    discontinuedOnly, setDiscontinuedOnly,
    weaponTypes, weapons, collections, rarities,
    isFiltered, onReset: resetFilters,
  };

  if (loading) return (
    <>
      <Navbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted-foreground">Loading inventory...</p>
      </main>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-destructive">{error}</p>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
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

        {/* Mobile filter bar */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <button className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            </DrawerTrigger>
            <DrawerContent className="px-6 pb-8">
              <DrawerHeader className="px-0">
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <FilterControls {...filterProps} />
            </DrawerContent>
          </Drawer>
          <p className="text-sm text-muted-foreground ml-auto">{sorted.length} shown</p>
        </div>

        {/* Desktop filter bar */}
        <div className="hidden md:flex flex-wrap items-center gap-3 mb-6">
          <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="undervalue_desc">Most Undervalued</SelectItem>
              <SelectItem value="overvalue_desc">Most Overvalued</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterWeaponType} onValueChange={v => { setFilterWeaponType(v); setFilterWeapon('all'); }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
              {weaponTypes.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterWeapon} onValueChange={setFilterWeapon}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
              {weapons.map(w => <SelectItem key={w} value={w}>{w === 'all' ? 'All Weapons' : w}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCollection} onValueChange={setFilterCollection}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
              {collections.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Collections' : c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterRarity} onValueChange={setFilterRarity}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" sideOffset={4} className="max-h-64 overflow-y-auto">
              {rarities.map(r => <SelectItem key={r} value={r}>{r === 'all' ? 'All Rarities' : r}</SelectItem>)}
            </SelectContent>
          </Select>
          <FilterButton active={discontinuedOnly} onClick={() => setDiscontinuedOnly(v => !v)}>Discontinued</FilterButton>
          <FilterButton active={filterStatTrak} onClick={() => setFilterStatTrak(v => !v)}>StatTrak</FilterButton>
          <FilterButton active={filterSouvenir} onClick={() => setFilterSouvenir(v => !v)}>Souvenir</FilterButton>
          {isFiltered && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <p className="text-sm text-muted-foreground ml-auto">{sorted.length} shown</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sorted.map(item => (
            <SkinCard key={item.marketHashName} item={item} />
          ))}
        </div>
      </main>
    </>
  );
}
