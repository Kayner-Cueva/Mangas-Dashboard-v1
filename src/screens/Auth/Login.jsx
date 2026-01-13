import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiLogIn, FiBook } from 'react-icons/fi'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  padding: ${theme.spacing.md};
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: ${theme.spacing.xl};
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.sm};
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`

const ToggleText = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-top: ${theme.spacing.md};
  cursor: pointer;
  user-select: none;
  &:hover { color: ${theme.colors.text.primary}; }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    if (isRegister) {
      if (password !== confirm) {
        setLoading(false)
        toast.error('Las contraseñas no coinciden')
        return
      }
      // HARDCODED EDITOR ROLE
      const { error } = await signUp(email, password, 'EDITOR')
      setLoading(false)
      if (error) {
        toast.error(error.message || 'Error al registrar')
      } else {
        toast.success('Cuenta creada, iniciando sesión...')
        setLoading(true)
        const { error: loginError } = await signIn(email, password)
        setLoading(false)
        if (loginError) {
          toast.error(loginError.message || 'Error al iniciar sesión')
        } else {
          navigate('/dashboard')
        }
      }
    } else {
      const { data, error } = await signIn(email, password)
      setLoading(false)

      if (error) {
        toast.error(error.message || 'Error al iniciar sesión')
      } else {
        // BLOCK ADMINS FROM EDITOR LOGIN
        const userRole = data?.user?.role;
        if (userRole === 'ADMIN') {
          toast.error('Acceso restringido. Por favor utilice el portal de administración.')
          await signIn(null, null) // Force logout
          return
        }
        toast.success('¡Bienvenido!')
        navigate('/dashboard')
      }
    }
  }

  return (
    <Container>
      <LoginCard>
        <Logo>
          <LogoIcon>
            <FiBook size={32} />
          </LogoIcon>
        </Logo>
        <Title>Manga Dashboard</Title>
        <Subtitle>{isRegister ? 'Crea tu cuenta para continuar' : 'Inicia sesión para continuar'}</Subtitle>

        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {isRegister && (
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}

          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: theme.spacing.md }}>
            <FiLogIn size={20} /> {loading ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...') : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </Button>
        </Form>

        <ToggleText onClick={() => setIsRegister(v => !v)}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </ToggleText>
      </LoginCard>
    </Container>
  )
}

export default Login
