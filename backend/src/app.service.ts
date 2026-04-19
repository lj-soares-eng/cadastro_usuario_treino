import { Injectable } from '@nestjs/common';

/* Servico de aplicacao */
@Injectable()
export class AppService {
  /* Metodo para retornar "O servidor está rodando!" */
  getHello(): string {
    /* Retorna "O servidor está rodando!" */
    return 'O servidor está rodando!';
  }
}
