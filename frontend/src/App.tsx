import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import EditProfilePage from './pages/EditProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WelcomePage from './pages/WelcomePage'

/* Componente principal da aplicacao */
export default function App() {
  /* Renderizacao do componente */
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas da aplicacao */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Pagina de login */}
        <Route path="/login" element={<LoginPage />} />
        {/* Pagina de registro */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Pagina de boas vindas */}
        <Route path="/welcome" element={<WelcomePage />} />
        {/* Pagina de edicao de perfil */}
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
