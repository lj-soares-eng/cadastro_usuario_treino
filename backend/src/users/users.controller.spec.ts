import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/* Mock para o servico de usuarios */
const usersServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

/* Função para criar um request autenticado */
function authedReq(userId: number) {
  return {
    user: {
      userId,
      email: 'user@test.com',
      name: 'User',
      role: Role.USER,
    },
  } as Parameters<UsersController['update']>[2];
}

/* Teste para verificar se o controller é definido */
describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  /* Teste para verificar se o controller é definido */
  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  /* Teste para verificar se o controller cria um usuario */
  describe('POST /users (create)', () => {
    /* Teste para verificar se o controller cria um usuario */
    it('delega create ao UsersService com o DTO recebido', async () => {
      /* Cria um DTO */
      const dto: CreateUserDto = {
        name: 'Ana',
        email: 'ana@test.com',
        password: '123456',
      };
      const safe = { id: 10, name: 'Ana', email: 'ana@test.com' };
      usersServiceMock.create.mockResolvedValue(safe);

      const result = await controller.create(dto);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(safe);
    });
  });

  /* Teste para verificar se o controller busca todos os usuarios */
  describe('GET /users (findAll)', () => {
    /* Teste para verificar se o controller busca todos os usuarios */
    it('delega findAll ao UsersService', async () => {
      /* Cria uma lista de usuarios */
      const list = [{ id: 1, name: 'A', email: 'a@x.com', password: 'h' }];
      usersServiceMock.findAll.mockResolvedValue(list);

      /* Busca todos os usuarios */
      const result = await controller.findAll();

      /* Verifica se o UsersService foi chamado com o DTO recebido */
      expect(usersServiceMock.findAll).toHaveBeenCalledWith();
      expect(result).toBe(list);
    });
  });

  /* Teste para verificar se o controller busca um usuario */
  describe('GET /users/:id (findOne)', () => {
    /* Teste para verificar se o controller busca um usuario */
    it('delega findOne ao UsersService com id numérico', async () => {
      const user = { id: 7, name: 'B', email: 'b@x.com', password: 'h' };
      /* Cria um usuario */
      usersServiceMock.findOne.mockResolvedValue(user);

      /* Busca um usuario */
      const result = await controller.findOne('7');

      /* Verifica se o UsersService foi chamado com o id numérico */
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(7);
      expect(result).toBe(user);
    });
  });

  /* Teste para verificar se o controller atualiza um usuário */
  describe('PATCH :id', () => {
    /* Teste para verificar se o controller atualiza um usuário */
    it('lança ForbiddenException quando o token não é do usuário alvo', () => {
      const dto: UpdateUserDto = { name: 'Outro' };

      /* Verifica se o ForbiddenException é lançado */
      expect(() => controller.update(99, dto, authedReq(1))).toThrow(
        ForbiddenException,
      );

      /* Verifica se o UsersService nao foi chamado */
      expect(usersServiceMock.update).not.toHaveBeenCalled();
    });

    /* Teste para verificar se o controller repassa update ao UsersService quando o id coincide com o usuário autenticado */
    it('repassa update ao UsersService quando o id coincide com o usuário autenticado', async () => {
      const dto: UpdateUserDto = { name: 'Eu mesmo' };
      const safe = { id: 1, name: 'Eu mesmo', email: 'user@test.com' };
      /* Cria um usuario */
      usersServiceMock.update.mockResolvedValue(safe);

      const result = await controller.update(1, dto, authedReq(1));

      expect(result).toEqual(safe);
      expect(usersServiceMock.update).toHaveBeenCalledWith(1, dto);
    });
  });

  /* Teste para verificar se o controller remove um usuário */
  describe('DELETE :id', () => {
    /* Teste para verificar se o controller lança ForbiddenException quando o token não é do usuário alvo */
    it('lança ForbiddenException quando o token não é do usuário alvo', async () => {
      const res = { clearCookie: jest.fn() } as unknown as Response;

      await expect(controller.remove(99, authedReq(1), res)).rejects.toThrow(
        ForbiddenException,
      );

      expect(usersServiceMock.remove).not.toHaveBeenCalled();
      expect(res.clearCookie).not.toHaveBeenCalled();
    });

    /* Teste para verificar se o controller chama remove e limpa o cookie quando o id coincide com o usuário autenticado */
    it('chama remove e limpa o cookie quando o id coincide com o usuário autenticado', async () => {
      usersServiceMock.remove.mockResolvedValue(undefined);
      const res = { clearCookie: jest.fn() } as unknown as Response;

      await controller.remove(1, authedReq(1), res);

      expect(usersServiceMock.remove).toHaveBeenCalledWith(1);
      expect(res.clearCookie).toHaveBeenCalled();
    });
  });
});
