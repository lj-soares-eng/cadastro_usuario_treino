import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/* Funcao para iniciar o servidor */
async function bootstrap() {
  /* Cria o aplicativo NestJS */
  const app = await NestFactory.create(AppModule);

  /* Usa o cookie parser */
  app.use(cookieParser());
  /* Usa o pipe de validacao */

  /* Usa o pipe de validacao global */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  /* Habilita o CORS */
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    /* Credenciais */
    credentials: true,
    /* Metodos permitidos */
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    /* Headers permitidos (Cookie para JWT httpOnly; Socket.IO polling) */
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });
  /* Aguarda o servidor iniciar */
  await app.listen(process.env.PORT ?? 3000);
  /* Retorna o aplicativo NestJS */
  return app;
}
/* Inicia o servidor */
bootstrap();
