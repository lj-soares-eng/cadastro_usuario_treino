import { Link } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage'
import {
  authCardClass,
  authFooterClass,
  authLinkClass,
  authShellClass,
  authSubtitleClass,
  authTitleClass,
} from '../authStyles'
import EditProfileForm from './EditProfile/EditProfileForm'
import { useEditProfileForm } from './EditProfile/useEditProfile'

export default function EditProfile() {
  const {
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
  } = useEditProfileForm()

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
          <AlertMessage variant="success">{successMessage}</AlertMessage>
        ) : null}
        {formError ? <AlertMessage variant="error">{formError}</AlertMessage> : null}

        <EditProfileForm
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          fieldErrors={fieldErrors}
          isSubmitting={isSubmitting}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
        />

        <p className={authFooterClass}>
          <Link className={authLinkClass} to="/welcome">
            Voltar para a tela inicial
          </Link>
        </p>
      </div>
    </div>
  )
}
