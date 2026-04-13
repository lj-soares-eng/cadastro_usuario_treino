import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const prismaMock = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

function prismaUniqueEmailError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed on the fields: (`email`)', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { modelName: 'User', target: ['email']},
  });
}

/* Teste de unidade para o servico de usuarios */ 
describe('UsersService', () => {
  /* Servico de usuarios */
  let service: UsersService;
  /* beforeEach para criar o modulo de teste */
  beforeEach(async () => {
    /* Limpa todos os mocks */
    jest.clearAllMocks();
    /* Criacao do modulo de teste */
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        /* Servico de usuarios */
        UsersService,
        /* PrismaService para testes */
        {
          provide: PrismaService,
          useValue: prismaMock,          
        },
      ],
    }).compile();

    /* Instancia do servico */
    service = module.get<UsersService>(UsersService);
  });

  /* Teste para verificar se o servico esta definido */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* Teste para verificar se os dados estão persistindo no
  banco de dados e retornar um usuário sem senha */
  it('Create deve persistir dados e retonar um usuário sem senha',
    async () => {
      /* Mock para criacao de usuario */
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
        password: 'hash-no-banco',
      });

      /* Cria o usuario */
      const result = await service.create({
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
        password: '123456',
      });

      /* Verifica se o resultado é o esperado */
      expect(result).toEqual({
        id: 1,
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      });

      expect(prismaMock.user.create).toHaveBeenCalled();
    }
  );

  it('Create deve lançar ConflictException quando o e-mail já está cadastrado',
    async () => {

      /* Mock para erro de usuario ja cadastrado */
      prismaMock.user.create.mockRejectedValue(
        prismaUniqueEmailError());

      await expect(service.create({
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
        password: '123456',
      }),
    ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).toHaveBeenCalled();
    }
  );

  it('Update deve persistir dados e retonar um usuário sem senha',
    async () => {

      prismaMock.user.update.mockResolvedValue({
        id: 1,
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      });

        await expect(service.update(1, {
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      })).rejects.toThrow(ConflictException);

      expect(prismaMock.user.update).toHaveBeenCalled();
    }
  );

  it('Update deve lançar NotFoundException quando o usuário não é encontrado',
    async () => {

      prismaMock.user.update.mockResolvedValue({
        id: 1,
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      });

        await expect(service.update(1, {
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      })).rejects.toThrow(new NotFoundException("Usuário não encontrado"));

      expect(prismaMock.user.update).toHaveBeenCalled();
    }
  );
});
