import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
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

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = {
  email?: string
  password?: string
}

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!emailRe.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  if (!password) {
    errors.password = 'Informe a senha'
  } else if (password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres'
  }

  return errors
}

function fieldRingClass(hasError: boolean): string {
  return hasError
    ? 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'
    : ''
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const errors = validateFields(email, password)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    void loginRequest({ email: email.trim(), password })
      .then(() => {
        navigate('/welcome')
        setPassword('')
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Não foi possível entrar.'
        setFormError(message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <div className={authShellClass}>
      <div className={`${authCardClass} max-w-md`}>
        <h1 className={authTitleClass}>Entrar</h1>
        <p className={authSubtitleClass}>Acesse com seu e-mail e senha.</p>

        {formError ? (
          <p
            className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="login-email"
            >
              E-mail
            </label>
            <input
              id="login-email"
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
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            />
            {fieldErrors.email ? (
              <p id="login-email-error" className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="login-password"
            >
              Senha
            </label>
            <input
              id="login-password"
              className={`${authInputClass} ${fieldRingClass(Boolean(fieldErrors.password))}`}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              placeholder="••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'login-password-error' : undefined
              }
            />
            {fieldErrors.password ? (
              <p
                id="login-password-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <button
            className={`${authSubmitClass} disabled:cursor-not-allowed disabled:opacity-60`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className={authFooterClass}>
          Não tem uma conta? <Link className={authLinkClass} to="/register">Registrar-se</Link>
        </p>
      </div>
    </div>
  )
}
