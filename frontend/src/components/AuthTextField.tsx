/* Tipo de dado para as props do componente AuthTextField */
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

/* Componente AuthTextField */
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
  /* Variável para o id do erro */
  const errorId = `${id}-error`
  /* Variável para verificar se o campo tem erro */
  const hasError = Boolean(error)

  
  /* Retorno do componente */
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label do campo */}
      <label
        className="auth-label"
        htmlFor={id}
      >
        {label}
      </label>
      {/* Input do campo */}
      <input
        id={id}
        className={`auth-input ${hasError ? 'has-error' : ''}`}
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
      {/* Mensagem de erro */}
      {error ? (
        <p id={errorId} className="field-error-text">
          {error}
        </p>
      ) : null}
    </div>
  )
}
