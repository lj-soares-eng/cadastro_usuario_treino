import type { ReactNode } from 'react'

/* Tipo de dado para as props do componente AlertMessage */
type AlertMessageProps = {
  variant: 'success' | 'error'
  role?: 'status' | 'alert'
  children: ReactNode
}

/* Variacoes de classe para o componente AlertMessage */
const alertVariantClass = {
  success: 'alert-success',
  error: 'alert-error',
}

/* Componente AlertMessage */
export default function AlertMessage({
  variant,
  role,
  children,
}: AlertMessageProps) {
  return (
    <p
      className={`alert-message ${alertVariantClass[variant]}`}
      role={role ?? (variant === 'success' ? 'status' : 'alert')}
    >
      {children}
    </p>
  )
}
