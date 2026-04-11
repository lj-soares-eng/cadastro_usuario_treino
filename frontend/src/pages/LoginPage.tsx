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

/* Expressão regular para validar o e-mail. */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Tipo para os erros dos campos. */
type FieldErrors = {
  email?: string
  password?: string
}

/* Função para validar os campos. */
function validateFields(email: string, password: string): FieldErrors {
  /* Inicializa o objeto de erros. */
  const errors: FieldErrors = {}
  /* Remove os espaços em branco do e-mail. */
  const trimmedEmail = email.trim()
  /* Se o e-mail estiver vazio, define o erro como 'Informe o e-mail'. */

  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
  } /* Se o e-mail não for válido, define o erro como 'E-mail inválido'. */
  else if (!emailRe.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  /* Se a senha estiver vazia, define o erro como 'Informe a senha'. */
  if (!password) {
    errors.password = 'Informe a senha'
  } /* Se a senha tiver menos de 6 caracteres, define o erro como 'A senha deve ter pelo menos 6 caracteres'. */
  else if (password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres'
  }

  return errors
}

/* Função para definir a classe do campo de erro. */
function fieldRingClass(hasError: boolean): string {
  /* Se o campo tiver erro, define a classe como 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'. */
  return hasError
    ? 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'
    : ''
}

/* Função para renderizar o componente de login. */
export default function LoginPage() {
  /* Navegação para a página de welcome. */
  const navigate = useNavigate()
  /* Estado para o e-mail. */
  const [email, setEmail] = useState('')
  /* Estado para a senha. */
  const [password, setPassword] = useState('')
  /* Estado para os erros dos campos. */
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
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

    const errors = validateFields(email, password)
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
    <div className={authShellClass}>
      <div className={`${authCardClass} max-w-md`}>
        <h1 className={authTitleClass}>Entrar</h1>
        <p className={authSubtitleClass}>Acesse com seu e-mail e senha.</p>

        {formError ? (
          /* P para exibir o erro. */
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
                /* Define o e-mail. */
                setEmail(e.target.value)
                /* Se houver erro, limpa o erro. */
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }
              }}
              /* Placeholder do input de e-mail. */
              placeholder="user@provider.com"
              /* Aria invalid do input de e-mail. */
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
                /* Se houver erro, limpa o erro. */
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              /* Placeholder do input de senha. */
              placeholder="••••••"
              /* Aria invalid do input de senha. */
              aria-invalid={Boolean(fieldErrors.password)}
              /* Aria describedby do input de senha. */
              aria-describedby={
                fieldErrors.password ? 'login-password-error' : undefined
              }
            />
            {fieldErrors.password ? (
              /* P para exibir o erro. */
              <p
                id="login-password-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <button
            /* Estilo do botão de submissão do formulário. */
            className={`${authSubmitClass} disabled:cursor-not-allowed disabled:opacity-60`}
            /* Tipo do botão de submissão do formulário. */
            type="submit"
            /* Desabilita o botão de submissão do formulário se o estado de submissão for true. */
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
    /* Fim do formulário. */
  )
}
