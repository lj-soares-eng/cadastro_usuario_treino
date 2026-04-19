import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

/* Servico de prisma */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /* Pool de conexao */
  private readonly pool: Pool;

  /* Constructor para injetar o servico de prisma */
  constructor() {
    /* Verifica se a variavel de ambiente DATABASE_URL esta setada */
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    /* Cria o pool de conexao */
    const pool = new Pool({ connectionString });
    super({ adapter: new PrismaPg(pool) });
    /* Atribui o pool de conexao */
    this.pool = pool;
  }

  /* Metodo para conectar ao banco de dados */
  async onModuleInit() {
    /* Conecta ao banco de dados */
    await this.$connect();
  }

  /* Metodo para desconectar do banco de dados */
  async onModuleDestroy() {
    /* Desconecta do banco de dados */
    await this.$disconnect();
    /* Fecha o pool de conexao */
    await this.pool.end();
  }
}
