import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { SteamProfile } from '../types/steam-profile-interface';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const apiKey = config.get<string>('STEAM_API_KEY');
    if (!apiKey) throw new Error('STEAM_API_KEY is not set');

    const apiUrl = config.get<string>('API_URL') ?? 'http://localhost:3001';
    super({
      returnURL: `${apiUrl}/api/auth/steam/callback`,
      realm: apiUrl,
      apiKey,
    });
  }

  async validate(_identifier: string, profile: SteamProfile): Promise<any> {
    return this.authService.validateSteamUser(profile);
  }
}
