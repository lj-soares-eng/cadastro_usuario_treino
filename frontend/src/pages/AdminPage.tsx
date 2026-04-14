import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { apiBase } from '../api/client'
import { fetchMe } from '../api/auth'
import AlertMessage from '../components/AlertMessage'

/* Tipo de payload de métricas */
type MetricsPayload = {
  timestamp: number
  activeAdminConnections: number
  cpuPercent: number
  memory: {
    heapUsed: number
    heapTotal: number
    rss: number
    systemUsed: number
    systemTotal: number
  }
  network: { rxBytesPerSec: number; txBytesPerSec: number } | null
}

/* Função para formatar bytes */
function formatBytes(n: number): string {
  if (n < 1024) {
    return `${Math.round(n)} B`
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KB`
  }
  if (n < 1024 * 1024 * 1024) {
    return `${(n / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/* Componente de página de administração */
export default function AdminPage() {
  /* Estado do componente */
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null)

  /* Efeito para buscar as métricas */
  useEffect(() => {
    let socket: Socket | null = null
    let cancelled = false

    /* Busca o usuário logado */
    void fetchMe()
      .then((me) => {
        if (cancelled) {
          return
        }
        if (me.role !== 'ADMIN') {
          navigate('/welcome', { replace: true })
          return
        }
        const base = apiBase()
        socket = io(`${base.replace(/\/$/, '')}/admin`, {
          path: '/socket.io/',
          withCredentials: true,
          transports: ['websocket', 'polling'],
        })
        /* Evento de erro de conexão */
        socket.on('connect_error', () => {
          setError('Não foi possível conectar ao painel em tempo real.')
        })
        /* Evento de métricas */
        socket.on('metrics', (payload: MetricsPayload) => {
          setMetrics(payload)
        })
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/login', { replace: true })
        }
      })

    return () => {
      cancelled = true
      socket?.disconnect()
    }
  }, [navigate])

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Painel admin</h1>
        <p className="admin-page-lede">
          Métricas da instância do servidor (WebSocket namespace{' '}
          <code className="admin-inline-code">/admin</code>).
        </p>
      </header>

      {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}

      {metrics ? (
        <ul className="admin-metrics-grid">
          <li className="admin-metric-card">
            <p className="admin-metric-label">Conexões admin (WS)</p>
            <p className="admin-metric-value">
              {metrics.activeAdminConnections}
            </p>
          </li>
          <li className="admin-metric-card">
            <p className="admin-metric-label">Uso de CPU (processo)</p>
            <p className="admin-metric-value">
              {metrics.cpuPercent.toFixed(1)}%
            </p>
          </li>
          <li className="admin-metric-card admin-metric-card--wide">
            <p className="admin-metric-label">Memória</p>
            <dl className="admin-desc-list">
              <div>
                <dt className="admin-desc-term">Heap usado</dt>
                <dd className="admin-desc-detail">
                  {formatBytes(metrics.memory.heapUsed)} /{' '}
                  {formatBytes(metrics.memory.heapTotal)}
                </dd>
              </div>
              <div>
                <dt className="admin-desc-term">RSS</dt>
                <dd className="admin-desc-detail">
                  {formatBytes(metrics.memory.rss)}
                </dd>
              </div>
              <div>
                <dt className="admin-desc-term">Sistema</dt>
                <dd className="admin-desc-detail">
                  {formatBytes(metrics.memory.systemUsed)} /{' '}
                  {formatBytes(metrics.memory.systemTotal)}
                </dd>
              </div>
            </dl>
          </li>
          <li className="admin-metric-card admin-metric-card--wide">
            <p className="admin-metric-label">Tráfego de rede (agregado)</p>
            {metrics.network ? (
              <dl className="admin-desc-list">
                <div>
                  <dt className="admin-desc-term">Recebido</dt>
                  <dd className="admin-desc-detail">
                    {formatBytes(metrics.network.rxBytesPerSec)}/s
                  </dd>
                </div>
                <div>
                  <dt className="admin-desc-term">Enviado</dt>
                  <dd className="admin-desc-detail">
                    {formatBytes(metrics.network.txBytesPerSec)}/s
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="admin-muted-paragraph">
                Métricas de rede indisponíveis neste ambiente.
              </p>
            )}
          </li>
        </ul>
      ) : (
        <p className="admin-loading-text">Carregando métricas…</p>
      )}

      <button
        type="button"
        className="btn-muted"
        onClick={() => navigate('/welcome')}
      >
        Voltar
      </button>
    </div>
  )
}
