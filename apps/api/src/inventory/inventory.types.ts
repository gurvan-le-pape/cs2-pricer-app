export interface EnrichedItem {
  listingId: string | null;
  marketHashName: string;
  imageUrl: string;
  currentPrice: number | null;
  predictedPrice: number | null;
  undervaluePct: number | null;
  totalSupply: number | null;
  // From Steam tags
  weaponType: string | null;
  weapon: string | null;
  collection: string | null;
  rarity: string | null;
  isStatTrak: boolean;
  isSouvenir: boolean;
  wear: string | null;
  // From asset_properties
  float: number | null;
  paintSeed: number | null;
}
