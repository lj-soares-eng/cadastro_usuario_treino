export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const NAME_MIN = 2
export const NAME_MAX = 40
export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 20

export type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export type LoginFieldErrors = {
  email?: string
  password?: string
}

export type ProfileFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type ValidationMode = 'register' | 'edit'

export function validateProfileForm(
  values: ProfileFormValues,
  mode: ValidationMode,
): FieldErrors {
  const errors: FieldErrors = {}
  const trimmedName = values.name.trim()
  const trimmedEmail = values.email.trim()
  const passwordRequired = mode === 'register'

  if (!trimmedName) {
    errors.name = 'Informe o nome'
  } else if (trimmedName.length < NAME_MIN) {
    errors.name = `O nome deve ter pelo menos ${NAME_MIN} caracteres`
  } else if (trimmedName.length > NAME_MAX) {
    errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres`
  }

  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  if (passwordRequired || values.password) {
    if (!values.password) {
      errors.password = 'Informe a senha'
    } else if (values.password.length < PASSWORD_MIN) {
      errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
    } else if (values.password.length > PASSWORD_MAX) {
      errors.password = `A senha deve ter no máximo ${PASSWORD_MAX} caracteres`
    }
  }

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

export function validateLoginForm(
  email: string,
  password: string,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  if (!password) {
    errors.password = 'Informe a senha'
  } else if (password.length < PASSWORD_MIN) {
    errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
  }

  return errors
}
