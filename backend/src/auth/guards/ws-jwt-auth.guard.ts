import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { AUTH_COOKIE_NAME, jwtSecret } from '../auth.constants';
import { parseCookieValue } from '../cookie.util';
import type { AccessTokenPayload } from '../strategies/jwt.strategy';

/* Guarda de autenticacao JWT para WebSocket */
@Injectable()
/* Guarda de autenticacao JWT para WebSocket */
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /* Funcao para verificar se o usuario esta autenticado */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /* Obtem o cliente */
    const client = context.switchToWs().getClient<Socket>();
    /* Obtem o token */
    const token = parseCookieValue(
      client.handshake.headers.cookie,
      AUTH_COOKIE_NAME,
    );
    /* Verifica se o token existe */
    if (!token) {
      throw new WsException('Não autorizado');
    }
    try {
      /* Verifica se o token é valido */
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        { secret: jwtSecret },
      );
      /* Preenche o cliente com o usuario */
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role ?? Role.USER,
      };
      /* Retorna true */
      return true;
    } catch {
      throw new WsException('Não autorizado');
    }
  }
}
