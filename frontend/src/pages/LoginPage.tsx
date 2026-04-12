import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
import AlertMessage from '../components/AlertMessage'
import AuthTextField from '../components/AuthTextField'
import {
  type LoginFieldErrors,
  validateLoginForm,
} from '../validation/profileForm'

/* Função para renderizar o componente de login. */
export default function LoginPage() {
  /* Navegação para a página de welcome. */
  const navigate = useNavigate()
  /* Estado para o e-mail. */
  const [email, setEmail] = useState('')
  /* Estado para a senha. */
  const [password, setPassword] = useState('')
  /* Estado para os erros dos campos. */
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  /* Estado para o erro do formulário. */
  const [formError, setFormError] = useState<string | null>(null)
  /* Estado para o estado de submissão do formulário. */
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Função para lidar com o envio do formulário. */
  function handleSubmit(e: FormEvent) {
    /* Previne o comportamento padrão do formulário. */
    e.preventDefault()
    /* Limpa o erro do formulário. */
    setFormError(null)
    /* Valida os campos. */

    const errors = validateLoginForm(email, password)
    /* Define os erros dos campos. */
    setFieldErrors(errors)
    /* Se houver erros, retorna. */
    if (Object.keys(errors).length > 0) {
      return
    }

    /* Define o estado de submissão como true. */
    setIsSubmitting(true)
    /* Faz o login. */
    void loginRequest({ email: email.trim(), password })
      .then(() => {
        /* Redireciona para a página de welcome. */
        navigate('/welcome')
        /* Limpa a senha. */
        setPassword('')
      })
      .catch((err: unknown) => {
        /* Define o erro do formulário. */
        const message =
          err instanceof Error ? err.message : 'Não foi possível entrar.'
        setFormError(message)
      })
      /* Finaliza o estado de submissão. */
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    /* Shell do formulário. */
    <div className="auth-shell">
      <div className="auth-card max-w-md">
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-subtitle">Acesse com seu e-mail e senha.</p>

        {/* Mensagem de erro */}
        {formError ? (
          <AlertMessage variant="error">{formError}</AlertMessage>
        ) : null}
        {/* Formulario de login */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

          {/* Campo de e-mail */}
          <AuthTextField
            id="login-email"
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onValueChange={(value) => {
              setEmail(value)
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }))
              }
            }}
            error={fieldErrors.email}
            placeholder="user@provider.com"
          />

          {/* Campo de senha */}
          <AuthTextField
            id="login-password"
            label="Senha"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onValueChange={(value) => {
              setPassword(value)
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
            error={fieldErrors.password}
            placeholder="••••••"
          />

          {/* Botao de login */}
          <button
            className="btn-primary is-disabled"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem uma conta? <Link className="auth-link" to="/register">Registrar-se</Link>
        </p>
      </div>
    </div>
  )
}
