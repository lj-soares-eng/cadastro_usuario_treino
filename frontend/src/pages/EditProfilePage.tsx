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

/* Expressão regular para validar o e-mail. */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Constante para o nome mínimo. */
const NAME_MIN = 2
/* Constante para o nome máximo. */
const NAME_MAX = 40
/* Constante para a senha mínima. */
const PASSWORD_MIN = 6
/* Constante para a senha máxima. */
const PASSWORD_MAX = 20

/* Tipo de dado para os erros de campo. */
type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

/* Função para validar os campos do formulário. */
function validateFields(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {}
  /* Variável para o nome trimado. */
  const trimmedName = name.trim()
  /* Variável para o e-mail trimado. */
  const trimmedEmail = email.trim()

  /* Se o nome não for informado, retorna um erro. */
  if (!trimmedName) {
    errors.name = 'Informe o nome'
    /* Se o nome for informado, mas tiver menos de NAME_MIN caracteres, retorna um erro. */
    } else if (trimmedName.length < NAME_MIN) {
    /* Se o nome for informado, mas tiver mais de NAME_MAX caracteres, retorna um erro. */
    errors.name = `O nome deve ter pelo menos ${NAME_MIN} caracteres`
    errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres`
  }

  /* Se o e-mail não for informado, retorna um erro. */
  if (!trimmedEmail) {
    errors.email = 'Informe o e-mail'
    /* Se o e-mail for informado, mas não for válido, retorna um erro. */
  } else if (!emailRe.test(trimmedEmail)) {
    errors.email = 'E-mail inválido'
  }

  /* Se a senha for informada, valida a senha. */
  if (password) {
    /* Se a senha for informada, mas tiver menos de PASSWORD_MIN caracteres, retorna um erro. */
    if (password.length < PASSWORD_MIN) {
      errors.password = `A senha deve ter pelo menos ${PASSWORD_MIN} caracteres`
    } else if (password.length > PASSWORD_MAX) {
      errors.password = `A senha deve ter no máximo ${PASSWORD_MAX} caracteres`
    }

    /* Se a senha de confirmação não for igual à senha, retorna um erro. */
    if (confirmPassword !== password) {
      errors.confirmPassword = 'As senhas não coincidem'
    }
    /* Se a senha de confirmação não for informada, retorna um erro. */
  } else if (confirmPassword) {
    errors.password = 'Preencha a senha para confirmar'
  }

  return errors
}

/* Função para aplicar o estilo de borda de erro. */
function fieldRingClass(hasError: boolean): string {
  /* Se o campo tiver erro, retorna o estilo de borda de erro. */
  return hasError
    ? 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'
    : ''
}

/* Função para renderizar o componente de edição de perfil. */
export default function EditProfilePage() {
  /* Variável para o navigate. */
  const navigate = useNavigate()
  /* Variável para o ID do usuário. */
  const [userId, setUserId] = useState<number | null>(null)
  /* Variável para o nome do usuário. */
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  /* Variável para a senha do usuário. */
  const [password, setPassword] = useState('')
  /* Variável para a confirmação da senha do usuário. */
  const [confirmPassword, setConfirmPassword] = useState('')
  /* Variável para o loading. */
  const [loading, setLoading] = useState(true)
  /* Variável para os erros de campo. */
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  /* Variável para o erro do formulário. */
  const [formError, setFormError] = useState<string | null>(null)
  /* Variável para o sucesso do formulário. */
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  /* Variável para o estado de submissão do formulário. */
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Efeito para buscar as informações do usuário logado. */
  useEffect(() => {
    /* Variável para o cancelled. */
    let cancelled = false
    /* Faz o fetch para buscar as informações do usuário logado. */
    void fetchMe()
      .then((user) => {
        /* Se o usuário foi cancelado, retorna. */
        if (cancelled) {
          return
        }
        /* Define o ID do usuário. */
        setUserId(user.id)
        /* Define o nome do usuário. */
        setName(user.name)
        /* Define o e-mail do usuário. */
        setEmail(user.email)
      })
      .catch(() => {
        /* Se o usuário foi cancelado, retorna. */
        if (!cancelled) {
          navigate('/login', { replace: true })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    /* Retorna uma função para cancelar a busca. */
    return () => {
      /* Define o cancelled como true. */
      cancelled = true
    }
  }, [navigate])

  /* Função para lidar com o envio do formulário. */
  function handleSubmit(e: FormEvent) {
    /* Previne o comportamento padrão do formulário. */
    e.preventDefault()
    /* Define o erro do formulário como null. */
    setFormError(null)
    /* Define o sucesso do formulário como null. */
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

    /* Define o estado de submissão do formulário como true. */
    setIsSubmitting(true)
    /* Faz o fetch para atualizar o usuário. */
    void updateUser(userId, {
      name: name.trim().replace(/\s+/g, ' '),
      email: email.trim(),
      password: password || undefined,
    })
      .then((updated) => {
        /* Define o nome do usuário. */
        setName(updated.name)
        /* Define o e-mail do usuário. */
        setEmail(updated.email)
        /* Define a senha do usuário como vazia. */
        setPassword('')
        /* Define a confirmação da senha do usuário como vazia. */
        setConfirmPassword('')
        /* Define o sucesso do formulário como 'Perfil atualizado com sucesso.'. */
        setSuccessMessage('Perfil atualizado com sucesso.')
      })
      .catch((err: unknown) => {
        /* Define o erro do formulário como 'Não foi possível atualizar.'. */
        const message =
          err instanceof Error ? err.message : 'Não foi possível atualizar.'
        setFormError(message)
      })
      .finally(() => {
        /* Define o estado de submissão do formulário como false. */
        setIsSubmitting(false)
      })
  }

  /* Se o loading for true, retorna o componente de loading. */
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

  /* Se o loading for false, retorna o componente de edição de perfil. */
  return (
    <div className={authShellClass}>
      <div className={`${authCardClass} max-w-105`}>
        /* Título da página. */
        <h1 className={authTitleClass}>Atualizar perfil</h1>
        /* Subtítulo da página. */
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
                /* Define o nome do usuário. */
                setName(e.target.value)
                /* Se o campo de nome tiver erro, define o erro como undefined. */
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              /* Placeholder do campo de nome. */
              placeholder="Seu nome"
              /* Max length do campo de nome. */
              maxLength={NAME_MAX + 10}
              /* Aria invalid do campo de nome. */
              aria-invalid={Boolean(fieldErrors.name)}
              /* Aria describedby do campo de nome. */
              aria-describedby={fieldErrors.name ? 'edit-name-error' : undefined}
            />
            {fieldErrors.name ? (
              /* Id do campo de nome. */
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
            /* Input do campo de e-mail. */
            <input
              id="edit-email"
              className={`${authInputClass} ${fieldRingClass(Boolean(fieldErrors.email))}`}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                /* Define o e-mail do usuário. */
                setEmail(e.target.value)
                /* Se o campo de e-mail tiver erro, define o erro como undefined. */
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }
              }}
              /* Placeholder do campo de e-mail. */
              placeholder="user@provider.com"
              /* Aria invalid do campo de e-mail. */
              aria-invalid={Boolean(fieldErrors.email)}
              /* Aria describedby do campo de e-mail. */
              aria-describedby={fieldErrors.email ? 'edit-email-error' : undefined}
            />
            {fieldErrors.email ? (
              /* Id do campo de e-mail. */
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
                /* Define a senha do usuário. */
                setPassword(e.target.value)
                /* Se o campo de senha tiver erro, define o erro como undefined. */
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              /* Placeholder do campo de nova senha. */
              placeholder="Deixe em branco para manter"
              /* Aria invalid do campo de nova senha. */
              aria-invalid={Boolean(fieldErrors.password)}
              /* Aria describedby do campo de nova senha. */
              aria-describedby={fieldErrors.password ? 'edit-password-error' : undefined}
            />
            {fieldErrors.password ? (
              /* Id do campo de nova senha. */
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
                /* Define a confirmação da senha do usuário. */
                setConfirmPassword(e.target.value)
                /* Se o campo de confirmação de senha tiver erro, define o erro como undefined. */
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }))
                }
              }}
              /* Placeholder do campo de confirmação de nova senha. */
              placeholder="Repita a nova senha"
              /* Aria invalid do campo de confirmação de nova senha. */
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              /* Aria describedby do campo de confirmação de nova senha. */
              aria-describedby={
                fieldErrors.confirmPassword ? 'edit-confirm-error' : undefined
              }
            />
            {fieldErrors.confirmPassword ? (
              /* Id do campo de confirmação de nova senha. */
              <p id="edit-confirm-error" className="text-sm text-red-600 dark:text-red-400">
                {fieldErrors.confirmPassword}
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
            {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>

        <p className={authFooterClass}>
          <Link className={authLinkClass} to="/welcome">
            Voltar para a tela inicial
          </Link>
        </p>
      </div>
      /* Fim do formulário. */
    </div>
  )
}
