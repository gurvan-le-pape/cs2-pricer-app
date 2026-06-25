export interface EnrichedItem {
  listingId: string | null;
  marketHashName: string;
  imageUrl: string;
  currentPrice: number | null;
  predictedPrice: number | null;
  undervaluePct: number | null;
  totalSupply: number | null;
}
