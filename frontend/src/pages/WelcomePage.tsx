import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe, logoutRequest } from '../api/auth'
import { deleteUser } from '../api/users'
import AlertMessage from '../components/AlertMessage'

/* Pagina de boas vindas */
export default function WelcomePage() {
  /* Estados */
  const navigate = useNavigate()
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  /* Efeito para buscar o usuario logado */
  useEffect(() => {
    let cancelled = false
    void fetchMe()
      .then((u) => {
        if (!cancelled) {
          setUserId(u.id)
          setUserName(u.name)
        }
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

  /* Funcao para logout */
  async function handleLogout() {
    try {
      await logoutRequest()
    } catch {
      // mesmo com falha na API, segue para o login (cookie pode já ter expirado)
    }
    navigate('/login')
  }

  /* Funcao para deletar a conta */
  function handleDeleteAccount() {
    if (userId === null || isDeleting) {
      return
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
    )
    if (!confirmed) {
      return
    }

    setFormError(null)
    setIsDeleting(true)
    void deleteUser(userId)
      .then(() => {
        navigate('/login', { replace: true })
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Não foi possível excluir a conta.'
        setFormError(message)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  /* Renderizacao do componente */
  if (loading || userName === null) {
    return (
      <div className="auth-shell">
        <div className="auth-card max-w-lg">
          <p className="text-muted-center">
            Carregando…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-card max-w-lg">
        {/* Titulo da pagina */}
        <h1 className="auth-title">Bem vindo, {userName}!</h1>
        {/* Mensagem de erro */}
        {formError ? (
          <AlertMessage variant="error">{formError}</AlertMessage>
        ) : null}
        <div className="mt-6 flex flex-col gap-3">
          {/* Botao de editar perfil */}
          <button
            className="btn-primary"
            onClick={() => navigate('/profile/edit')}
            type="button"
          >
            Editar perfil
          </button>
          {/* Botao de deletar conta */}
          <button
            className="btn-danger is-disabled"
            onClick={handleDeleteAccount}
            type="button"
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo conta…' : 'Deletar conta'}
          </button>
          {/* Botao de sair */}
          <button
            className="btn-muted"
            onClick={() => void handleLogout()}
            type="button"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
