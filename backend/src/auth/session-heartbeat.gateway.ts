import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { parseCookieValue } from './cookie.util';
import type { AccessTokenPayload } from './strategies/jwt.strategy';
import { ActiveSessionsService } from './active-sessions.service';

function sessionCorsOrigin(): string {
  return process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
}

@WebSocketGateway({
  namespace: '/session',
  cors: {
    origin: sessionCorsOrigin(),
    credentials: true,
  },
})
export class SessionHeartbeatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SessionHeartbeatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly activeSessions: ActiveSessionsService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractSocketToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    const session = await this.verifySocketSession(token);
    if (!session) {
      client.disconnect(true);
      return;
    }

    client.data.sessionJti = session.jti;
    client.data.sessionExp = session.exp;
    await this.activeSessions.touchWebSession(session.jti, session.exp);
  }

  handleDisconnect(_client: Socket): void {
    /* Desconexao por si só nao remove sessão; beacon/logout fazem remoção imediata. */
  }

  @SubscribeMessage('session:heartbeat')
  async onHeartbeat(client: Socket): Promise<void> {
    const jti = client.data.sessionJti as string | undefined;
    const exp = client.data.sessionExp as number | undefined;
    if (!jti || !exp) {
      client.disconnect(true);
      return;
    }
    await this.activeSessions.touchWebSession(jti, exp);
  }

  private extractSocketToken(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    return parseCookieValue(cookieHeader, AUTH_COOKIE_NAME);
  }

  private async verifySocketSession(
    token: string,
  ): Promise<{ jti: string; exp: number } | null> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      if (!payload.jti || !payload.exp) {
        return null;
      }
      return { jti: payload.jti, exp: payload.exp };
    } catch (err) {
      this.logger.debug(
        `Token WS invalido: ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }
}
