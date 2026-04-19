import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

/* Funcao para criar um contexto HTTP */
function httpContext(user?: { role?: Role }): ExecutionContext {
  /* Retorna o contexto HTTP */
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

/* Teste para verificar se o guard de roles funciona */
describe('RolesGuard', () => {
  /* Teste para verificar se o guard permite quando não há papéis exigidos */
  it('permite quando não há papéis exigidos', () => {
    /* Cria um reflector mockado */
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    /* Cria um guard de roles */
    const guard = new RolesGuard(reflector);
    /* Verifica se o guard permite quando não há papéis exigidos */
    expect(guard.canActivate(httpContext({ role: Role.USER }))).toBe(true);
  });

  /* Teste para verificar se o guard nega quando o usuário é USER e ADMIN é exigido */
  it('nega quando o usuário é USER e ADMIN é exigido', () => {
    /* Cria um reflector mockado */
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.ADMIN]),
    } as unknown as Reflector;
    /* Cria um guard de roles */
    const guard = new RolesGuard(reflector);
    /* Verifica se o guard nega quando o usuário é USER e ADMIN é exigido */
    expect(guard.canActivate(httpContext({ role: Role.USER }))).toBe(false);
  });

  /* Teste para verificar se o guard permite quando o usuário é ADMIN e ADMIN é exigido */
  it('permite quando o usuário é ADMIN e ADMIN é exigido', () => {
    /* Cria um reflector mockado */
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.ADMIN]),
    } as unknown as Reflector;
    /* Cria um guard de roles */
    const guard = new RolesGuard(reflector);
    /* Verifica se o guard permite quando o usuário é ADMIN e ADMIN é exigido */
    expect(guard.canActivate(httpContext({ role: Role.ADMIN }))).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      expect.any(Function),
      expect.any(Function),
    ]);
  });
});
