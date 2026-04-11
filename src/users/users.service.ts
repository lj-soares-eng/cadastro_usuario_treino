import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/* Servico de usuarios */
@Injectable()
export class UsersService {
  /* Constructor para injetar o servico de prisma */
  constructor(private prisma: PrismaService) {}
  /* Criacao de usuario */

  async create(createUserDto: CreateUserDto) {
    /* Cria o hash da senha */
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    /* Tenta criar o usuario */
    try {
      /* Cria o usuario */
      const user = await this.prisma.user.create({
        /* Dados do usuario */
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: passwordHash,
        },
      });
      /* Retorna o usuario sem a senha */
      const { password: _p, ...safe } = user;
      return safe;
    } catch (e) {
      /* Verifica se o erro e de duplicacao de email */
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        /* Retorna erro de duplicacao de email */
        throw new ConflictException('Este e-mail já está cadastrado');
      }
      /* Retorna erro de outro tipo */
      throw e;
    }
  }

  /* Busca todos os usuarios */
  async findAll() {
    /* Busca todos os usuarios */
    return this.prisma.user.findMany();
  }

  /* Busca usuario por id */
  async findOne(id: number) {
    /* Busca usuario por id */
    return this.prisma.user.findUnique({
      where: { id },
      /* Retorna o usuario */
    });
  }

  /* Atualiza usuario */
  async update(id: number, updateUserDto: UpdateUserDto) {
    /* Dados do usuario */
    const data: UpdateUserDto = { ...updateUserDto };
    /* Verifica se a senha foi informada */
    if (data.password) {
      /* Cria o hash da senha */
      data.password = await bcrypt.hash(data.password, 10);
    }
    /* Verifica se o email foi informado */
    if (data.email) {
      /* Formata o email */
      data.email = data.email.trim().toLowerCase();
    }
    /* Verifica se o nome foi informado */
    if (data.name) {
      /* Formata o nome */
      data.name = data.name.trim();
    }
    try {
      /* Atualiza o usuario */
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      /* Retorna o usuario sem a senha */
      const { password: _p, ...safe } = user;
      return safe;
    } catch (e) {
      /* Verifica se o erro e de duplicacao de email */
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        /* Retorna erro de duplicacao de email */
        throw new ConflictException('Este e-mail já está cadastrado');
      }
      /* Verifica se o erro e de usuario nao encontrado */
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        /* Retorna erro de usuario nao encontrado */
        throw new NotFoundException('Usuário não encontrado');
      }
      throw e;
    }
  }

  /* Deleta usuario */
  async remove(id: number) {
    /* Tenta deletar o usuario */
    try {
      /* Deleta o usuario */
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (e) {
      /* Verifica se o erro e de usuario nao encontrado */
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        /* Retorna erro de usuario nao encontrado */
        throw new NotFoundException('Usuário não encontrado');
      }
      /* Retorna erro de outro tipo */
      throw e;
    }
  }
}
