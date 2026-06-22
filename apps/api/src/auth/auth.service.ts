import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

interface SteamProfile {
  id: string;
  displayName: string;
  photos: { value: string }[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateSteamUser(profile: SteamProfile): Promise<User> {
    return this.usersService.upsert({
      steamId: profile.id,
      displayName: profile.displayName,
      avatar: profile.photos?.[2]?.value ?? profile.photos?.[0]?.value ?? '',
    });
  }

  issueToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      steamId: user.steamId,
    });
  }
}
