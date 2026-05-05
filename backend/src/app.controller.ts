import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './auth/current-user.decorator';
import type { AuthUser } from './auth/auth.types';

@Controller()
export class AppController {
  @Get()
  getStatus(@CurrentUser() user: AuthUser) {
    return {
      status: 'ok',
      user,
    };
  }
}
