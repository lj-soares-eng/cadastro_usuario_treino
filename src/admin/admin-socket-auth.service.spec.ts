import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import type { Socket } from 'socket.io';
import { AUTH_COOKIE_NAME } from '../auth/auth.constants';
import { AdminSocketAuthService } from './admin-socket-auth.service';

/* Função para criar um socket com um cookie */
function socketWithCookie(value: string | undefined): Socket {
  return {
    handshake: {
      headers: value
        ? { cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(value)}` }
        : {},
    },
    data: {},
  } as unknown as Socket;
}

/* Testes para o serviço de autenticação de socket de administração */
describe('AdminSocketAuthService', () => {
  /* Teste para verificar se o serviço retorna false quando não há cookie */
  it('retorna false quando não há cookie', async () => {
    const jwt = { verifyAsync: jest.fn() };
    const svc = new AdminSocketAuthService(jwt as unknown as JwtService);
    await expect(svc.verifyAdminSocket(socketWithCookie(undefined))).resolves.toBe(
      false,
    );
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  /* Teste para verificar se o serviço retorna false quando o token indica USER */
  it('retorna false quando o token indica USER', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 1,
        email: 'u@test.com',
        name: 'U',
        role: Role.USER,
      }),
    };
    const svc = new AdminSocketAuthService(jwt as unknown as JwtService);
    const client = socketWithCookie('tok');
    await expect(svc.verifyAdminSocket(client)).resolves.toBe(false);
  });

  /* Teste para verificar se o serviço retorna true e preenche client.data.user quando ADMIN */
  it('retorna true e preenche client.data.user quando ADMIN', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 2,
        email: 'a@test.com',
        name: 'Admin',
        role: Role.ADMIN,
      }),
    };
    const svc = new AdminSocketAuthService(jwt as unknown as JwtService);
    const client = socketWithCookie('admintok');
    await expect(svc.verifyAdminSocket(client)).resolves.toBe(true);
    expect(client.data.user).toMatchObject({
      userId: 2,
      email: 'a@test.com',
      name: 'Admin',
      role: Role.ADMIN,
    });
  });

  it('retorna false quando verifyAsync falha', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid')),
    };
    const svc = new AdminSocketAuthService(jwt as unknown as JwtService);
    await expect(svc.verifyAdminSocket(socketWithCookie('bad'))).resolves.toBe(
      false,
    );
  });
});
