import type { FormEventHandler } from 'react'
import AuthTextField from './AuthTextField'
import { authSubmitClass } from '../authStyles'
import { NAME_MAX, type FieldErrors } from '../validation/profileForm'

type EditProfileFormProps = {
  name: string
  email: string
  password: string
  confirmPassword: string
  fieldErrors: FieldErrors
  isSubmitting: boolean
  onFieldChange: (
    field: 'name' | 'email' | 'password' | 'confirmPassword',
    value: string,
  ) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export default function EditProfileForm({
  name,
  email,
  password,
  confirmPassword,
  fieldErrors,
  isSubmitting,
  onFieldChange,
  onSubmit,
}: EditProfileFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <AuthTextField
        id="edit-name"
        label="Nome"
        name="name"
        autoComplete="name"
        value={name}
        onValueChange={(value) => onFieldChange('name', value)}
        error={fieldErrors.name}
        placeholder="Seu nome"
        maxLength={NAME_MAX + 10}
      />

      <AuthTextField
        id="edit-email"
        label="E-mail"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onValueChange={(value) => onFieldChange('email', value)}
        error={fieldErrors.email}
        placeholder="user@provider.com"
      />

      <AuthTextField
        id="edit-password"
        label="Nova senha (opcional)"
        type="password"
        name="password"
        autoComplete="new-password"
        value={password}
        onValueChange={(value) => onFieldChange('password', value)}
        error={fieldErrors.password}
        placeholder="Deixe em branco para manter"
      />

      <AuthTextField
        id="edit-confirm"
        label="Confirmar nova senha"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onValueChange={(value) => onFieldChange('confirmPassword', value)}
        error={fieldErrors.confirmPassword}
        placeholder="Repita a nova senha"
      />

      <button
        className={`${authSubmitClass} disabled:cursor-not-allowed disabled:opacity-60`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}
