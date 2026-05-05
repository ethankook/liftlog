import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';
import type { AuthUser } from './auth.types';

interface LoginRequestBody {
  username?: string;
  password?: string;
}

interface RefreshRequestBody {
  refreshToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginRequestBody) {
    return this.authService.login(body);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: RefreshRequestBody) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  async logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.id);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
