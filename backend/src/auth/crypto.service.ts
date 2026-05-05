import { Injectable } from '@nestjs/common';
import { hashSecret, verifySecret } from './secret-hash';

@Injectable()
export class CryptoService {
  async hashSecret(secret: string): Promise<string> {
    return hashSecret(secret);
  }

  async verifySecret(
    secret: string,
    storedHash: string | null | undefined,
  ): Promise<boolean> {
    return verifySecret(secret, storedHash);
  }
}
