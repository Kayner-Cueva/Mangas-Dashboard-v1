import { apiFetch } from '../config/apiClient'

/**
 * Obtener todas las categorías
 */
export const getAllCategories = async () => {
  try {
    const data = await apiFetch('/api/categories')
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo categorías:', error)
    return { data: null, error }
  }
}

/**
 * Crear una nueva categoría
 */
export const createCategory = async (data) => {
  return apiFetch('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Actualizar una categoría
 */
export const updateCategory = async (id, updates) => {
  try {
    const data = await apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando categoría:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar una categoría
 */
export const deleteCategory = async (id) => {
  try {
    await apiFetch(`/api/categories/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    return { data: null, error }
  }
}
