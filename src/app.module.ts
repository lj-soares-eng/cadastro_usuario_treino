import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';

/* Modulo de aplicacao */ 
@Module({
  /* Importacoes do modulo */
  imports: [PrismaModule, AuthModule, UsersModule],
  /* Controllers do modulo */
  controllers: [AppController],
  /* Servicos do modulo */
  providers: [AppService],
  /* Exportacoes do modulo */
})
export class AppModule {}
/* Modulo de aplicacao */