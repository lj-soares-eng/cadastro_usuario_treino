import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage'
import AuthTextField from '../components/AuthTextField'
import { registerUser } from '../api/users'
import {
  authCardClass,
  authFooterClass,
  authLinkClass,
  authShellClass,
  authSubmitClass,
  authSubtitleClass,
  authTitleClass,
} from '../authStyles'
import {
  NAME_MAX,
  type FieldErrors,
  validateProfileForm,
} from '../validation/profileForm'

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

  function updateField<K extends keyof FieldErrors>(
    value: string,
    setValue: (next: string) => void,
    key: K,
  ) {
    setValue(value)
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const errors = validateProfileForm(
      { name, email, password, confirmPassword },
      'register',
    )
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

        {successMessage ? (
          <AlertMessage variant="success">
            {successMessage}{' '}
            <Link className={authLinkClass} to="/login">
              Ir para o login
            </Link>
          </AlertMessage>
        ) : null}

        {formError ? (
          <AlertMessage variant="error">{formError}</AlertMessage>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <AuthTextField
            id="register-name"
            label="Nome"
            name="name"
            autoComplete="name"
            value={name}
            onValueChange={(value) => updateField(value, setName, 'name')}
            error={fieldErrors.name}
            placeholder="Seu nome"
            maxLength={NAME_MAX + 10}
          />

          <AuthTextField
            id="register-email"
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onValueChange={(value) => updateField(value, setEmail, 'email')}
            error={fieldErrors.email}
            placeholder="user@provider.com"
          />

          <AuthTextField
            id="register-password"
            label="Senha"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onValueChange={(value) => updateField(value, setPassword, 'password')}
            error={fieldErrors.password}
            placeholder="Mínimo 6 caracteres"
          />

          <AuthTextField
            id="register-confirm"
            label="Confirmar senha"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onValueChange={(value) =>
              updateField(value, setConfirmPassword, 'confirmPassword')
            }
            error={fieldErrors.confirmPassword}
            placeholder="Repita a senha"
          />

          <button
            className={`${authSubmitClass} disabled:cursor-not-allowed disabled:opacity-60`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cadastrando…' : 'Criar conta'}
          </button>
        </form>

        <p className={authFooterClass}>
          Já tem conta? <Link className={authLinkClass} to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
