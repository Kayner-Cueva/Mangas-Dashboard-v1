/**
 * Cliente de API centralizado para el frontend.
 * Maneja la URL base, los encabezados de autenticación, el parseo de respuestas
 * y el refresco automático de tokens.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`

  try {
    let res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Importante para enviar cookies de Refresh Token
    })

    // Si el token ha expirado (401)
    if (res.status === 401 && !options._retry && path !== '/api/auth/login' && path !== '/api/auth/refresh') {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          })

          if (refreshRes.ok) {
            const { accessToken } = await refreshRes.json()
            localStorage.setItem('token', accessToken)
            isRefreshing = false
            onTokenRefreshed(accessToken)
          } else {
            isRefreshing = false
            localStorage.removeItem('token')
            window.location.href = '/login'
            throw new Error('Session expired')
          }
        } catch (error) {
          isRefreshing = false
          throw error
        }
      }

      // Esperar a que el token se refresque
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          resolve(apiFetch(path, { ...options, _retry: true }))
        })
      })
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    if (res.status === 204) return null
    return res.json()
  } catch (error) {
    console.error(`API Error (${path}):`, error.message)
    throw error
  }
}

