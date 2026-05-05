import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CryptoService } from './crypto.service';
import { TokenService } from './token.service';

interface LoginInput {
  username?: string;
  password?: string;
}

interface RefreshInput {
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    private readonly tokenService: TokenService,
  ) {}

  async login(input: LoginInput) {
    const username = input.username?.trim();
    const password = input.password;

    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.cryptoService.verifySecret(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokenPair(user.id, user.username);
  }

  async refresh(input: RefreshInput) {
    const refreshToken = input.refreshToken?.trim();
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const refreshTokenMatches = await this.cryptoService.verifySecret(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokenPair(user.id, user.username);
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshTokenHash(userId);

    return { success: true };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  private async issueTokenPair(userId: string, username: string) {
    const tokens = await this.tokenService.signTokenPair({
      id: userId,
      username,
    });
    const refreshTokenHash = await this.cryptoService.hashSecret(
      tokens.refreshToken,
    );

    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);

    return {
      user: {
        id: userId,
        username,
      },
      ...tokens,
    };
  }
}
