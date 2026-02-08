import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { theme } from '../../theme/theme'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input, Textarea } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import {
  getAllMangas,
  createManga,
  updateManga,
  deleteManga,
  searchMangas,
  assignCategoriesToManga
} from '../../services/mangaService'
import { getAllCategories } from '../../services/categoryService'
import { listSources } from '../../services/sourceService'
import toast from 'react-hot-toast'
import { SkeletonRect } from '../../components/common/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LoadingSpinner, EmptyState } from '../../components/common'
import { exportToJSON, exportToCSV } from '../../utils/exportUtils'
import { FiDownload, FiPlus, FiEdit2, FiTrash2, FiShield } from 'react-icons/fi'

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`

const SearchContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex: 1;
  max-width: 400px;
`

const MangasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`

const MangaCard = styled(Card)`
  cursor: pointer;
  overflow: hidden;
`

const MangaImage = styled.div`
  width: 100%;
  height: 350px;
  background-color: ${theme.colors.bg.card};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
  
  ${props => !props.src && `
    &::after {
      content: '${props.alt || 'Sin imagen'}';
      font-size: 0.875rem;
    }
  `}
`

const MangaInfo = styled.div`
  padding: ${theme.spacing.md};
`

const MangaTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const MangaDescription = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: ${theme.spacing.md};
`

const ActionsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
`

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: 1rem;
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.light};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight}33;
  }
`

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 0.875rem;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`


const mangaSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  coverUrl: z.string().url('Debe ser una URL válida'),
  author: z.string().optional().or(z.literal('')),
  sourceId: z.string().optional().or(z.literal('')),
  ageRating: z.enum(['EVERYONE', 'TEEN', 'MATURE', 'ADULT']),
  isModerated: z.boolean().default(false)
})

const LegalBanner = styled.div`
  background: ${theme.colors.warning}22;
  border: 1px solid ${theme.colors.warning};
  color: ${theme.colors.warning};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 0.9rem;
`

const MangasManager = () => {
  const [mangas, setMangas] = useState([])
  const [categories, setCategories] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingManga, setEditingManga] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isEditor = user?.role === 'EDITOR'
  const canEdit = isAdmin || isEditor

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(mangaSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      coverUrl: '',
      author: '',
      sourceId: '',
      ageRating: 'EVERYONE',
      isModerated: false
    }
  })

  // Auto-generate slug from title
  const watchedTitle = watch('title')
  useEffect(() => {
    if (!editingManga && watchedTitle) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [watchedTitle, setValue, editingManga])

  useEffect(() => {
    loadMangas()
    loadCategories()
    loadSources()
  }, [])

  // Debounce para la búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      if (!loading) loadMangas()
      return
    }

    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const loadMangas = async () => {
    setLoading(true)
    const { data, error } = await getAllMangas()
    if (error) {
      toast.error('Error al cargar el contenido')
      console.error(error)
    } else {
      setMangas(data || [])
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    const { data, error } = await getAllCategories()
    if (!error && data) {
      setCategories(data)
    }
  }

  const loadSources = async () => {
    const { data, error } = await listSources()
    if (!error && data) {
      setSources(data)
    }
  }

  const handleSearch = async (term) => {
    if (!term.trim()) {
      loadMangas()
      return
    }
    setLoading(true)
    const { data, error } = await searchMangas(term)
    if (error) {
      toast.error('Error en la búsqueda')
    } else {
      setMangas(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = (manga = null) => {
    if (manga) {
      setEditingManga(manga)
      reset({
        title: manga.title || '',
        slug: manga.slug || '',
        description: manga.description || '',
        coverUrl: manga.coverUrl || '',
        author: manga.author || '',
        sourceId: manga.sourceId || '',
        ageRating: manga.ageRating || 'EVERYONE',
        isModerated: manga.isModerated || false
      })
      setSelectedCategories(manga.categories?.map(mc => mc.category?.id) || [])
    } else {
      setEditingManga(null)
      reset({
        title: '',
        slug: '',
        description: '',
        coverUrl: '',
        author: '',
        sourceId: '',
        ageRating: 'EVERYONE',
        isModerated: false
      })
      setSelectedCategories([])
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingManga(null)
    reset()
    setSelectedCategories([])
  }

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      categoryIds: selectedCategories
    }

    const result = editingManga
      ? await updateManga(editingManga.id, payload)
      : await createManga(payload)

    if (result.error) {
      toast.error(result.error.message || 'Error al procesar la solicitud')
      return
    }

    toast.success(editingManga ? 'Contenido actualizado exitosamente' : 'Contenido creado exitosamente')
    handleCloseModal()
    loadMangas()
  }

  const handleExport = async (format) => {
    if (format !== 'json') {
      toast.error('Solo exportación JSON está soportada por el momento')
      return // TODO: Implement CSV backend support
    }

    const toastId = toast.loading('Generando exportación...')
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      const response = await fetch(`${API_URL}/api/mangas/export?format=json`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error en la exportación')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mangas_backup.json'
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

    const toastId = toast.loading('Importando Contenido (esto puede tardar)...')
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      const response = await fetch(`${API_URL}/api/mangas/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(json)
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Error en la importación')

      toast.success(`Importación completada`, { id: toastId })
      if (result.errors > 0) {
        toast((t) => (
          <span>
            {result.updated + result.created} procesados.
            <br />
            ⚠️ {result.errors} errores.
            <button onClick={() => toast.dismiss(t.id)}>OK</button>
          </span>
        ), { duration: 6000 })
      }

      loadMangas()
    } catch (err) {
      console.error(err)
      toast.error('Falló la importación: Verifique el formato del JSON', { id: toastId })
    } finally {
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este contenido?')) {
      return
    }

    const { error } = await deleteManga(id)
    if (error) {
      toast.error('Error al eliminar el contenido')
    } else {
      toast.success('Contenido eliminado exitosamente')
      loadMangas()
    }
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const modalFooter = (
    <>
      <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" form="manga-form" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="18px" /> : (editingManga ? 'Actualizar' : 'Crear')}
      </Button>
    </>
  )

  if (loading && mangas.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Gestión de Contenidos</Title>
          <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
            <SkeletonRect width="100%" height="45px" $borderRadius={theme.borderRadius.md} />
          </div>
        </Header>
        <MangasGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ overflow: 'hidden' }}>
              <SkeletonRect height="350px" $borderRadius={`${theme.borderRadius.md} ${theme.borderRadius.md} 0 0`} />
              <div style={{ padding: theme.spacing.md }}>
                <SkeletonRect height="1.5rem" width="80%" style={{ marginBottom: theme.spacing.sm }} />
                <SkeletonRect height="1rem" width="100%" style={{ marginBottom: theme.spacing.xs }} />
                <SkeletonRect height="1rem" width="90%" style={{ marginBottom: theme.spacing.md }} />
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                  <SkeletonRect height="32px" width="80px" $borderRadius={theme.borderRadius.sm} />
                  <SkeletonRect height="32px" width="80px" $borderRadius={theme.borderRadius.sm} />
                </div>
              </div>
            </Card>
          ))}
        </MangasGrid>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>Gestión de Contenidos</Title>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
          <SearchContainer>
            <Input
              type="text"
              placeholder="Buscar contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
          </SearchContainer>
          {canEdit && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={() => handleOpenModal()}>
                <FiPlus size={20} /> Nuevo Contenido
              </Button>
              <label htmlFor="import-manga-json">
                <Input
                  type="file"
                  id="import-manga-json"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
                <Button as="span" variant="outline" title="Importar JSON" style={{ cursor: 'pointer' }}>
                  Importar
                </Button>
              </label>
            </div>
          )}
          <div style={{ display: 'flex', gap: theme.spacing.xs }}>
            <Button variant="outline" size="small" onClick={() => handleExport('json')} title="Exportar JSON">
              <FiDownload size={16} /> JSON
            </Button>
            <Button variant="outline" size="small" onClick={() => handleExport('csv')} title="Exportar CSV">
              <FiDownload size={16} /> CSV
            </Button>
          </div>
        </div>
      </Header>

      <LegalBanner>
        <FiShield />
        <span>Este panel cumple con las políticas de contenido de Google Play. El contenido para adultos está estrictamente regulado.</span>
      </LegalBanner>

      {mangas.length === 0 ? (
        <EmptyState
          title="No hay contenido disponibles"
          message="Comienza agregando un nuevo contenido a tu catálogo."
        />
      ) : (
        <MangasGrid>
          {mangas.map((manga) => (
            <MangaCard key={manga.id} hoverable>
              <MangaImage
                src={manga.coverUrl || manga.portada_url}
                alt={manga.title || manga.titulo}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <MangaInfo>
                <MangaTitle>{manga.title || manga.titulo}</MangaTitle>
                {(manga.description || manga.descripcion) && (
                  <MangaDescription>{manga.description || manga.descripcion}</MangaDescription>
                )}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: theme.colors.bg.light, borderRadius: '4px', color: theme.colors.text.secondary }}>
                    {manga.ageRating || 'EVERYONE'}
                  </span>
                  {manga.isModerated && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: theme.colors.success + '22', color: theme.colors.success, borderRadius: '4px' }}>
                      Moderado
                    </span>
                  )}
                </div>
                <ActionsContainer>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleOpenModal(manga)}
                    >
                      <FiEdit2 size={16} /> Editar
                    </Button>
                  )}
                  {(isAdmin || (user?.role === 'EDITOR' && manga.creatorId === user.id)) && (
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(manga.id)}
                    >
                      <FiTrash2 size={16} /> Eliminar
                    </Button>
                  )}
                  {!canEdit && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleOpenModal(manga)}
                    >
                      Ver Detalles
                    </Button>
                  )}
                </ActionsContainer>
              </MangaInfo>
            </MangaCard>
          ))}
        </MangasGrid>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingManga ? 'Editar Manga' : 'Nuevo Manga'}
        width="600px"
        footer={modalFooter}
      >
        <Form id="manga-form" onSubmit={handleSubmit(onSubmit)}>
          <FormRow>
            <Input
              label="Título *"
              placeholder="Ej: Naruto"
              {...register('title')}
              error={errors.title?.message}
              disabled={isSubmitting}
            />
            <Input
              label="Slug *"
              placeholder="ej-naruto"
              {...register('slug')}
              error={errors.slug?.message}
              disabled={isSubmitting}
            />
          </FormRow>

          <Textarea
            label="Descripción"
            placeholder="Descripción del manga..."
            {...register('description')}
            rows={4}
            disabled={isSubmitting}
          />

          <Input
            label="URL de Portada *"
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            {...register('coverUrl')}
            error={errors.coverUrl?.message}
            disabled={isSubmitting}
          />

          <Input
            label="Autor"
            placeholder="Ej: Masashi Kishimoto"
            {...register('author')}
            error={errors.author?.message}
            disabled={isSubmitting}
          />

          <FormRow>
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: '0.875rem', fontWeight: 500 }}>
                Clasificación por Edad
              </label>
              <Select {...register('ageRating')} disabled={isSubmitting}>
                <option value="EVERYONE">Para todos</option>
                <option value="TEEN">Adolescentes</option>
                <option value="MATURE">Maduro</option>
                <option value="ADULT">Adultos (Restringido)</option>
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <input type="checkbox" id="isModerated" {...register('isModerated')} disabled={isSubmitting} />
                <label htmlFor="isModerated" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Contenido Moderado</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                <input type="checkbox" id="isAdult" disabled />
                <label htmlFor="isAdult" style={{ fontSize: '0.875rem' }}>Contenido Adulto (Deshabilitado)</label>
              </div>
            </div>
          </FormRow>

          <div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontSize: '0.875rem', fontWeight: 500 }}>
              Fuente (Opcional)
            </label>
            <Select {...register('sourceId')} disabled={isSubmitting}>
              <option value="">Seleccionar fuente...</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </Select>
            {errors.sourceId && (
              <span style={{ color: theme.colors.danger, fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.sourceId.message}
              </span>
            )}
          </div>

          {categories.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontWeight: 500 }}>
                Categorías
              </label>
              <CheckboxGroup>
                {categories.map((category) => (
                  <CheckboxLabel key={category.id}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      disabled={isSubmitting}
                    />
                    <span>{category.name || category.nombre}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </div>
          )}
        </Form>
      </Modal>
    </Container>
  )
}

export default MangasManager

