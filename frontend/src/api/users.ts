import { apiFetch, formatApiError } from './client'

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type UpdateUserPayload = {
  name: string
  email: string
  password?: string
}

export type RegisterSuccess = {
  id: number
  name: string
  email: string
  dataCriacao: string
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterSuccess> {
  const res = await apiFetch('/users', {
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

  return data as RegisterSuccess
}

export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<RegisterSuccess> {
  const res = await apiFetch(`/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      formatApiError(data as { message?: string | string[] }),
    )
  }

  return data as RegisterSuccess
}
