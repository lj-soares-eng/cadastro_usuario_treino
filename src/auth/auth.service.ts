import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import type { AccessTokenPayload } from './strategies/jwt.strategy';

/* Servico de autenticacao */ 
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    /* Cria o token de acesso */
    const access_token = await this.jwtService.signAsync(payload);

    /* Retorna o usuario e o token de acesso */
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      access_token,
    };
  }
}
