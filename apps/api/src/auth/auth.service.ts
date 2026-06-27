import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { MeDto } from './dto/me.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { SteamProfile } from './types/steam-profile-interface';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async validateSteamUser(profile: SteamProfile): Promise<User> {
    return this.usersService.upsert({
      steamId: profile.id,
      displayName: profile.displayName,
      avatar: profile.photos?.[2]?.value ?? profile.photos?.[0]?.value ?? '',
    });
  }

  issueTokenPair(user: User): TokenPair {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      steamId: user.steamId,
      jti: randomUUID(),
    });

    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is not set');

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        jti: randomUUID(),
      },
      {
        secret: refreshSecret,
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is not set');

    let payload: { sub: number; jti?: string; exp?: number };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException();
    }

    if (payload.jti) {
      const denied = await this.redis.get(`denylist:${payload.jti}`);
      if (denied) throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    return this.issueTokenPair(user);
  }

  async denyToken(token: string): Promise<void> {
    const payload = this.jwtService.decode(token) as { jti?: string; exp?: number } | null;
    if (payload?.jti && payload?.exp) {
      const ttl = payload.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redis.set(`denylist:${payload.jti}`, '1', 'EX', ttl);
      }
    }
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.denyToken(accessToken),
      this.denyToken(refreshToken),
    ]);
  }

  async getMe(id: number): Promise<MeDto> {
    const user = await this.usersService.findById(id);
    if (!user) throw new UnauthorizedException();
    return {
      steamId: user.steamId,
      displayName: user.displayName,
      avatar: user.avatar,
    };
  }
}
