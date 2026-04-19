import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/* Guarda de autenticacao JWT */
@Injectable()
/* Guarda de autenticacao JWT */
export class JwtAuthGuard extends AuthGuard('jwt') {}
