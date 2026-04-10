export function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
}

/** Fetch para a API com cookies (JWT httpOnly). */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: 'include',
  })
}

export function formatApiError(data: { message?: string | string[] }): string {
  const { message } = data
  if (Array.isArray(message)) {
    return message[0] ?? 'Não foi possível validar os dados.'
  }
  if (typeof message === 'string') {
    return message
  }
  return 'Algo deu errado. Tente novamente.'
}
