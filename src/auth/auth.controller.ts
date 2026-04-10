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

type AuthedRequest = Request & {
  user: { userId: number; email: string; name: string };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = await this.authService.login(dto);
    const maxAge = 20 * 60 * 1000; 
    const secure = process.env.NODE_ENV === 'production';

    res.cookie(AUTH_COOKIE_NAME, access_token, {
      ...authCookieBase,
      secure,
      maxAge,
    });

    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...authCookieBase,
      secure,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return {
      id: req.user.userId, 
      email: req.user.email,
      name: req.user.name,
    };
  }
}
