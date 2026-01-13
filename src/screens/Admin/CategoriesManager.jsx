import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { theme } from '../../theme/theme'
import {
  Button,
  Input,
  Textarea,
  Modal,
  Table,
  TableContainer,
  Th,
  Td,
  Tr,
  SkeletonRect
} from '../../components/common'
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/categoryService'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2, FiPlus, FiTag } from 'react-icons/fi'
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

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .trim()

const categorySchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional()
})

const CategoriesManager = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isEditor = user?.role === 'EDITOR'
  const canEdit = isAdmin || isEditor

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: '',
      descripcion: ''
    }
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const { data, error } = await getAllCategories()
    if (error) {
      toast.error('Error al cargar las categorías')
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      reset({
        nombre: category.name || '',
        descripcion: category.description || ''
      })
    } else {
      setEditingCategory(null)
      reset({
        nombre: '',
        descripcion: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    reset()
  }

  const onSubmit = async (data) => {
    const payload = {
      name: data.nombre,
      slug: slugify(data.nombre),
      description: data.descripcion || undefined,
    }

    const result = editingCategory
      ? await updateCategory(editingCategory.id, payload)
      : await createCategory(payload)

    if (result.error) {
      toast.error(result.error.message || 'Error al procesar la solicitud')
      return
    }

    toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada')
    handleCloseModal()
    loadCategories()
  }

  const handleExport = (format) => {
    const exportData = categories.map(c => ({
      id: c.id,
      nombre: c.name,
      slug: c.slug,
      descripcion: c.description,
      creado: c.createdAt
    }))

    if (format === 'json') {
      exportToJSON(exportData, 'categorias_metadata')
    } else {
      exportToCSV(exportData, 'categorias_metadata')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return
    const { error } = await deleteCategory(id)
    if (error) {
      toast.error('Error al eliminar la categoría')
    } else {
      toast.success('Categoría eliminada')
      loadCategories()
    }
  }

  const modalFooter = (
    <>
      <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" form="category-form" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="18px" /> : (editingCategory ? 'Actualizar' : 'Crear')}
      </Button>
    </>
  )

  if (loading && categories.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Gestión de Categorías</Title>
          <SkeletonRect width="150px" height="40px" $borderRadius={theme.borderRadius.md} />
        </Header>
        <TableContainer>
          <Table>
            <thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Slug</Th>
                <Th>Acciones</Th>
              </Tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(i => (
                <Tr key={i}>
                  <Td><SkeletonRect width="120px" height="1.2rem" /></Td>
                  <Td><SkeletonRect width="150px" height="1.2rem" /></Td>
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
        <Title>Gestión de Categorías</Title>
        {canEdit && (
          <Button onClick={() => handleOpenModal()}>
            <FiPlus size={20} /> Nueva Categoría
          </Button>
        )}
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
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
              <Th>Slug</Th>
              <Th>Descripción</Th>
              <Th>Acciones</Th>
            </Tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <Tr key={category.id}>
                <Td style={{ fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiTag size={16} color={theme.colors.primary} />
                    {category.name}
                  </div>
                </Td>
                <Td><code>{category.slug}</code></Td>
                <Td>{category.description || '-'}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleOpenModal(category)}
                        title="Editar"
                      >
                        <FiEdit2 size={16} />
                      </Button>
                    )}
                    {(isAdmin || (isEditor && category.creatorId === user.id)) && (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(category.id)}
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {categories.length === 0 && (
              <Tr>
                <Td colSpan={4}>
                  <EmptyState
                    title="No hay categorías"
                    message="Aún no se han definido categorías para los mangas."
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
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        width="500px"
        footer={modalFooter}
      >
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Input
            label="Nombre *"
            placeholder="Ej: Shonen"
            {...register('nombre')}
            error={errors.nombre?.message}
            disabled={isSubmitting}
          />

          <Textarea
            label="Descripción"
            placeholder="Descripción de la categoría..."
            {...register('descripcion')}
            rows={4}
            disabled={isSubmitting}
          />
        </form>
      </Modal>
    </Container>
  )
}

export default CategoriesManager

