import type { ReactNode } from 'react'

type AlertMessageProps = {
  variant: 'success' | 'error'
  role?: 'status' | 'alert'
  children: ReactNode
}

const alertVariantClass = {
  success:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200',
}

export default function AlertMessage({
  variant,
  role,
  children,
}: AlertMessageProps) {
  return (
    <p
      className={`mb-4 rounded-lg border px-3 py-2 text-sm ${alertVariantClass[variant]}`}
      role={role ?? (variant === 'success' ? 'status' : 'alert')}
    >
      {children}
    </p>
  )
}
