import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(secret, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifySecret(
  secret: string,
  storedHash: string | null | undefined,
): Promise<boolean> {
  if (!storedHash) {
    return false;
  }

  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) {
    return false;
  }

  const derivedKey = (await scrypt(secret, salt, 64)) as Buffer;
  const expectedHash = Buffer.from(hash, 'hex');

  if (derivedKey.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedHash);
}
