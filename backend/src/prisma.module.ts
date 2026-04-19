import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/* Modulo de prisma */
@Global()
@Module({
  /* Servicos do modulo */
  providers: [PrismaService],
  /* Exportacoes do servico */
  exports: [PrismaService],
})
/* Modulo de prisma */
export class PrismaModule {}
