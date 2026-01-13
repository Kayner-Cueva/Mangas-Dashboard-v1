import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '../../theme/theme'
import {
    Button,
    Table,
    TableContainer,
    Th,
    Td,
    Tr,
    Badge,
    SkeletonRect,
    LoadingSpinner,
    EmptyState
} from '../../components/common'
import { apiFetch } from '../../config/apiClient'
import toast from 'react-hot-toast'
import { FiUser, FiShield, FiUserX, FiUserCheck, FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const Container = styled.div`
  padding: ${theme.spacing.xl};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`

const RoleSelect = styled.select`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  background: ${theme.colors.bg.light};
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const UsersManager = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await apiFetch('/api/users')
            setUsers(data || [])
        } catch (err) {
            toast.error('Error al cargar usuarios')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId)
        try {
            await apiFetch(`/api/users/${userId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole })
            })
            toast.success('Rol actualizado')
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (err) {
            toast.error('Error al actualizar rol')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleStatusToggle = async (userId, currentStatus) => {
        if (!window.confirm(`¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} a este usuario?`)) return

        setUpdatingId(userId)
        try {
            await apiFetch(`/api/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !currentStatus })
            })
            toast.success(`Usuario ${currentStatus ? 'desactivado' : 'activado'}`)
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u))
        } catch (err) {
            toast.error('Error al cambiar estado')
        } finally {
            setUpdatingId(null)
        }
    }

    if (loading && users.length === 0) {
        return (
            <Container>
                <Header>
                    <Title>Gestión de Usuarios</Title>
                </Header>
                <TableContainer>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>Usuario</Th>
                                <Th>Rol</Th>
                                <Th>Estado</Th>
                                <Th>Última Actividad</Th>
                                <Th>Acciones</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map(i => (
                                <Tr key={i}>
                                    <Td><SkeletonRect width="180px" height="1.2rem" /></Td>
                                    <Td><SkeletonRect width="100px" height="1.2rem" /></Td>
                                    <Td><SkeletonRect width="80px" height="1.2rem" /></Td>
                                    <Td><SkeletonRect width="150px" height="1.2rem" /></Td>
                                    <Td><SkeletonRect width="120px" height="1.2rem" /></Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                </TableContainer>
            </Container>
        )
    }

    return (
        <Container>
            <Header>
                <Title>Gestión de Usuarios</Title>
                <Button variant="outline" size="small" onClick={loadUsers} disabled={loading}>
                    <FiRefreshCw size={16} style={{ marginRight: '8px' }} /> Actualizar
                </Button>
            </Header>

            <TableContainer>
                <Table>
                    <thead>
                        <Tr>
                            <Th>Usuario</Th>
                            <Th>Rol</Th>
                            <Th>Estado</Th>
                            <Th>Última Actividad</Th>
                            <Th>Acciones</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <Tr key={u.id}>
                                <Td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600 }}>{u.email}</span>
                                        <span style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>ID: {u.id}</span>
                                    </div>
                                </Td>
                                <Td>
                                    <RoleSelect
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        disabled={updatingId === u.id}
                                    >
                                        <option value="USER">Usuario</option>
                                        <option value="EDITOR">Editor</option>
                                        <option value="ADMIN">Admin</option>
                                    </RoleSelect>
                                </Td>
                                <Td>
                                    <Badge $active={u.isActive}>
                                        {u.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        {u.lastLogin ? (
                                            format(new Date(u.lastLogin), "d 'de' MMMM, HH:mm", { locale: es })
                                        ) : 'Nunca'}
                                    </div>
                                </Td>
                                <Td>
                                    <Button
                                        variant={u.isActive ? 'danger' : 'success'}
                                        size="small"
                                        onClick={() => handleStatusToggle(u.id, u.isActive)}
                                        disabled={updatingId === u.id}
                                    >
                                        {updatingId === u.id ? (
                                            <LoadingSpinner size="14px" />
                                        ) : (
                                            u.isActive ? <><FiUserX size={16} /> Desactivar</> : <><FiUserCheck size={16} /> Activar</>
                                        )}
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
                {users.length === 0 && (
                    <EmptyState
                        title="No hay usuarios"
                        message="No se encontraron usuarios registrados en el sistema."
                        icon={FiUser}
                    />
                )}
            </TableContainer>
        </Container>
    )
}

export default UsersManager
