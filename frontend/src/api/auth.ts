import { apiFetch, formatApiError } from './client'

// Tipo de dado para o login
export type LoginPayload = {
  email: string
  password: string
}

// Tipo de dado para o sucesso do login
export type LoginSuccess = {
  user: {
    id: number
    name: string
    email: string
  }
}

// Função para fazer o login
export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginSuccess> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      formatApiError(data as { message?: string | string[] }),
    )
  }

  return data as LoginSuccess
}

/* Tipo de dado para a resposta do login. Uma vez feito o login, o token é armazenado em cookie.
Essa função é usada para buscar as informações do usuário logado.*/
export type MeResponse = {
  id: number
  name: string
  email: string
}

/* Função para buscar no backend as informações do usuário logado. */
export async function fetchMe(): Promise<MeResponse> {
  const res = await apiFetch('/auth/me')
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      formatApiError(data as { message?: string | string[] }),
    )
  }
  return data as MeResponse
}

/* Função para fazer o logout. */
export async function logoutRequest(): Promise<void> {
  const res = await apiFetch('/auth/logout', { method: 'POST' })
  if (!res.ok && res.status !== 204) {
    const data: unknown = await res.json().catch(() => ({}))
    throw new Error(
      formatApiError(data as { message?: string | string[] }),
    )
  }
}
