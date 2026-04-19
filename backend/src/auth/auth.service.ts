import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { ActiveSessionsService, SessionClientType } from './active-sessions.service';
import { LoginDto } from './dto/login.dto';
import type { AccessTokenPayload } from './strategies/jwt.strategy';
import { generateUuidV7 } from './uuidv7.util';

/* Servico de autenticacao */ 
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly activeSessions: ActiveSessionsService,
  ) {}

  /* Metodo para fazer login */
  async login(dto: LoginDto) {
    /* Encontra o usuario */
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    /* Verifica se o usuario existe */
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    /* Verifica se a senha esta correta */
    const passwordOk = await bcrypt.compare(dto.password, user.password);
    /* Verifica se a senha esta incorreta */
    if (!passwordOk) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    /* Cria o payload do token de acesso */
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const jti = generateUuidV7();
    const clientType: SessionClientType = dto.clientType ?? 'web';

    /* Cria o token de acesso */
    const access_token = await this.jwtService.signAsync(payload, {
      jwtid: jti,
    });
    const decoded = this.jwtService.decode(access_token) as
      | { exp?: number }
      | null;
    const jwtExpUnix = decoded?.exp;
    if (!jwtExpUnix) {
      throw new UnauthorizedException('Nao foi possivel criar sessao');
    }

    await this.activeSessions.registerSession(jti, jwtExpUnix, clientType);

    /* Retorna o usuario e o token de acesso */
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      access_token,
      jti,
      exp: jwtExpUnix,
      clientType,
    };
  }

  /* Remove sessão por jti explicitamente. */
  async removeSessionByJti(jti: string): Promise<void> {
    await this.activeSessions.removeSession(jti);
  }

  /* Valida token e retorna jti/exp para operações de sessão. */
  async parseTokenForSession(token: string, ignoreExpiration = false): Promise<{
    jti: string;
    exp: number;
  } | null> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        { ignoreExpiration },
      );
      if (!payload.jti || !payload.exp) {
        return null;
      }
      return { jti: payload.jti, exp: payload.exp };
    } catch {
      return null;
    }
  }
}
