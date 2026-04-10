import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe, logoutRequest } from '../api/auth'
import { authCardClass, authShellClass, authSubmitClass, authTitleClass } from '../authStyles'

export default function WelcomePage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void fetchMe()
      .then((u) => {
        if (!cancelled) {
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

  async function handleLogout() {
    try {
      await logoutRequest()
    } catch {
      // mesmo com falha na API, segue para o login (cookie pode já ter expirado)
    }
    navigate('/login')
  }

  if (loading || userName === null) {
    return (
      <div className={authShellClass}>
        <div className={`${authCardClass} max-w-lg`}>
          <p className="text-center text-[#5a6272] dark:text-[#9aa3b5]">
            Carregando…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={authShellClass}>
      <div className={`${authCardClass} max-w-lg`}>
        <h1 className={authTitleClass}>Bem vindo, {userName}!</h1>
        <div className="mt-6 flex flex-col gap-3">
          <button
            className={authSubmitClass}
            onClick={() => navigate('/profile/edit')}
            type="button"
          >
            Editar perfil
          </button>
          <button
            className={`${authSubmitClass} bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400`}
            type="button"
          >
            Deletar conta
          </button>
          <button
            className={`${authSubmitClass} bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400`}
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
