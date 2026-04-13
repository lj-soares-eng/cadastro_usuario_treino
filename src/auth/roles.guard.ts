import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

/* Guard de roles */
@Injectable()
/* Guard de roles */
export class RolesGuard implements CanActivate {
  /* Constructor para injetar o reflector */
  constructor(private readonly reflector: Reflector) {}
  /* Metodo para verificar se o usuario tem as roles necessarias */
  /* Metodo para verificar se o usuario tem as roles necessarias */
  canActivate(context: ExecutionContext): boolean {
    /* Obtem as roles */
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    /* Verifica se as roles existem */
    if (!roles?.length) {
      return true;
    }
    /* Obtem o request */
    const req = context.switchToHttp().getRequest<{
      user?: { role?: Role };
    }>();
    /* Obtem o usuario */
    const user = req.user;
    /* Verifica se o usuario tem as roles necessarias */
    if (!user?.role || !roles.includes(user.role)) {
      return false;
    }
    return true;
  }
}
