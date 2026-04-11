import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

/* Modulo de usuarios */
@Module({
  /* Controllers de usuarios */
  controllers: [UsersController],
  /* Servicos de usuarios */
  providers: [UsersService],
  /* Exportacao do modulo de usuarios */
})
export class UsersModule {}
