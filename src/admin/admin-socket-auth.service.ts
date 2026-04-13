import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import type { Socket } from 'socket.io';
import { AUTH_COOKIE_NAME, jwtSecret } from '../auth/auth.constants';
import { parseCookieValue } from '../auth/cookie.util';
import type { AccessTokenPayload } from '../auth/strategies/jwt.strategy';

/* Serviço de autenticação de socket de administração */
@Injectable()
export class AdminSocketAuthService {
  constructor(private readonly jwtService: JwtService) {}

  /*
   * Valida JWT do cookie no handshake e confirma papel ADMIN.
   * Preenche `client.data.user` quando bem-sucedido.
   */
  async verifyAdminSocket(client: Socket): Promise<boolean> {
    const token = parseCookieValue(
      client.handshake.headers.cookie,
      AUTH_COOKIE_NAME,
    );
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        { secret: jwtSecret },
      );
      const role = payload.role ?? Role.USER;
      if (role !== Role.ADMIN) {
        return false;
      }
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        role,
      };
      return true;
    } catch {
      return false;
    }
  }
}
