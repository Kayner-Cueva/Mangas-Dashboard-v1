import { apiFetch } from '../config/apiClient'

export const listSources = async () => {
  try {
    const data = await apiFetch('/api/sources')
    return { data, error: null }
  } catch (error) {
    console.error('Error listando fuentes:', error)
    return { data: null, error }
  }
}

export const createSource = async (payload) => {
  try {
    const data = await apiFetch('/api/sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creando fuente:', error)
    return { data: null, error }
  }
}

export const updateSource = async (id, payload) => {
  try {
    const data = await apiFetch(`/api/sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando fuente:', error)
    return { data: null, error }
  }
}

export const deleteSource = async (id) => {
  try {
    await apiFetch(`/api/sources/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    console.error('Error eliminando fuente:', error)
    return { data: null, error }
  }
}
