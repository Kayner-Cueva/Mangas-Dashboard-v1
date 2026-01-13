import { apiFetch } from '../config/apiClient'

/** Obtener todos los capítulos de un manga */
export const getChaptersByManga = async (mangaId) => {
  try {
    const data = await apiFetch(`/api/chapters/manga/${mangaId}`)
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo capítulos:', error)
    return { data: null, error }
  }
}

/** Obtener un capítulo por ID */
export const getChapterById = async (id) => {
  try {
    const data = await apiFetch(`/api/chapters/${id}`)
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo capítulo:', error)
    return { data: null, error }
  }
}

/** Crear un nuevo capítulo */
export const createChapter = async (mangaId, chapterData) => {
  try {
    const payload = {
      number: Number(chapterData.numero),
      title: chapterData.titulo || undefined,
      url_capitulo: chapterData.url_capitulo || undefined,
      releaseDate: chapterData.fecha_publicacion || undefined,
      pages: chapterData.pages || undefined,
    }
    const data = await apiFetch(`/api/chapters/manga/${mangaId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error creando capítulo:', error)
    return { data: null, error }
  }
}

/** Actualizar un capítulo */
export const updateChapter = async (id, updates) => {
  try {
    const payload = {
      number: updates.numero !== undefined ? Number(updates.numero) : undefined,
      title: updates.titulo,
      url_capitulo: updates.url_capitulo,
      releaseDate: updates.fecha_publicacion,
      pages: updates.pages,
    }
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

    const data = await apiFetch(`/api/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando capítulo:', error)
    return { data: null, error }
  }
}

/** Eliminar un capítulo */
export const deleteChapter = async (id) => {
  try {
    await apiFetch(`/api/chapters/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    console.error('Error eliminando capítulo:', error)
    return { data: null, error }
  }
}

/** Obtener capítulos paginados (desde backend aún no implementado, opcional) */
export const getAllChaptersPaginated = async (page = 1, limit = 25) => {
  try {
    const data = await apiFetch(`/api/chapters?page=${page}&limit=${limit}`)
    return { data: data.items, count: data.total, error: null }
  } catch (error) {
    console.error('Error obteniendo capítulos paginados:', error)
    return { data: [], count: 0, error }
  }
}

/** Siguiente capítulo (puede calcularse en cliente filtrando la lista) */
export const getNextChapter = async (_mangaId, _currentNum) => {
  return { data: null, error: null }
}

/** Capítulo anterior (puede calcularse en cliente) */
export const getPreviousChapter = async (_mangaId, _currentNum) => {
  return { data: null, error: null }
}

/** Estadísticas de capítulos (usa /api/stats/summary) */
export const getChapterStats = async () => {
  try {
    const data = await apiFetch('/api/stats/summary')
    return { data: { total: data.chapters }, error: null }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return { data: null, error }
  }
}
