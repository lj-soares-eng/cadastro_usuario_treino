import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_COOKIE_NAME, jwtSecret } from '../auth.constants';

/* Funcao para extrair o JWT do cookie */
function extractJwtFromCookie(req: Request): string | null {
  /* Obtem o raw do cookie */
  const raw = req?.cookies?.[AUTH_COOKIE_NAME];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

/* Tipo de dado para o payload do token de acesso */
export type AccessTokenPayload = {
  sub: number;
  email: string;
  name: string;
  role?: Role;
};

/* Estrategia de autenticacao JWT */
@Injectable()
/* Estrategia de autenticacao JWT */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    /* Configura a estrategia */
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /* Funcao para validar o payload do token de acesso */
  validate(payload: AccessTokenPayload) {
    /* Retorna o payload */
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role ?? Role.USER,
    };
  }
}
