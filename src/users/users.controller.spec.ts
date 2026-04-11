import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
/* Teste de unidade para o controller de usuarios */
describe('UsersController', () => {
  /* Controller de usuarios */
  let controller: UsersController;

  /* beforeEach para criar o modulo de teste */
  beforeEach(async () => {
    /* Criacao do modulo de teste */
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        /* Servico de usuarios */
        UsersService,
        /* PrismaService para testes */
        {
          provide: PrismaService,
          useValue: {
            user: {
              /* Mock para criacao de usuario */
              create: jest.fn(),
              /* Mock para buscar todos os usuarios */
              findMany: jest.fn(),
              /* Mock para buscar usuario por id */
              findUnique: jest.fn(),
              /* Mock para atualizar usuario */
              update: jest.fn(),
              /* Mock para deletar usuario */
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    /* Instancia do controller */
    controller = module.get<UsersController>(UsersController);
  });

  /* Teste para verificar se o controller esta definido */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
