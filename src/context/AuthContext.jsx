import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../config/apiClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Intentar refrescar para obtener el usuario actualizado
          const data = await apiFetch('/api/auth/refresh', { method: 'POST' })
          if (data.accessToken) {
            setUser(data.user || { email: 'admin@example.com', role: 'ADMIN' })
          }
        } catch (err) {
          localStorage.removeItem('token')
          setUser(null)
        }
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  const signIn = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken)
        setUser(data.user)
        return { data, error: null }
      }
      return { data: null, error: { message: 'Error en el inicio de sesión' } }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUp = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      navigate('/login')
    }
    return { error: null }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

