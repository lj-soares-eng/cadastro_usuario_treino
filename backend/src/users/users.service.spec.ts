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
    'Unique constraint failed on the fields: (`email`)',
    {
      code: 'P2002',
      clientVersion: 'test',
      meta: { modelName: 'User', target: ['email'] },
    },
  );
}

function prismaRecordNotFoundError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    'Record to update not found.',
    {
      code: 'P2025',
      clientVersion: 'test',
    },
  );
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

  /* Teste para verificar se o servico FindAll repassa ao Prisma e retorna a lista */
  it('FindAll repassa ao Prisma e retorna a lista', async () => {
    const users = [
      { id: 1, name: 'A', email: 'a@x.com', password: 'h1' },
      { id: 2, name: 'B', email: 'b@x.com', password: 'h2' },
    ];
    prismaMock.user.findMany.mockResolvedValue(users);

    const result = await service.findAll();

    expect(result).toBe(users);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith();
  });

  /* Teste para verificar se o servico FindOne repassa o id ao Prisma e retorna o usuário */
  it('FindOne repassa o id ao Prisma e retorna o usuário', async () => {
    const user = { id: 5, name: 'Lucas', email: 'l@x.com', password: 'hash' };
    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne(5);

    expect(result).toBe(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 5 },
    });
  });

  /* Teste para verificar se os dados estão persistindo no
  banco de dados e retornar um usuário sem senha */
  it('Create deve persistir dados e retornar um usuário sem senha',
    async () => {
      /* Mock para criacao de usuario */
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
        password: '$2b$10$RhIRXUOu8PfJkJBL9slXCuI9y48HiOa5EofJjJdIFXNmtnJrcTVRi',
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

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Lucas Soares',
          email: 'lucasdejesussoares@gmail.com',
          password: expect.any(String),
        }),
      });
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

  /* Teste para verificar se o servico Update persiste dados e retorna um usuário sem senha */
  it('Update deve persistir dados e retornar um usuário sem senha', async () => {
    /* Mock para atualizacao de usuario */
    prismaMock.user.update.mockResolvedValue({
      id: 1,
      name: 'Lucas Soares',
      email: 'lucasdejesussoares@gmail.com',
      password: 'hash-no-banco',
    });

    /* Cria um DTO */
    const dto = {
      name: 'Lucas Soares',
      email: 'lucasdejesussoares@gmail.com',
    };
    /* Atualiza o usuario */
    const result = await service.update(1, dto);

    /* Verifica se o resultado é o esperado */
    expect(result).toEqual({
      id: 1,
      name: 'Lucas Soares',
      email: 'lucasdejesussoares@gmail.com',
    });
    /* Verifica se o resultado nao tem a senha */
    expect(result).not.toHaveProperty('password');
    /* Verifica se o Prisma foi chamado com o id */

    /* Verifica se o Prisma foi chamado com o DTO */
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        name: 'Lucas Soares',
        email: 'lucasdejesussoares@gmail.com',
      }),
    });
  });

  /* Teste para verificar se o servico Update com senha envia hash ao Prisma e normaliza e-mail e nome */
  it('Update com senha envia hash ao Prisma e normaliza e-mail e nome', async () => {
    /* Mock para atualizacao de usuario */
    prismaMock.user.update.mockResolvedValue({
      id: 1,
      name: 'trim me',
      email: 'a@b.com',
      password: 'hash-no-banco',
    });

    /* Atualiza o usuario */
    await service.update(1, {
      password: 'novasenha12',
      email: '  A@B.COM ',
      name: '  trim me  ',
    });

    /* Verifica se o Prisma foi chamado com o DTO */
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        email: 'a@b.com',
        name: 'trim me',
        password: expect.any(String),
      }),
    });
    /* Verifica se a senha nao é a mesma que foi enviada */
    const sent = prismaMock.user.update.mock.calls[0][0].data as {
      password: string;
    };
    expect(sent.password).not.toBe('novasenha12');
  });

  /* Teste para verificar se o servico Update deve lançar ConflictException quando o e-mail já está cadastrado */
  it('Update deve lançar ConflictException quando o e-mail já está cadastrado',
    async () => {
      /* Mock para erro de usuario ja cadastrado */
      prismaMock.user.update.mockRejectedValue(prismaUniqueEmailError());

      /* Verifica se o ConflictException é lançado */
      await expect(
        service.update(1, {
          name: 'Lucas Soares',
          email: 'outro@gmail.com',
        }),
      ).rejects.toThrow(ConflictException);

      /* Verifica se o Prisma foi chamado */
      expect(prismaMock.user.update).toHaveBeenCalled();
    },
  );

  /* Teste para verificar se o servico Update deve lançar NotFoundException quando o usuário não é encontrado */
  it('Update deve lançar NotFoundException quando o usuário não é encontrado',
    async () => {
      /* Mock para erro de usuario nao encontrado */
      prismaMock.user.update.mockRejectedValue(prismaRecordNotFoundError());

      /* Verifica se o NotFoundException é lançado */
      await expect(
        service.update(1, {
          name: 'Lucas Soares',
          email: 'lucasdejesussoares@gmail.com',
        }),
      ).rejects.toThrow(NotFoundException);

      /* Verifica se o Prisma foi chamado */
      expect(prismaMock.user.update).toHaveBeenCalled();
    },
  );

  /* Teste para verificar se o servico Remove deve concluir quando o Prisma deleta o usuário */
  it('Remove deve concluir quando o Prisma deleta o usuário', async () => {
    /* Mock para deletacao de usuario */
    prismaMock.user.delete.mockResolvedValue(undefined);

    /* Verifica se o Remove deve concluir quando o Prisma deleta o usuário */
    await expect(service.remove(1)).resolves.toBeUndefined();
    /* Verifica se o Prisma foi chamado com o id */

    /* Verifica se o Prisma foi chamado com o id */
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  /* Teste para verificar se o servico Remove deve lançar NotFoundException quando o usuário não existe */
  it('Remove deve lançar NotFoundException quando o usuário não existe', async () => {
    /* Mock para erro de usuario nao encontrado */
    prismaMock.user.delete.mockRejectedValue(prismaRecordNotFoundError());

    /* Verifica se o NotFoundException é lançado */
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    /* Verifica se o Prisma foi chamado com o id */

    /* Verifica se o Prisma foi chamado com o id */
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });
});
