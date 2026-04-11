import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';

/* Teste de unidade para o servico de usuarios */ 
describe('UsersService', () => {
  /* Servico de usuarios */
  let service: UsersService;

  /* beforeEach para criar o modulo de teste */
  beforeEach(async () => {
    /* Criacao do modulo de teste */
    const module: TestingModule = await Test.createTestingModule({
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

    /* Instancia do servico */
    service = module.get<UsersService>(UsersService);
  });

  /* Teste para verificar se o servico esta definido */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
