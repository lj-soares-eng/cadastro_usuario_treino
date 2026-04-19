import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  AUTH_COOKIE_NAME,
  authCookieBase,
} from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { extractAccessToken } from './token.util';

/* Tipo de request autenticado */
type AuthedRequest = Request & {
  /* User */
  user: { userId: number; 
  email: string; 
  name: string; 
  role: import('@prisma/client').Role };
};

/* Controller de autenticacao */
@Controller('auth')
export class AuthController {
  /* Constructor para injetar o servico de autenticacao */
  constructor(private readonly authService: AuthService) {}

  /* Metodo para fazer login */ 
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    /* Faz o login */
    const { user, access_token, exp } = await this.authService.login(dto);
    /* Define a duracao do cookie */
    const maxAge = 20 * 60 * 1000; 
    /* Define se o cookie deve ser seguro */
    const secure = process.env.NODE_ENV === 'production';

    /* Define o cookie de acesso */
    res.cookie(AUTH_COOKIE_NAME, access_token, {
      ...authCookieBase,
      secure,
      maxAge,
    });

    if (dto.clientType === 'api') {
      return { user, access_token, tokenType: 'Bearer', exp };
    }

    return { user };
  }

  /* Metodo para fazer logout */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = extractAccessToken(req);
    if (token) {
      const session = await this.authService.parseTokenForSession(token, true);
      if (session?.jti) {
        await this.authService.removeSessionByJti(session.jti);
      }
    }
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...authCookieBase,
      secure,
    });
  }

  @Post('session/beacon')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endSessionFromBeacon(@Req() req: Request): Promise<void> {
    const token = extractAccessToken(req);
    if (!token) {
      return;
    }
    const session = await this.authService.parseTokenForSession(token, true);
    if (session?.jti) {
      await this.authService.removeSessionByJti(session.jti);
    }
  }

  /* Metodo para retornar o usuario autenticado */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    };
  }
}
