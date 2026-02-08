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
    EmptyState,
    Input,
    Textarea,
    Modal
} from '../../components/common'
import { apiFetch } from '../../config/apiClient'
import toast from 'react-hot-toast'
import { FiUser, FiShield, FiUserX, FiUserCheck, FiRefreshCw, FiSlash, FiEdit, FiInfo } from 'react-icons/fi'
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
    const [isModModalOpen, setIsModModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [modData, setModData] = useState({ isBanned: false, banReason: '', adminNote: '' })

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

    const openModeration = (user) => {
        setSelectedUser(user)
        setModData({
            isBanned: user.isBanned || false,
            banReason: user.banReason || '',
            adminNote: user.adminNote || ''
        })
        setIsModModalOpen(true)
    }

    const handleModerationSave = async () => {
        setUpdatingId(selectedUser.id)
        try {
            await apiFetch(`/api/users/${selectedUser.id}/moderation`, {
                method: 'PATCH',
                body: JSON.stringify(modData)
            })
            toast.success('Moderación actualizada')
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...modData } : u))
            setIsModModalOpen(false)
        } catch (err) {
            toast.error('Error al actualizar moderación')
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
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                            variant={u.isActive ? 'danger' : 'success'}
                                            size="small"
                                            onClick={() => handleStatusToggle(u.id, u.isActive)}
                                            disabled={updatingId === u.id}
                                            title={u.isActive ? 'Desactivar acceso' : 'Activar acceso'}
                                        >
                                            {updatingId === u.id ? <LoadingSpinner size="14px" /> : (u.isActive ? <FiUserX size={16} /> : <FiUserCheck size={16} />)}
                                        </Button>
                                        <Button
                                            variant={u.isBanned ? 'danger' : 'outline'}
                                            size="small"
                                            onClick={() => openModeration(u)}
                                            disabled={updatingId === u.id}
                                            title="Moderación y Notas"
                                        >
                                            <FiShield size={16} />
                                        </Button>
                                    </div>
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

            <Modal
                isOpen={isModModalOpen}
                onClose={() => setIsModModalOpen(false)}
                title={`Moderación: ${selectedUser?.email}`}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsModModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleModerationSave} disabled={updatingId}>
                            {updatingId ? <LoadingSpinner size="18px" /> : 'Guardar Cambios'}
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: theme.spacing.md,
                        backgroundColor: modData.isBanned ? `${theme.colors.error}11` : theme.colors.bg.card,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${modData.isBanned ? theme.colors.error : theme.colors.border.light}`
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: modData.isBanned ? theme.colors.error : theme.colors.text.primary }}>
                                {modData.isBanned ? 'Usuario Baneado' : 'Usuario Activo'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>
                                El baneo impide cualquier acceso a la plataforma.
                            </div>
                        </div>
                        <Button
                            variant={modData.isBanned ? 'success' : 'danger'}
                            size="small"
                            onClick={() => setModData({ ...modData, isBanned: !modData.isBanned })}
                        >
                            {modData.isBanned ? 'Quitar Baneo' : 'Banear Usuario'}
                        </Button>
                    </div>

                    {modData.isBanned && (
                        <Input
                            label="Motivo del Baneo"
                            placeholder="Escribe el motivo..."
                            value={modData.banReason || ''}
                            onChange={(e) => setModData({ ...modData, banReason: e.target.value })}
                        />
                    )}

                    <Textarea
                        label="Notas del Administrador (Privado)"
                        placeholder="Añade información relevante sobre este usuario..."
                        value={modData.adminNote || ''}
                        onChange={(e) => setModData({ ...modData, adminNote: e.target.value })}
                        rows={4}
                    />
                </div>
            </Modal>
        </Container>
    )
}

export default UsersManager
