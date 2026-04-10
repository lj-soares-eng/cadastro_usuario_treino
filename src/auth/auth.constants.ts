export const AUTH_COOKIE_NAME = 'access_token';

export const jwtSecret =
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export const authCookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
};
