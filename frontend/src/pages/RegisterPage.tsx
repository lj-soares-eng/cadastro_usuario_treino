import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage'
import AuthTextField from '../components/AuthTextField'
import { registerUser } from '../api/users'
import {
  type FieldErrors,
  validateProfileForm,
} from '../validation/profileForm'
import { NAME_MAX } from '../validation/validators'

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
/* Funcao para atualizar o campo */
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

  /* Funcao para submeter o formulario */
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

    /* Setando o estado de submissao */
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
    <div className="auth-shell">
      <div className="auth-card max-w-105">
        <h1 className="auth-title">Registrar-se</h1>
        <p className="auth-subtitle">
          Preencha os dados para criar sua conta.
        </p>

        {/* Mensagem de sucesso */}
        {successMessage ? (
          <AlertMessage variant="success">
            {successMessage}{' '}
            <Link className="auth-link" to="/login">
              Ir para o login
            </Link>
          </AlertMessage>
        ) : null}

        {/* Mensagem de erro */}
        {formError ? (
          <AlertMessage variant="error">{formError}</AlertMessage>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {/* Campo de nome */}
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

          {/* Campo de e-mail */}
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

          {/* Campo de senha */}
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

          {/* Campo de confirmar senha */}
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

          {/* Botao de criar conta */}
          <button
            className="btn-primary is-disabled"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cadastrando…' : 'Criar conta'}
          </button>
        </form>

        {/* Link para a pagina de login */}
        <p className="auth-footer">
          Já tem conta? <Link className="auth-link" to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
