import type { Request } from 'express';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { parseCookieValue } from './cookie.util';

/* Extrai token Bearer do header Authorization. */
function parseBearerToken(rawAuthorization: unknown): string | null {
  if (typeof rawAuthorization !== 'string') {
    return null;
  }
  const [scheme, token] = rawAuthorization.trim().split(/\s+/, 2);
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token;
}

/* Extrai o token de acesso de Authorization ou cookie. */
export function extractAccessToken(req: Request): string | null {
  const fromAuthorization = parseBearerToken(req.headers.authorization);
  if (fromAuthorization) {
    return fromAuthorization;
  }

  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  const cookieHeader =
    typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined;
  return parseCookieValue(cookieHeader, AUTH_COOKIE_NAME);
}
