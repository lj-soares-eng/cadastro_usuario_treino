import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { ROLES_KEY } from '../roles.decorator';

/* Guarda de roles para WebSocket */
@Injectable()
/* Guarda de roles para WebSocket */
export class WsRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /* Funcao para verificar se o usuario tem as roles necessarias */
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
    /* Obtem o cliente */
    const client = context.switchToWs().getClient<Socket>();
    /* Obtem o usuario */
    const user = client.data?.user as { role?: Role } | undefined;
    /* Verifica se o usuario tem as roles necessarias */
    if (!user?.role || !roles.includes(user.role)) {
      throw new WsException('Proibido');
    }
    return true;
  }
}
