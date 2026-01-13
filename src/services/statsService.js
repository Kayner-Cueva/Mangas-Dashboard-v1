import { apiFetch } from '../config/apiClient'

/** Obtener estadísticas generales del dashboard desde el backend */
export const getDashboardStats = async () => {
  try {
    const summary = await apiFetch('/api/stats/summary')

    const stats = {
      totalMangas: summary.mangas || 0,
      totalChapters: summary.chapters || 0,
      totalCategories: summary.categories || 0,
      totalUsers: summary.users || 0,
      recentMangas: summary.recentMangas || 0,
      recentChapters: summary.recentChapters || 0,
      totalViews: summary.totalViews || 0,
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return { data: null, error }
  }
}
