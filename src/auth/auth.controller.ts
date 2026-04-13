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
    const { user, access_token } = await this.authService.login(dto);
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

    return { user };
  }

  /* Metodo para fazer logout */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...authCookieBase,
      secure,
    });
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
