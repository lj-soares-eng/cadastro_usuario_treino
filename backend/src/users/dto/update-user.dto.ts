import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
/* DTO para atualizacao de usuario */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
