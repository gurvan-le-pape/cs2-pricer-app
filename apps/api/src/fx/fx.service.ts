import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const FX_API = 'https://open.er-api.com/v6/latest/CNY';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private rate: number = 0.128; // fallback rate
  private lastFetched: number = 0;

  constructor(private readonly http: HttpService) {}

  async getCnyToEur(): Promise<number> {
    const now = Date.now();
    if (now - this.lastFetched < CACHE_TTL_MS) {
      return this.rate;
    }

    try {
      const { data } = await firstValueFrom(this.http.get(FX_API));
      this.rate = data.rates.EUR as number;
      this.lastFetched = now;
      this.logger.log(`CNY→EUR rate updated: ${this.rate}`);
    } catch (error) {
      this.logger.warn('Failed to fetch FX rate, using cached value');
    }

    return this.rate;
  }
}
