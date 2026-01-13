import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { theme } from '../../theme/theme'
import {
  Button,
  Input,
  Modal,
  Table,
  TableContainer,
  Th,
  Td,
  Tr,
  SkeletonRect
} from '../../components/common'
import {
  getAllChaptersPaginated,
  createChapter,
  updateChapter,
  deleteChapter
} from '../../services/chapterService'
import { getAllMangas } from '../../services/mangaService'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LoadingSpinner, EmptyState } from '../../components/common'

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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.lg};
`

const PaginationInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 0.875rem;
`

const PaginationControls = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.light};
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`

const chapterSchema = z.object({
  manga_id: z.string().min(1, 'El manga es obligatorio'),
  numero: z.string().min(1, 'El número es obligatorio').transform(v => parseFloat(v)),
  titulo: z.string().optional(),
  url_capitulo: z.string().url('Debe ser una URL válida')
})

const ChaptersManager = () => {
  const [chapters, setChapters] = useState([])
  const [mangas, setMangas] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isEditor = user?.role === 'EDITOR'
  const canEdit = isAdmin || isEditor

  const itemsPerPage = 25

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      manga_id: '',
      numero: '',
      titulo: '',
      url_capitulo: ''
    }
  })

  useEffect(() => {
    loadChapters()
  }, [currentPage])

  useEffect(() => {
    loadMangas()
  }, [])

  const loadChapters = async () => {
    setLoading(true)
    const { data, count, error } = await getAllChaptersPaginated(currentPage, itemsPerPage)
    if (error) {
      toast.error('Error al cargar los capítulos')
    } else {
      setChapters(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    }
    setLoading(false)
  }

  const loadMangas = async () => {
    const { data, error } = await getAllMangas({ limit: 1000 })
    if (!error && data) {
      setMangas(data)
    }
  }

  const handleOpenModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter)
      reset({
        manga_id: chapter.manga_id || '',
        numero: chapter.number || '',
        titulo: chapter.title || '',
        url_capitulo: chapter.url_capitulo || ''
      })
    } else {
      setEditingChapter(null)
      reset({
        manga_id: '',
        numero: '',
        titulo: '',
        url_capitulo: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingChapter(null)
    reset()
  }

  const onSubmit = async (data) => {
    const result = editingChapter
      ? await updateChapter(editingChapter.id, data)
      : await createChapter(data.manga_id, data)

    if (result.error) {
      toast.error(result.error.message || 'Error al procesar la solicitud')
      return
    }

    toast.success(editingChapter ? 'Capítulo actualizado' : 'Capítulo creado')
    handleCloseModal()
    loadChapters()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este capítulo?')) return
    const { error } = await deleteChapter(id)
    if (error) {
      toast.error('Error al eliminar el capítulo')
    } else {
      toast.success('Capítulo eliminado')
      loadChapters()
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const modalFooter = (
    <>
      <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" form="chapter-form" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="18px" /> : (editingChapter ? 'Actualizar' : 'Crear')}
      </Button>
    </>
  )

  if (loading && chapters.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Gestión de Capítulos</Title>
          <SkeletonRect width="150px" height="40px" $borderRadius={theme.borderRadius.md} />
        </Header>
        <TableContainer>
          <Table>
            <thead>
              <Tr>
                <Th>Manga</Th>
                <Th>Número</Th>
                <Th>Título</Th>
                <Th>Acciones</Th>
              </Tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(i => (
                <Tr key={i}>
                  <Td><SkeletonRect width="150px" height="1.2rem" /></Td>
                  <Td><SkeletonRect width="50px" height="1.2rem" /></Td>
                  <Td><SkeletonRect width="200px" height="1.2rem" /></Td>
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
        <Title>Gestión de Capítulos</Title>
        {canEdit && (
          <Button onClick={() => handleOpenModal()}>
            <FiPlus size={20} /> Nuevo Capítulo
          </Button>
        )}
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <Tr>
              <Th>Manga</Th>
              <Th>Número</Th>
              <Th>Título</Th>
              <Th>URL</Th>
              <Th>Acciones</Th>
            </Tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <Tr key={chapter.id}>
                <Td style={{ fontWeight: 500 }}>{chapter.manga?.title || 'Desconocido'}</Td>
                <Td><strong>{chapter.number}</strong></Td>
                <Td>{chapter.title || '-'}</Td>
                <Td>
                  {chapter.url_capitulo ? (
                    <a
                      href={chapter.url_capitulo}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Ver <FiExternalLink size={14} />
                    </a>
                  ) : '-'}
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleOpenModal(chapter)}
                        title="Editar"
                      >
                        <FiEdit2 size={16} />
                      </Button>
                    )}
                    {(isAdmin || (user?.role === 'EDITOR' && chapter.creatorId === user.id)) && (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(chapter.id)}
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {chapters.length === 0 && (
              <Tr>
                <Td colSpan={5}>
                  <EmptyState
                    title="No hay capítulos"
                    message="Aún no se han agregado capítulos a este catálogo."
                  />
                </Td>
              </Tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationInfo>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount}
          </PaginationInfo>
          <PaginationControls>
            <Button
              variant="outline"
              size="small"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft size={20} />
            </Button>
            <span>Página {currentPage} de {totalPages}</span>
            <Button
              variant="outline"
              size="small"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight size={20} />
            </Button>
          </PaginationControls>
        </PaginationContainer>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingChapter ? 'Editar Capítulo' : 'Nuevo Capítulo'}
        width="500px"
        footer={modalFooter}
      >
        <form id="chapter-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontWeight: 500 }}>
              Manga *
            </label>
            <Select
              {...register('manga_id')}
              disabled={isSubmitting}
            >
              <option value="">Seleccionar manga</option>
              {mangas.map((manga) => (
                <option key={manga.id} value={manga.id}>
                  {manga.title || manga.titulo}
                </option>
              ))}
            </Select>
            {errors.manga_id && <span style={{ color: theme.colors.error, fontSize: '0.75rem' }}>{errors.manga_id.message}</span>}
          </div>

          <Input
            label="Número de Capítulo *"
            type="number"
            step="0.1"
            placeholder="Ej: 1"
            {...register('numero')}
            error={errors.numero?.message}
            disabled={isSubmitting}
          />

          <Input
            label="Título del Capítulo"
            placeholder="Ej: El comienzo"
            {...register('titulo')}
            disabled={isSubmitting}
          />

          <Input
            label="URL del Capítulo *"
            type="url"
            placeholder="https://ejemplo.com/capitulo/1"
            {...register('url_capitulo')}
            error={errors.url_capitulo?.message}
            disabled={isSubmitting}
          />
        </form>
      </Modal>
    </Container>
  )
}

export default ChaptersManager

