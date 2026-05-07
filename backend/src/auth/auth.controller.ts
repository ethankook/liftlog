import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';
import type { AuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: RefreshDto) {
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
