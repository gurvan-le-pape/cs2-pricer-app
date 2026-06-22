import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy as any, 'steam') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const apiUrl = config.get<string>('API_URL') ?? 'http://localhost:3001';
    super({
      returnURL: `${apiUrl}/api/auth/steam/callback`,
      realm: apiUrl,
      apiKey: config.get<string>('STEAM_API_KEY') ?? '',
    });
  }

  async validate(_identifier: string, profile: any): Promise<any> {
    return this.authService.validateSteamUser(profile);
  }
}
