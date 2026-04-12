import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe } from '../api/auth'
import { updateUser } from '../api/users'
import {
  type FieldErrors,
  validateProfileForm,
} from './profileForm'

/* Tipo de dado para os campos editaveis */
type EditableField = 'name' | 'email' | 'password' | 'confirmPassword'

/* Hook para o formulário de edição de perfil */
export function useEditProfileForm() {
  /* Navegação */
  const navigate = useNavigate()
  /* Estado para o id do usuário */
  const [userId, setUserId] = useState<number | null>(null)
  /* Estado para o nome */
  const [name, setName] = useState('')
  /* Estado para o e-mail */
  const [email, setEmail] = useState('')
  /* Estado para a senha */
  const [password, setPassword] = useState('')
  /* Estado para a confirmação de senha */
  const [confirmPassword, setConfirmPassword] = useState('')
  /* Estado para o carregamento */
  const [loading, setLoading] = useState(true)
  /* Estado para os erros dos campos */
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  /* Estado para o erro do formulário */
  const [formError, setFormError] = useState<string | null>(null)
  /* Estado para a mensagem de sucesso */
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  /* Estado para o envio do formulário */
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Efeito para buscar o usuário logado */
  useEffect(() => {
    let cancelled = false

    /* Busca o usuário logado */
    void fetchMe()
      .then((user) => {
        /* Se o usuário foi cancelado, retorna */
        if (cancelled) {
          return
        }
        /* Define o id do usuário */
        setUserId(user.id)
        /* Define o nome do usuário */
        setName(user.name)
        /* Define o e-mail do usuário */
        setEmail(user.email)
      })
      .catch(() => {
        /* Se o usuário foi cancelado, redireciona para a página de login */
        if (!cancelled) {
          navigate('/login', { replace: true })
        }
      })
      .finally(() => {
        /* Se o usuário foi cancelado, define o carregamento como false */
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  /* Função para mudar o valor de um campo */
  function onFieldChange(field: EditableField, value: string) {
    /* Switch para mudar o valor de um campo */
    switch (field) {
      /* Mudar o valor do nome */
      case 'name':
        setName(value)
        break
      /* Mudar o valor do e-mail */
      case 'email':
        setEmail(value)
        break
      /* Mudar o valor da senha */
      case 'password':
        setPassword(value)
        break
      /* Mudar o valor da confirmação de senha */
      case 'confirmPassword':
        setConfirmPassword(value)
        break
    }

    /* Se o campo tem erro, limpa o erro */
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /* Função para submeter o formulário */
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    /* Limpa a mensagem de sucesso */
    setSuccessMessage(null)

    /* Valida o formulário */
    const errors = validateProfileForm(
      { name, email, password, confirmPassword },
      'edit',
    )
    /* Define os erros */
    setFieldErrors(errors)
    /* Se o formulário tem erro, retorna */
    if (Object.keys(errors).length > 0) {
      return
    }

    /* Se o id do usuário é null, define o erro */
    if (userId === null) {
      setFormError('Não foi possível identificar o usuário logado.')
      return
    }

    /* Define o envio do formulário como true */
    setIsSubmitting(true)
    /* Atualiza o usuário */
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

  return {
    loading,
    name,
    email,
    password,
    confirmPassword,
    fieldErrors,
    formError,
    successMessage,
    isSubmitting,
    onFieldChange,
    handleSubmit,
  }
}
