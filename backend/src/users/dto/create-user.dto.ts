import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
/* DTO para criacao de usuario */
export class CreateUserDto {
  /* Transformacao do nome */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsNotEmpty({ message: 'Informe o nome' })
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres' })
  @MaxLength(40, { message: 'O nome é longo demais' })
  name: string;

  /* Transformacao do email */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'Informe o e-mail' })
  @MaxLength(150, { message: 'E-mail longo demais' })
  email: string;

  /* Validacao da senha */
  @IsNotEmpty({ message: 'Informe a senha' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @MaxLength(20, { message: 'A senha é longa demais' })
  password: string;
}
