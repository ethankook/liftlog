import { Request } from 'express';

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

export interface TokenPayload {
  sub: string;
  username: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}
