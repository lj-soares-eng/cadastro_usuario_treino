import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';

const prismaMock = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

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

      const result = await service.create({
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
        password: '123456',
      });

      expect(result).toEqual({
        id: 1,
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      });

      expect(prismaMock.user.create).toHaveBeenCalled();
    }
  )
});
