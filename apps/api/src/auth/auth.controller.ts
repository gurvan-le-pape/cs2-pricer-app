import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.entity';
import { MeDto } from './dto/me.dto';

const IS_PROD = (config: ConfigService) => config.get<string>('NODE_ENV') === 'production';
const COOKIE_OPTIONS = (config: ConfigService, maxAge: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD(config),
  maxAge,
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('steam')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @UseGuards(AuthGuard('steam'))
  steamLogin() {
    // Passport-steam handles the redirect to Steam OpenID
  }

  @Get('steam/callback')
  @UseGuards(AuthGuard('steam'))
  steamCallback(@Req() req: Request & { user: User }, @Res() res: Response) {
    const { accessToken, refreshToken } = this.authService.issueTokenPair(req.user);
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    res.cookie('access_token', accessToken, COOKIE_OPTIONS(this.config, 15 * 60 * 1000));
    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS(this.config, 30 * 24 * 60 * 60 * 1000));

    res.redirect(frontendUrl);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: Request & { user: { id: number }; cookies: { refresh_token?: string } }, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(req.cookies.refresh_token!);

    res.cookie('access_token', accessToken, COOKIE_OPTIONS(this.config, 15 * 60 * 1000));
    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS(this.config, 30 * 24 * 60 * 60 * 1000));

    res.sendStatus(200);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Req() req: Request & { cookies: { access_token?: string; refresh_token?: string } },
    @Res() res: Response,
  ) {
    const { access_token, refresh_token } = req.cookies;
    if (access_token && refresh_token) {
      await this.authService.logout(access_token, refresh_token);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.sendStatus(200);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: Request & { user: { id: number; steamId: string } }): Promise<MeDto> {
    return this.authService.getMe(req.user.id);
  }
}
