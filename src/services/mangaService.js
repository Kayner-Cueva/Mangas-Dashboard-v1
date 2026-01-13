import { apiFetch } from '../config/apiClient'

/** Obtener todos los mangas (con paginación opcional y filtros) */
export const getAllMangas = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    const data = await apiFetch(`/api/mangas${query ? `?${query}` : ''}`)
    return { data: data.items ?? data, error: null }
  } catch (error) {
    console.error('Error obteniendo mangas:', error)
    return { data: null, error }
  }
}

/** Obtener un manga por ID */
export const getMangaById = async (id) => {
  try {
    const data = await apiFetch(`/api/mangas/${id}`)
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo manga:', error)
    return { data: null, error }
  }
}

/** Buscar mangas */
export const searchMangas = async (term) => {
  return getAllMangas({ search: term })
}

/** Crear un nuevo manga */
export const createManga = async (mangaData) => {
  try {
    const payload = {
      title: mangaData.titulo?.trim(),
      description: mangaData.descripcion?.trim() || null,
      coverUrl: mangaData.portada_url?.trim() || null,
      slug: (mangaData.titulo || '').toLowerCase().trim().replace(/\s+/g, '-'),
      author: mangaData.autor?.trim() || null,
      categoryIds: mangaData.categoryIds || [],
      ageRating: mangaData.ageRating || 'EVERYONE',
      isModerated: mangaData.isModerated || false,
      isAdult: mangaData.isAdult || false,
    }
    const data = await apiFetch('/api/mangas', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creando manga:', error)
    return { data: null, error }
  }
}

/** Actualizar un manga */
export const updateManga = async (id, updates) => {
  try {
    const payload = {
      title: updates.titulo?.trim(),
      description: updates.descripcion?.trim() || null,
      coverUrl: updates.portada_url?.trim() || null,
      slug: updates.slug,
      author: updates.autor?.trim() || null,
      categoryIds: updates.categoryIds,
      ageRating: updates.ageRating,
      isModerated: updates.isModerated,
      isAdult: updates.isAdult,
    }
    // eliminar undefined del payload
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

    const data = await apiFetch(`/api/mangas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando manga:', error)
    return { data: null, error }
  }
}

/** Eliminar un manga */
export const deleteManga = async (id) => {
  try {
    await apiFetch(`/api/mangas/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    console.error('Error eliminando manga:', error)
    return { data: null, error }
  }
}

/** Obtener mangas por categoría */
export const getMangasByCategory = async (categoryId) => {
  try {
    const data = await apiFetch(`/api/mangas?category=${encodeURIComponent(categoryId)}`)
    return { data: data.items ?? data, error: null }
  } catch (error) {
    console.error('Error obteniendo mangas por categoría:', error)
    return { data: null, error }
  }
}

/** Asignar categorías a un manga (integrado en update) */
export const assignCategoriesToManga = async (mangaId, categoryIds) => {
  return updateManga(mangaId, { categoryIds })
}
