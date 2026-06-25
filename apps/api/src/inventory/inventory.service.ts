import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { SkinListing } from './skin-listing.entity';
import { EnrichedItem } from './inventory.types';
import { FxService } from 'src/fx/fx.service';

interface SteamAsset {
  classid: string;
  instanceid: string;
  amount: string;
}

interface SteamDescription {
  classid: string;
  instanceid: string;
  market_hash_name: string;
  icon_url: string;
  tradable: number;
}

const round = (n: number, decimals: number) =>
  Math.round(n * 10 ** decimals) / 10 ** decimals;

@Injectable()
export class InventoryService {
  constructor(
    private readonly http: HttpService,
    private readonly fxService: FxService,
    @InjectRepository(SkinListing)
    private readonly listingRepo: Repository<SkinListing>,
  ) {}

  async getInventory(steamId: string): Promise<EnrichedItem[]> {
    const fxRate = await this.fxService.getCnyToEur();

    const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=1000`;
    
    let data: any;
    try {
      const response = await firstValueFrom(this.http.get(url));
      data = response.data;
    } catch (error) {
      console.error('Steam inventory fetch failed:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
      throw error;
    }

    if (!data?.assets || !data?.descriptions) {
      console.error('Unexpected Steam response:', data);
      return [];
    }

    const assets: SteamAsset[] = data.assets;
    const descriptions: SteamDescription[] = data.descriptions;

    const descMap = new Map<string, SteamDescription>();
    for (const desc of descriptions) {
      descMap.set(`${desc.classid}_${desc.instanceid}`, desc);
    }

    const hashNames = [
      ...new Set(
        assets
          .map((a) => descMap.get(`${a.classid}_${a.instanceid}`)?.market_hash_name)
          .filter(Boolean) as string[],
      ),
    ];

    const listings = await this.listingRepo.find({
      where: { marketHashName: In(hashNames) },
      relations: {
        prediction: true,
        prices: true,
      },
    });

    const listingMap = new Map<string, SkinListing>();
    for (const l of listings) {
      listingMap.set(l.marketHashName, l);
    }

    const seen = new Set<string>();
    const result: EnrichedItem[] = [];

    for (const asset of assets) {
      const desc = descMap.get(`${asset.classid}_${asset.instanceid}`);
      if (!desc || !desc.tradable) continue;
      if (seen.has(desc.market_hash_name)) continue;
      seen.add(desc.market_hash_name);

      const listing = listingMap.get(desc.market_hash_name);
      const latestPrice = listing?.prices?.sort(
        (a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime(),
      )[0];

      const currentPrice = latestPrice ? round(latestPrice.priceCny * fxRate, 2) : null;
      const hasValidPrice = currentPrice !== null && currentPrice > 0;
      const hasPrediction = listing?.prediction != null;

      result.push({
        listingId: listing?.id ?? null,
        marketHashName: desc.market_hash_name,
        imageUrl: `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}`,
        currentPrice,
        predictedPrice: hasPrediction ? round(listing.prediction.predictedPriceCny * fxRate, 2) : null,
        undervaluePct: hasValidPrice && hasPrediction ? listing.prediction.undervaluePct : null,
        totalSupply: listing?.totalSupply ?? null,
      });
    }

    return result;
  }
}
