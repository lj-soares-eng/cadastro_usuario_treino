import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

/* DTO para login */
export class LoginDto {
  /* Transformacao do email */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  /* Validacao do email */
  @IsEmail({}, { message: 'E-mail inválido' })
  /* Validacao do campo obrigatorio */
  @IsNotEmpty({ message: 'Informe o e-mail' })
  email: string;

  /* Senha */
  @IsNotEmpty({ message: 'Informe a senha' })
  /* Validacao do campo minimo de caracteres */
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  /* Senha */
  password: string;

  @IsOptional()
  @IsIn(['web', 'api'], {
    message: 'clientType deve ser web ou api',
  })
  clientType?: 'web' | 'api';
}
