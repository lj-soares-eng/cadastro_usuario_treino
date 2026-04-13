import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';

const bcryptCompareMock = jest.fn();

jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  return {
    ...actual,
    compare: (...args: Parameters<typeof actual.compare>) =>
      bcryptCompareMock(...args) as ReturnType<typeof actual.compare>,
  };
});

const prismaMock = {
  user: {
    findUnique: jest.fn(),
  },
};

const jwtMock = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    bcryptCompareMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login lança UnauthorizedException quando o usuário não existe', async () => {
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

  it('login lança UnauthorizedException quando a senha está errada', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Lucas',
      email: 'lucas@test.com',
      password: 'hash-no-banco',
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

  it('login retorna usuário sem senha e access_token com JWT mockado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 2,
      name: 'Maria',
      email: 'maria@test.com',
      password: 'hash-no-banco',
    });
    bcryptCompareMock.mockResolvedValue(true);
    jwtMock.signAsync.mockResolvedValue('jwt.mocked.token');

    const result = await service.login({
      email: 'maria@test.com',
      password: 'correta12',
    });

    expect(result).toEqual({
      user: { id: 2, name: 'Maria', email: 'maria@test.com' },
      access_token: 'jwt.mocked.token',
    });
    expect(result.user).not.toHaveProperty('password');
    expect(jwtMock.signAsync).toHaveBeenCalledWith({
      sub: 2,
      email: 'maria@test.com',
      name: 'Maria',
    });
  });
});
