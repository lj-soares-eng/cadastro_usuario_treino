import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from '../auth.constants';
import { extractAccessToken } from '../token.util';

/* Tipo de dado para o payload do token de acesso */
export type AccessTokenPayload = {
  sub: number;
  email: string;
  name: string;
  role?: Role;
  jti?: string;
  exp?: number;
};

/* Estrategia de autenticacao JWT */
@Injectable()
/* Estrategia de autenticacao JWT */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    /* Configura a estrategia */
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => extractAccessToken(req),
      ]),
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
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
