import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchMe } from '../api/auth'
import { updateUser } from '../api/users'
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

const NAME_MIN = 2
const NAME_MAX = 40
const PASSWORD_MIN = 6
const PASSWORD_MAX = 20

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validateFields(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {}
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()

  if (!trimmedName) {
    errors.name = 'Informe o nome'
  } else if (trimmedName.length < NAME_MIN) {
    errors.name = `O nome deve ter pelo menos ${NAME_MIN} caracteres`
  } else if (trimmedName.length > NAME_MAX) {
    errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres`
  }

  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } else if (!emailRe.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  if (password) {
    if (password.length < PASSWORD_MIN) {
      errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
    } else if (password.length > PASSWORD_MAX) {
      errors.password = `A senha deve ter no máximo ${PASSWORD_MAX} caracteres`
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = 'As senhas não coincidem'
    }
  } else if (confirmPassword) {
    errors.password = 'Preencha a senha para confirmar'
  }

  return errors
}

function fieldRingClass(hasError: boolean): string {
  return hasError
    ? 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'
    : ''
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchMe()
      .then((user) => {
        if (cancelled) {
          return
        }
        setUserId(user.id)
        setName(user.name)
        setEmail(user.email)
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/login', { replace: true })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const errors = validateFields(name, email, password, confirmPassword)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    if (userId === null) {
      setFormError('Não foi possível identificar o usuário logado.')
      return
    }

    setIsSubmitting(true)
    void updateUser(userId, {
      name: name.trim().replace(/\s+/g, ' '),
      email: email.trim(),
      password: password || undefined,
    })
      .then((updated) => {
        setName(updated.name)
        setEmail(updated.email)
        setPassword('')
        setConfirmPassword('')
        setSuccessMessage('Perfil atualizado com sucesso.')
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Não foi possível atualizar.'
        setFormError(message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  if (loading) {
    return (
      <div className={authShellClass}>
        <div className={`${authCardClass} max-w-105`}>
          <p className="text-center text-[#5a6272] dark:text-[#9aa3b5]">
            Carregando…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={authShellClass}>
      <div className={`${authCardClass} max-w-105`}>
        <h1 className={authTitleClass}>Atualizar perfil</h1>
        <p className={authSubtitleClass}>
          Atualize nome, e-mail e, se quiser, sua senha.
        </p>

        {successMessage ? (
          <p
            className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

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
              htmlFor="edit-name"
            >
              Nome
            </label>
            <input
              id="edit-name"
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
              aria-describedby={fieldErrors.name ? 'edit-name-error' : undefined}
            />
            {fieldErrors.name ? (
              <p id="edit-name-error" className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="edit-email"
            >
              E-mail
            </label>
            <input
              id="edit-email"
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
              aria-describedby={fieldErrors.email ? 'edit-email-error' : undefined}
            />
            {fieldErrors.email ? (
              <p id="edit-email-error" className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="edit-password"
            >
              Nova senha (opcional)
            </label>
            <input
              id="edit-password"
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
              placeholder="Deixe em branco para manter"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'edit-password-error' : undefined}
            />
            {fieldErrors.password ? (
              <p
                id="edit-password-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
              htmlFor="edit-confirm"
            >
              Confirmar nova senha
            </label>
            <input
              id="edit-confirm"
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
              placeholder="Repita a nova senha"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword ? 'edit-confirm-error' : undefined
              }
            />
            {fieldErrors.confirmPassword ? (
              <p id="edit-confirm-error" className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <button
            className={`${authSubmitClass} disabled:cursor-not-allowed disabled:opacity-60`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>

        <p className={authFooterClass}>
          <Link className={authLinkClass} to="/welcome">
            Voltar para a tela inicial
          </Link>
        </p>
      </div>
    </div>
  )
}
