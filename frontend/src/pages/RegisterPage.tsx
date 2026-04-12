import { Link } from 'react-router-dom'
import RegisterProfileForm from '../components/RegisterProfileForm'

/* Pagina de registro */
export default function RegisterPage() {

  /* Renderizacao do componente */
  return (
    <div className="auth-shell">
      <div className="auth-card max-w-105">
        <h1 className="auth-title">Registrar-se</h1>
        <p className="auth-subtitle">
          Preencha os dados para criar sua conta.
        </p>

        <RegisterProfileForm />
        
        {/* Link para a pagina de login */}
        <p className="auth-footer">
          Já tem conta? <Link className="auth-link" to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
