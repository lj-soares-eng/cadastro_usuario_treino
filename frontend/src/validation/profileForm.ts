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

/* Tipo de dado para as regras de validação */
type Rule = {test: boolean, message: string}

/* Função auxiliar para pegar o primeiro erro de uma lista de regras*/ 
function getFirstError(rules: Rule[]): string | undefined{
  return rules.find(rule => rule.test)?.message
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
  errors.name = getFirstError([
    {test: !trimmedName, message: `Informe o nome`},
    {test: trimmedName.length < NAME_MIN, message: `Mínimo de ${NAME_MIN} caracteres`},
    {test: trimmedName.length > NAME_MAX, message: `Máximo de ${NAME_MAX} caracteres`}
  ])

  /* Validacao do e-mail */
  errors.email = getFirstError([
    {test: !trimmedEmail, message: `Informe o e-mail`},
    {test: !EMAIL_RE.test(trimmedEmail), message: `E-mail inválido`}
  ])

  /* Validacao da senha */
  errors.password = getFirstError([
    {test: !values.password, message: `Informe a senha`},
    {test: values.password.length < PASSWORD_MIN, message: `Mínimo de ${PASSWORD_MIN} caracteres`},
    {test: values.password.length > PASSWORD_MAX, message: `Máximo de ${PASSWORD_MAX} caracteres`}
  ])

  /* Validacao da confirmacao de senha */
  if (passwordRequired || values.password || values.confirmPassword) {
    errors.confirmPassword = getFirstError([
      {test: !values.confirmPassword, message: passwordRequired ? `Confirme a senha` : `Confirme a nova senha`},
      {test: values.confirmPassword !== values.password, message: `As senhas não coincidem`}
    ])
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
  errors.email = getFirstError([
    {test: !trimmedEmail, message: `Informe o e-mail`},
    {test: !EMAIL_RE.test(trimmedEmail), message: `E-mail inválido`}
  ])

  /* Validacao da senha */
  errors.password = getFirstError([
    {test: !password, message: `Informe a senha`},
    {test: password.length < PASSWORD_MIN, message: `Mínimo de ${PASSWORD_MIN} caracteres`},
    {test: password.length > PASSWORD_MAX, message: `Máximo de ${PASSWORD_MAX} caracteres`}
  ])

  return errors
}
