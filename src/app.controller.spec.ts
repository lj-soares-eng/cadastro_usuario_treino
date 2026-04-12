import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* Teste de unidade para o controller de aplicacao */
describe('AppController', () => {
  let appController: AppController;

  /* beforeEach para criar o modulo de teste */
  beforeEach(async () => {
    /* Criacao do modulo de teste */
    const app: TestingModule = await Test.createTestingModule({
      /* Controllers de aplicacao */
      controllers: [AppController],
      /* Servicos de aplicacao */
      providers: [AppService],
    }).compile();

    /* Instancia do controller */
    appController = app.get<AppController>(AppController);
  });

  /* describe para testar a raiz da aplicacao */
  describe('root', () => {
    /* Teste para verificar se a raiz da aplicacao retorna "Hello World!" */
    it('should return "O servidor está rodando!"', () => {
      expect(appController.getHello()).toBe('O servidor está rodando!');
    });
  });
});
