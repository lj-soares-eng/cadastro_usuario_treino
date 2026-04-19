import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ActiveSessionsService } from './active-sessions.service';
import { AuthService } from './auth.service';

/* Mock para o servico de bcrypt */
const bcryptCompareMock = jest.fn();

/* Mock para o servico de bcrypt */
jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  return {
    ...actual,
    compare: (...args: Parameters<typeof actual.compare>) =>
      bcryptCompareMock(...args) as ReturnType<typeof actual.compare>,
  };
});

/* Mock para o servico de prisma */
const prismaMock = {
  user: {
    findUnique: jest.fn(),
  },
};

/* Mock para o servico de jwt */
const jwtMock = {
  signAsync: jest.fn(),
  decode: jest.fn(),
  verifyAsync: jest.fn(),
};

const activeSessionsMock = {
  registerSession: jest.fn(),
  removeSession: jest.fn(),
};

/* Teste para verificar se o servico de autenticacao é definido */
describe('AuthService', () => {
  let service: AuthService;

  /* beforeEach para limpar os mocks */
  beforeEach(async () => {
    jest.clearAllMocks();
    bcryptCompareMock.mockReset();

    /* Cria o modulo de teste */
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ActiveSessionsService, useValue: activeSessionsMock },
      ],
    }).compile();

    /* Obtém o serviço de autenticação */
    service = module.get<AuthService>(AuthService);
  });

  /* Teste para verificar se o servico de autenticacao lança UnauthorizedException quando o usuário não existe */
  it('Login lança UnauthorizedException quando o usuário não existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ghost@test.com', password: '123456' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ghost@test.com' },
    });
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
    expect(bcryptCompareMock).not.toHaveBeenCalled();
  });

  /* Teste para verificar se o servico de autenticacao lança UnauthorizedException quando a senha está errada */
  it('Login lança UnauthorizedException quando a senha está errada', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Lucas',
      email: 'lucas@test.com',
      password: 'hash-no-banco',
      role: Role.USER,
    });
    bcryptCompareMock.mockResolvedValue(false);

    await expect(
      service.login({ email: 'lucas@test.com', password: 'senha-errada' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(bcryptCompareMock).toHaveBeenCalledWith(
      'senha-errada',
      'hash-no-banco',
    );
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  /* Teste para verificar se o servico de autenticacao retorna usuário sem senha e access_token com JWT mockado */
  it('Login retorna usuário sem senha e access_token com JWT mockado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 2,
      name: 'Maria',
      email: 'maria@test.com',
      password: 'hash-no-banco',
      role: Role.USER,
    });
    bcryptCompareMock.mockResolvedValue(true);
    jwtMock.signAsync.mockResolvedValue('jwt.mocked.token');
    jwtMock.decode.mockReturnValue({ exp: 1_700_000_000 });

    const result = await service.login({
      email: 'maria@test.com',
      password: 'correta12',
      clientType: 'web',
    });

    /* Verifica se o resultado é o esperado */
    expect(result).toEqual({
      user: { id: 2, name: 'Maria', email: 'maria@test.com', role: Role.USER },
      access_token: 'jwt.mocked.token',
      jti: expect.any(String),
      exp: 1_700_000_000,
      clientType: 'web',
    });
    expect(result.user).not.toHaveProperty('password');
    expect(jwtMock.signAsync).toHaveBeenCalledWith(
      {
        sub: 2,
        email: 'maria@test.com',
        name: 'Maria',
        role: Role.USER,
      },
      expect.objectContaining({
        jwtid: expect.any(String),
      }),
    );
    expect(activeSessionsMock.registerSession).toHaveBeenCalledWith(
      expect.any(String),
      1_700_000_000,
      'web',
    );
  });
});
