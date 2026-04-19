import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { AUTH_COOKIE_NAME, authCookieBase } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/* Mock para o servico de autenticacao */
const authServiceMock = {
  /* Mock para o metodo login */
  login: jest.fn(),
  parseTokenForSession: jest.fn(),
  removeSessionByJti: jest.fn(),
};

/* Teste de unidade para o controller de autenticacao */
describe('AuthController', () => {
  /* Controller de autenticacao */
  let controller: AuthController;
  /* Variável para armazenar o valor anterior de NODE_ENV */
  let prevNodeEnv: string | undefined;

  beforeEach(async () => {
    /* Limpa todos os mocks */
    jest.clearAllMocks();
    /* Armazena o valor anterior de NODE_ENV */
    prevNodeEnv = process.env.NODE_ENV;

    /* Cria o modulo de teste */
    const module: TestingModule = await Test.createTestingModule({
      /* Controllers de autenticacao */
      controllers: [AuthController],
      /* Servicos de autenticacao */
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    /* Instancia do controller */
    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    /* Limpa o valor de NODE_ENV */
    if (prevNodeEnv === undefined) {
      /* Deleta o valor de NODE_ENV */
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = prevNodeEnv;
    }
  });

  /* Teste para verificar se o controller esta definido */
  it('deve ser definido', () => {
    /* Verifica se o controller esta definido */
    expect(controller).toBeDefined();
  });

  /* Teste para verificar se o metodo login esta definido */
  describe('POST auth/login', () => {
    /* DTO para o metodo login */
    const dto: LoginDto = {
      email: 'user@test.com',
      password: '123456',
    };

    /* Teste para verificar se o metodo login define o cookie access_token com httpOnly, maxAge e secure=false fora de production */
    it('define cookie access_token com httpOnly, maxAge e secure=false fora de production', async () => {
      /* Define o valor de NODE_ENV para development */
      process.env.NODE_ENV = 'development';
      /* Mock para o metodo login */
      authServiceMock.login.mockResolvedValue({
        user: { id: 1, name: 'U', email: 'user@test.com', role: Role.USER },
        access_token: 'jwt.token.mock',
        exp: 1_700_000_000,
      });
      /* Resposta do metodo login */
      const res = { cookie: jest.fn() } as unknown as Response;
      /* Resultado do metodo login */

      const result = await controller.login(dto, res);

      /* Verifica se o resultado do metodo login esta correto */
      expect(result).toEqual({
        user: { id: 1, name: 'U', email: 'user@test.com', role: Role.USER },
      });
      /* Verifica se o metodo cookie foi chamado */
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        'jwt.token.mock',
        expect.objectContaining({
          ...authCookieBase,
          httpOnly: true,
          maxAge: 20 * 60 * 1000,
          secure: false,
        }),
      );
    });

    /* Teste para verificar se o metodo login define o cookie access_token com secure=true quando NODE_ENV é production */
    it('define cookie com secure=true quando NODE_ENV é production', async () => {
      /* Define o valor de NODE_ENV para production */
      process.env.NODE_ENV = 'production';
      /* Mock para o metodo login */
      authServiceMock.login.mockResolvedValue({
        user: { id: 2, name: 'P', email: 'p@test.com', role: Role.USER },
        access_token: 'jwt.prod',
        exp: 1_700_000_000,
      });
      /* Resposta do metodo login */
      const res = { cookie: jest.fn() } as unknown as Response;
      /* Resultado do metodo login */

      await controller.login(dto, res);

      /* Verifica se o metodo cookie foi chamado */
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        'jwt.prod',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 20 * 60 * 1000,
          secure: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
    });
  });

  describe('POST auth/logout', () => {
    /* Teste para verificar se o metodo logout usa nome access_token, authCookieBase e secure conforme NODE_ENV */
    it('clearCookie usa nome access_token, authCookieBase e secure conforme NODE_ENV', async () => {
      /* Define o valor de NODE_ENV para production */
      process.env.NODE_ENV = 'production';
      authServiceMock.parseTokenForSession.mockResolvedValue({ jti: 'x', exp: 1 });
      /* Resposta do metodo logout */
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const req = {
        headers: {} as unknown as Headers,
        cookies: { access_token: 'jwt.token' },
      } as unknown as Parameters<AuthController['logout']>[0];
      /* Resultado do metodo logout */

      await controller.logout(req, res);

      /* Verifica se o metodo clearCookie foi chamado */
      expect(res.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        expect.objectContaining({
          ...authCookieBase,
          secure: true,
        }),
      );
    });

    /* Teste para verificar se o metodo logout usa secure=false fora de production */
    it('logout usa secure=false fora de production', async () => {
      /* Define o valor de NODE_ENV para test */
      process.env.NODE_ENV = 'test';
      authServiceMock.parseTokenForSession.mockResolvedValue(null);
      /* Resposta do metodo logout */
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const req = {
        headers: {},
        cookies: {},
      } as Parameters<AuthController['logout']>[0];
      /* Resultado do metodo logout */

      await controller.logout(req, res);

      /* Verifica se o metodo clearCookie foi chamado */
      expect(res.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
        }),
      );
    });
  });

  /* Teste para verificar se o metodo me retorna { id, email, name, role } a partir de req.user */
  describe('GET auth/me', () => {
    /* Teste para verificar se o metodo me retorna { id, email, name, role } a partir de req.user */
    it('retorna { id, email, name, role } a partir de req.user', () => {
      /* Request */
      const req = {
        /* User */
        user: {
          userId: 42,
          email: 'me@test.com',
          name: 'Me User',
          role: Role.ADMIN,
        },
      } as Parameters<AuthController['me']>[0];

      /* Verifica se o metodo me retorna { id, email, name, role } a partir de req.user */
      expect(controller.me(req)).toEqual({
        id: 42,
        email: 'me@test.com',
        name: 'Me User',
        role: Role.ADMIN,
      });
    });
  });
});
