import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe } from '../api/auth'
import { updateUser } from '../api/users'
import {
  type FieldErrors,
  validateProfileForm,
} from './profileForm'

type EditableField = 'name' | 'email' | 'password' | 'confirmPassword'

export function useEditProfileForm() {
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

  function onFieldChange(field: EditableField, value: string) {
    switch (field) {
      case 'name':
        setName(value)
        break
      case 'email':
        setEmail(value)
        break
      case 'password':
        setPassword(value)
        break
      case 'confirmPassword':
        setConfirmPassword(value)
        break
    }

    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const errors = validateProfileForm(
      { name, email, password, confirmPassword },
      'edit',
    )
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
