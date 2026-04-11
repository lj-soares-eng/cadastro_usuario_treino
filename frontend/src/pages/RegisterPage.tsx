import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../api/users'
import {
  authCardClass,
  authFooterClass,
  authInputClass,
  authLinkClass,
  authShellClass,
  authSubmitClass,
  authSubtitleClass,
  authTitleClass,
} from '../authStyles'
/* Validacoes de campos */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NAME_MIN = 2
const NAME_MAX = 40
const PASSWORD_MIN = 6
const PASSWORD_MAX = 20
/* Tipos de erros */
type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}
/* Validacao de campos */
function validateFields(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {}
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  /* Validacao de nome */
  if (!trimmedName) {
    errors.name = 'Informe o nome'
  } else if (trimmedName.length < NAME_MIN) {
    errors.name = `O nome deve ter pelo menos ${NAME_MIN} caracteres`
  } else if (trimmedName.length > NAME_MAX) {
    errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres`
  }

  /* Validacao de email */
  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!emailRe.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  /* Validacao de senha */
  if (!password) {
    errors.password = 'Informe a senha'
  } else if (password.length < PASSWORD_MIN) {
    errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
  } else if (password.length > PASSWORD_MAX) {
    errors.password = `A senha deve ter no máximo ${PASSWORD_MAX} caracteres`
  }

  /* Validacao de confirmacao de senha */
  if (!confirmPassword) {
    errors.confirmPassword = 'Confirme a senha'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'As senhas não coincidem'
  }

  return errors
}

/* Classe de borda para campos com erro */
function fieldRingClass(hasError: boolean): string {
  return hasError
    ? 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'
    : ''
}

/* Pagina de registro */
export default function RegisterPage() {
  /* Estados */
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Funcao de submit do formulario */
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const errors = validateFields(name, email, password, confirmPassword)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    void registerUser({
      name: name.trim().replace(/\s+/g, ' '),
      email: email.trim(),
      password,
    })
      .then(() => {
        setSuccessMessage('Conta criada com sucesso. Você já pode entrar.')
        setPassword('')
        setConfirmPassword('')
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Não foi possível cadastrar.'
        setFormError(message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  /* Renderizacao do componente */
  return (
    <div className={authShellClass}>
      <div className={`${authCardClass} max-w-105`}>
        <h1 className={authTitleClass}>Registrar-se</h1>
        <p className={authSubtitleClass}>
          Preencha os dados para criar sua conta.
        </p>

        {/* Mensagem de sucesso */}
        {successMessage ? (
          <p
            className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200"
            role="status"
          >
            {successMessage}{' '}
            <Link className={authLinkClass} to="/login">
              Ir para o login
            </Link>
          </p>
        ) : null}

        {/* Mensagem de erro */}
        {formError ? (
          <p
            className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        {/* Formulario de registro */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {/* Campo de nome */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="register-name"
            >
              Nome
            </label>
            {/* Campo de nome */}
            <input
              id="register-name"
              className={`${authInputClass} ${fieldRingClass(Boolean(fieldErrors.name))}`}
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              placeholder="Seu nome"
              maxLength={NAME_MAX + 10}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
            />
            {fieldErrors.name ? (
              <p id="register-name-error" className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          {/* Campo de email */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="register-email"
            >
              E-mail
            </label>
            <input
              id="register-email"
              className={`${authInputClass} ${fieldRingClass(Boolean(fieldErrors.email))}`}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }
              }}
              placeholder="user@provider.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? 'register-email-error' : undefined
              }
            />
            {fieldErrors.email ? (
              <p
                id="register-email-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          {/* Campo de senha */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="register-password"
            >
              Senha
            </label>
            <input
              id="register-password"
              className={`${authInputClass} ${fieldRingClass(Boolean(fieldErrors.password))}`}
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              placeholder="Mínimo 6 caracteres"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'register-password-error' : undefined
              }
            />
            {fieldErrors.password ? (
              <p
                id="register-password-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {/* Campo de confirmacao de senha */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="register-confirm"
            >
              Confirmar senha
            </label>
            <input
              id="register-confirm"
              className={`${authInputClass} ${fieldRingClass(Boolean(fieldErrors.confirmPassword))}`}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }))
                }
              }}
              placeholder="Repita a senha"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? 'register-confirm-error'
                  : undefined
              }
            />
            {fieldErrors.confirmPassword ? (
              <p
                id="register-confirm-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          {/* Botao de submit */}
          <button
            className={`${authSubmitClass} disabled:cursor-not-allowed disabled:opacity-60`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cadastrando…' : 'Criar conta'}
          </button>
        </form>

        {/* Link de login */}
        <p className={authFooterClass}>
          Já tem conta? <Link className={authLinkClass} to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
