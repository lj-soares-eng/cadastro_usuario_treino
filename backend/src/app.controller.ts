import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

/* Controller de aplicacao */
@Controller()
export class AppController {
  /* Constructor para injetar o servico de aplicacao */
  constructor(private readonly appService: AppService) {}
  /* Metodo para retornar "O servidor está rodando!" */
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getHello(): string {
    /* Retorna "O servidor está rodando!" */
    return this.appService.getHello();
  }
}
