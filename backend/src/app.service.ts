import { Injectable } from '@nestjs/common';

/* Servico de aplicacao */
@Injectable()
export class AppService {
  /* Metodo para retornar "O servidor está rodando!" */
  getHello(): string {
    /* Retorna "O servidor está online!" */
    return `
          <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Status</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;      /* centraliza vertical */
              justify-content: center;  /* centraliza horizontal */
              background: #0f172a;
              font-family: Arial, sans-serif;
            }
            h1 {
              color: #22c55e;          /* cor do texto */
              font-size: 48px;         /* tamanho da fonte */
              margin: 0;
            }
          </style>
        </head>
        <body>
          <h1>O servidor está online!</h1>
        </body>
      </html>
    `;
  }
}
