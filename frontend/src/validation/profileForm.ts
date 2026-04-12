/* Expressão regular para validar e-mail */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Valores mínimos e máximos para nome e senha */
export const NAME_MIN = 2
export const NAME_MAX = 40
export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 20

/* Tipo de dado para os erros do formulário de perfil */
export type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

/* Tipo de dado para os erros do formulário de login */
export type LoginFieldErrors = {
  email?: string
  password?: string
}

/* Tipo de dado para os valores do formulário de perfil */
export type ProfileFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

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

  /* Validacao do nome */
  if (!trimmedName) {
    errors.name = 'Informe o nome'
  } else if (trimmedName.length < NAME_MIN) {
    errors.name = `O nome deve ter pelo menos ${NAME_MIN} caracteres`
  } else if (trimmedName.length > NAME_MAX) {
    errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres`
  }

  /* Validacao do e-mail */
  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  /* Validacao da senha */
  if (passwordRequired || values.password) {
    if (!values.password) {
      errors.password = 'Informe a senha'
    } else if (values.password.length < PASSWORD_MIN) {
      errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
    } else if (values.password.length > PASSWORD_MAX) {
      errors.password = `A senha deve ter no máximo ${PASSWORD_MAX} caracteres`
    }
  }

  /* Validacao da confirmacao de senha */
  if (passwordRequired || values.password || values.confirmPassword) {
    if (!values.confirmPassword) {
      errors.confirmPassword = passwordRequired
        ? 'Confirme a senha'
        : 'Confirme a nova senha'
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'As senhas não coincidem'
    }
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

  /* Validacao do e-mail */
  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  /* Validacao da senha */
  if (!password) {
    errors.password = 'Informe a senha'
  } else if (password.length < PASSWORD_MIN) {
    errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
  }

  return errors
}
