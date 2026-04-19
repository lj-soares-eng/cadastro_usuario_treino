import {
  ForbiddenException,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AUTH_COOKIE_NAME, authCookieBase } from '../auth/auth.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
/* Tipo de request autenticado */
type AuthedRequest = Request & {
  user: {
    userId: number;
    email: string;
    name: string;
    role: import('@prisma/client').Role;
  };
};

/* Controller de usuarios */
  /* Controller de usuarios */
  @Controller('users')
export class UsersController {
  /* Constructor para injetar o servico de usuarios */
  constructor(private readonly usersService: UsersService) {}
  /* Criacao de usuario */

  /* Criacao de usuario */
  @Post()
  /* Criacao de usuario */
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /* Busca todos os usuarios */
  @Get()
  /* Busca todos os usuarios */
  findAll() {
    return this.usersService.findAll();
  }

  /* Busca usuario por id */
  @Get(':id')
  /* Busca usuario por id */
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /* Atualizacao de usuario */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  /* Atualizacao de usuario */
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthedRequest,
  ) {
    if (req.user.userId !== id) {
      throw new ForbiddenException(
        'Você só pode atualizar o próprio perfil',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  /* Delecao de usuario */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  /* Delecao de usuario */
  async remove(
    @Param('id', ParseIntPipe) id: number,
    /* Request autenticado */
    @Req() req: AuthedRequest,
    /* Response para limpar o cookie de autenticacao */
    @Res({ passthrough: true }) res: Response,
  ) {
    /* Verifica se o usuario esta tentando deletar a sua propria conta */
    if (req.user.userId !== id) {
      throw new ForbiddenException(
        'Você só pode excluir a própria conta',
      );
    }
    /* Deleta o usuario */
    await this.usersService.remove(id);
    /* Define se o cookie deve ser seguro */
    const secure = process.env.NODE_ENV === 'production';
    /* Limpa o cookie de autenticacao */
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...authCookieBase,
      secure,
    });
  }
}
