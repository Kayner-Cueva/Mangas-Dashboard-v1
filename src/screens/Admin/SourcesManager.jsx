import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { theme } from '../../theme/theme'
import {
  Card,
  Button,
  Input,
  Textarea,
  Modal,
  Table,
  TableContainer,
  Th,
  Td,
  Tr,
  Badge,
  SkeletonRect
} from '../../components/common'
import { listSources, createSource, updateSource, deleteSource } from '../../services/sourceService'
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LoadingSpinner, EmptyState } from '../../components/common'
import { exportToJSON, exportToCSV } from '../../utils/exportUtils'
import { FiDownload } from 'react-icons/fi'

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

const sourceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  baseUrl: z.string().url('Debe ser una URL válida'),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
})

const SourcesManager = () => {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState(null)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isEditor = user?.role === 'EDITOR'
  const canEdit = isAdmin || isEditor

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: '',
      baseUrl: '',
      description: '',
      isActive: true
    }
  })

  const load = async () => {
    setLoading(true)
    const { data, error } = await listSources()
    if (error) {
      toast.error('Error al cargar las fuentes')
    } else {
      setSources(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleOpenModal = (source = null) => {
    if (source) {
      setEditingSource(source)
      reset({
        name: source.name || '',
        baseUrl: source.baseUrl || '',
        description: source.description || '',
        isActive: !!source.isActive
      })
    } else {
      setEditingSource(null)
      reset({
        name: '',
        baseUrl: '',
        description: '',
        isActive: true
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSource(null)
    reset()
  }

  const onSubmit = async (data) => {
    const result = editingSource
      ? await updateSource(editingSource.id, data)
      : await createSource(data)

    if (result.error) {
      toast.error(result.error.message || 'Error al procesar la solicitud')
      return
    }

    toast.success(editingSource ? 'Fuente actualizada' : 'Fuente creada')
    handleCloseModal()
    load()
  }

  const handleExport = async (format) => {
    if (format !== 'json') {
      toast.error('Solo exportación JSON está soportada por el momento')
      return // TODO: CSV
    }

    const toastId = toast.loading('Generando exportación...')
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      const response = await fetch(`${API_URL}/api/sources/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Error en la exportación')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fuentes_backup.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Exportación completada', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Falló la exportación', { id: toastId })
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const toastId = toast.loading('Importando fuentes...')
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const token = localStorage.getItem('token')
      // Ajusta la URL si es necesario
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      const response = await fetch(`${API_URL}/api/sources/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(json)
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Error en la importación')

      toast.success(`Importación: ${result.created} creadas, ${result.updated} actualizadas`, { id: toastId })
      load() // Recargar tabla
    } catch (err) {
      console.error(err)
      toast.error('Falló la importación: Verifique el formato del JSON', { id: toastId })
    } finally {
      e.target.value = '' // Reset input
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta fuente?')) return
    const { error } = await deleteSource(id)
    if (error) {
      toast.error('Error al eliminar la fuente')
    } else {
      toast.success('Fuente eliminada')
      load()
    }
  }

  const modalFooter = (
    <>
      <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" form="source-form" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="18px" /> : (editingSource ? 'Actualizar' : 'Crear')}
      </Button>
    </>
  )

  if (loading && sources.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Fuentes de Contenido</Title>
          <SkeletonRect width="150px" height="40px" $borderRadius={theme.borderRadius.md} />
        </Header>
        <TableContainer>
          <Table>
            <thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Base URL</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(i => (
                <Tr key={i}>
                  <Td><SkeletonRect width="120px" height="1.2rem" /></Td>
                  <Td><SkeletonRect width="200px" height="1.2rem" /></Td>
                  <Td><SkeletonRect width="60px" height="1.2rem" /></Td>
                  <Td><SkeletonRect width="100px" height="1.2rem" /></Td>
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
        <Title>Fuentes de Contenido</Title>
        {canEdit && (
          <Button onClick={() => handleOpenModal()}>
            <FiPlus size={20} /> Nueva Fuente
          </Button>
        )}
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
          <label htmlFor="import-json" style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              type="file"
              id="import-json"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <Button as="span" variant="outline" size="small" title="Importar JSON" style={{ cursor: 'pointer' }}>
              Importar JSON
            </Button>
          </label>
          <Button variant="outline" size="small" onClick={() => handleExport('json')} title="Exportar JSON">
            <FiDownload size={16} /> JSON
          </Button>
          <Button variant="outline" size="small" onClick={() => handleExport('csv')} title="Exportar CSV">
            <FiDownload size={16} /> CSV
          </Button>
        </div>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Base URL</Th>
              <Th>Descripción</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </thead>
          <tbody>
            {sources.map(src => (
              <Tr key={src.id}>
                <Td style={{ fontWeight: 500 }}>{src.name}</Td>
                <Td>
                  <a
                    href={src.baseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {src.baseUrl} <FiExternalLink size={14} />
                  </a>
                </Td>
                <Td>{src.description || '-'}</Td>
                <Td>
                  <Badge $active={src.isActive}>
                    {src.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </Td>
                <Td>
                  {(isAdmin || isEditor) && (
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleOpenModal(src)}
                          title="Editar"
                        >
                          <FiEdit2 size={16} />
                        </Button>
                      )}
                      {(isAdmin || (isEditor && src.creatorId === user.id)) && (
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDelete(src.id)}
                          title="Eliminar"
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      )}
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
            {sources.length === 0 && (
              <Tr>
                <Td colSpan={5}>
                  <EmptyState
                    title="No hay fuentes"
                    message="Agrega fuentes externas para importar contenido."
                  />
                </Td>
              </Tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSource ? 'Editar Fuente' : 'Nueva Fuente'}
        width="500px"
        footer={modalFooter}
      >
        <form id="source-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Input
            label="Nombre *"
            placeholder="Ej: MangaDex"
            {...register('name')}
            error={errors.name?.message}
            disabled={isSubmitting}
          />

          <Input
            label="Base URL *"
            placeholder="https://mangadex.org"
            {...register('baseUrl')}
            error={errors.baseUrl?.message}
            disabled={isSubmitting}
          />

          <Textarea
            label="Descripción"
            placeholder="Breve descripción de la fuente..."
            {...register('description')}
            rows={3}
            disabled={isSubmitting}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              style={{ width: '18px', height: '18px' }}
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" style={{ fontWeight: 500 }}>Fuente Activa</label>
          </div>
        </form>
      </Modal>
    </Container >
  )
}

export default SourcesManager
