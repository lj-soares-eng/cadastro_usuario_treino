/* Nome do cookie de autenticacao */
export const AUTH_COOKIE_NAME = 'access_token';

/* Segredo do JWT */
export const jwtSecret =
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

/* Base do cookie de autenticacao */
export const authCookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
};
