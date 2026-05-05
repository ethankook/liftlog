import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthUser, TokenPayload } from './auth.types';

interface SignedTokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  async signTokenPair(user: AuthUser): Promise<SignedTokenPair> {
    return {
      accessToken: this.signToken(user, 'access'),
      refreshToken: this.signToken(user, 'refresh'),
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token, 'access');
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token, 'refresh');
  }

  private signToken(user: AuthUser, type: TokenPayload['type']): string {
    const secret = this.getSecret(type);
    const ttlSeconds = this.getTtl(type);
    const now = Math.floor(Date.now() / 1000);

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      type,
      iat: now,
      exp: now + ttlSeconds,
    };

    return this.encodeToken(header, payload, secret);
  }

  private verifyToken(
    token: string,
    expectedType: TokenPayload['type'],
  ): TokenPayload {
    const secret = this.getSecret(expectedType);
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new UnauthorizedException('Invalid token format');
    }

    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.sign(data, secret);
    const actualSignature = Buffer.from(encodedSignature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      actualSignature.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(actualSignature, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as TokenPayload;

    if (payload.type !== expectedType) {
      throw new UnauthorizedException('Invalid token type');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private encodeToken(
    header: Record<string, string>,
    payload: TokenPayload,
    secret: string,
  ): string {
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const data = `${encodedHeader}.${encodedPayload}`;

    return `${data}.${this.sign(data, secret)}`;
  }

  private sign(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('base64url');
  }

  private getSecret(type: TokenPayload['type']): string {
    const key = type === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET';
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is required`);
    }

    return value;
  }

  private getTtl(type: TokenPayload['type']): number {
    const key =
      type === 'access' ? 'JWT_ACCESS_TTL_SECONDS' : 'JWT_REFRESH_TTL_SECONDS';
    const value = this.configService.get<string>(key);
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new Error(`${key} must be a positive number`);
    }

    return parsedValue;
  }
}
