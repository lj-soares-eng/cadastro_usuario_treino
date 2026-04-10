import { apiFetch, formatApiError } from './client'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginSuccess = {
  user: {
    id: number
    name: string
    email: string
  }
}

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

export type MeResponse = {
  id: number
  name: string
  email: string
}

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

export async function logoutRequest(): Promise<void> {
  const res = await apiFetch('/auth/logout', { method: 'POST' })
  if (!res.ok && res.status !== 204) {
    const data: unknown = await res.json().catch(() => ({}))
    throw new Error(
      formatApiError(data as { message?: string | string[] }),
    )
  }
}
