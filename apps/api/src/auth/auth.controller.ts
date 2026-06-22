import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {
    // redirects to Steam — handled by passport-steam
  }

  @Get('steam/callback')
  @UseGuards(AuthGuard('steam'))
  steamCallback(@Req() req: Request & { user: User }, @Res() res: Response) {
    const token = this.authService.issueToken(req.user);
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: Request & { user: User }): User {
    return req.user;
  }
}
