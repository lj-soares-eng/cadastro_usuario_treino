import { validateEmailField, 
         validatePasswordField, 
         validateNameField, 
         validateConfirmPasswordField } from "./validators"

/* Tipo de dado para os valores do formulário de perfil */
export type ProfileFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

/* Tipo de dado para os erros do formulário de perfil */
export type FieldErrors = Partial<ProfileFormValues>

/* Tipo de dado para os erros do formulário de login */
export type LoginFieldErrors = Partial<Pick<ProfileFormValues, 'email' | 'password'>>

/* Tipo de dado para o modo de validação */
type ValidationMode = 'register' | 'edit'

/* Função para validar o formulário de perfil */
export function validateProfileForm(
  values: ProfileFormValues,
  mode: ValidationMode,
): FieldErrors {
  const errors: FieldErrors = {}
  const trimmedName = values.name.trim()
  const trimmedEmail = values.email.trim()
  const passwordRequired = mode === 'register'
  let passwordError: string | void = undefined;
  let confirmPasswordError: string | void = undefined;

  /* Validacao do nome */
  const nameError = validateNameField(trimmedName)

  /* Validacao do e-mail */
  const emailError = validateEmailField(trimmedEmail)


  /* Validacao da senha */
  if (passwordRequired || values.password) {
    passwordError = validatePasswordField(values.password)
  }

  /* Validacao da confirmacao de senha */
  if (passwordRequired || values.password || values.confirmPassword) {
    confirmPasswordError = validateConfirmPasswordField(values.confirmPassword, values.password)
  }

  if (nameError) {
    errors.name = nameError
  }
  if (emailError) {
    errors.email = emailError
  }   
  if (passwordError) {
    errors.password = passwordError
  }
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError
  }
  return errors
}

/* Função para validar o formulário de login */
export function validateLoginForm(
  email: string,
  password: string,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  const trimmedEmail = email.trim()
  let PasswordError: string | void = undefined;

  /* Validacao do e-mail */
  const loginEmailError = validateEmailField(trimmedEmail)

  /* Validacao da senha */
  PasswordError = validatePasswordField(password)

  if (loginEmailError) {
    errors.email = loginEmailError
  }

  if (PasswordError) {
    errors.password = PasswordError
  }
  return errors
}
