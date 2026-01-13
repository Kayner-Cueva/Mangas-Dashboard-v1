import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { Card, SkeletonRect } from '../../components/common'
import { getDashboardStats } from '../../services/statsService'
import { listSources } from '../../services/sourceService'
import { FiBook, FiFileText, FiTag, FiUsers, FiTrendingUp } from 'react-icons/fi'

const Container = styled.div`
  padding: ${theme.spacing.xl};
`

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: ${theme.colors.text.secondary};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`

const StatCard = styled(Card)`
  padding: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${props => props.$color || theme.colors.primary};
  }
`

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => props.$color || theme.colors.primary}20;
  color: ${props => props.$color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${props => props.$positive ? theme.colors.success : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`

const RecentSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${theme.spacing.lg};
`

const RecentCard = styled(Card)`
  padding: ${theme.spacing.lg};
`

const RecentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sourcesCount, setSourcesCount] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [statsRes, sourcesRes] = await Promise.all([
        getDashboardStats(),
        listSources()
      ])

      if (!statsRes.error) setStats(statsRes.data)
      if (!sourcesRes.error) setSourcesCount(sourcesRes.data?.length || 0)

      setLoading(false)
    }
    loadData()
  }, [])

  const renderStatCard = (title, value, icon, color, changeText, positive) => (
    <StatCard $color={color}>
      <StatHeader>
        <StatTitle>{title}</StatTitle>
        <StatIcon $color={color}>{icon}</StatIcon>
      </StatHeader>
      <StatValue>
        {loading ? <SkeletonRect width="80px" height="2.5rem" /> : value}
      </StatValue>
      <StatChange $positive={positive}>
        {loading ? (
          <SkeletonRect width="120px" height="1rem" />
        ) : (
          <>
            {positive !== undefined && <FiTrendingUp size={16} />}
            {changeText}
          </>
        )}
      </StatChange>
    </StatCard>
  )

  return (
    <Container>
      <Header>
        <Title>Dashboard de Administración</Title>
        <Subtitle>Vista general de tu plataforma de mangas</Subtitle>
      </Header>

      <StatsGrid>
        {renderStatCard(
          'Total de Mangas',
          stats?.totalMangas,
          <FiBook size={24} />,
          theme.colors.primary,
          `${stats?.recentMangas || 0} nuevos esta semana`,
          (stats?.recentMangas || 0) > 0
        )}

        {renderStatCard(
          'Total de Capítulos',
          stats?.totalChapters,
          <FiFileText size={24} />,
          theme.colors.secondary,
          `${stats?.recentChapters || 0} nuevos esta semana`,
          (stats?.recentChapters || 0) > 0
        )}

        {renderStatCard(
          'Categorías',
          stats?.totalCategories,
          <FiTag size={24} />,
          theme.colors.info,
          'Géneros disponibles'
        )}

        {renderStatCard(
          'Usuarios',
          stats?.totalUsers,
          <FiUsers size={24} />,
          theme.colors.success,
          'Usuarios registrados'
        )}
      </StatsGrid>

      <RecentSection>
        <RecentCard>
          <RecentTitle>Actividad Reciente</RecentTitle>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SkeletonRect width="100%" height="1rem" />
              <SkeletonRect width="80%" height="1rem" />
            </div>
          ) : (
            <p style={{ color: theme.colors.text.secondary }}>
              {stats?.recentMangas} mangas y {stats?.recentChapters} capítulos agregados en los últimos 7 días.
            </p>
          )}
        </RecentCard>

        <RecentCard>
          <RecentTitle>Información del Sistema</RecentTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <p style={{ color: theme.colors.text.secondary }}>
              <strong>Versión:</strong> 1.0.0
            </p>
            <p style={{ color: theme.colors.text.secondary }}>
              <strong>Base de datos:</strong> PostgreSQL (Prisma + Express)
            </p>
            <p style={{ color: theme.colors.text.secondary }}>
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
            </p>
            <p style={{ color: theme.colors.text.secondary }}>
              <strong>Fuentes registradas:</strong> {loading ? <SkeletonRect width="30px" height="1rem" style={{ display: 'inline-block' }} /> : sourcesCount}
            </p>
          </div>
        </RecentCard>
      </RecentSection>
    </Container>
  )
}

export default AdminDashboard

