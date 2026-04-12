import { authInputClass } from '../authStyles'

type AuthTextFieldProps = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  name: string
  autoComplete?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  placeholder?: string
  maxLength?: number
}

function fieldRingClass(hasError: boolean): string {
  return hasError
    ? 'border-red-600 dark:border-red-400 focus:border-red-600 focus:ring-red-600/30 dark:focus:border-red-400 dark:focus:ring-red-400/30'
    : ''
}

export default function AuthTextField({
  id,
  label,
  type = 'text',
  name,
  autoComplete,
  value,
  onValueChange,
  error,
  placeholder,
  maxLength,
}: AuthTextFieldProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-sm font-medium text-[#141824] dark:text-[#eef0f5]"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        className={`${authInputClass} ${fieldRingClass(hasError)}`}
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
