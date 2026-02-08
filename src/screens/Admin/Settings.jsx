import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '../../theme/theme'
import {
    Button,
    Card,
    LoadingSpinner,
    SkeletonRect
} from '../../components/common'
import { apiFetch } from '../../config/apiClient'
import toast from 'react-hot-toast'
import { FiSettings, FiSave, FiAlertCircle, FiUserPlus, FiActivity } from 'react-icons/fi'

const Container = styled.div`
  padding: ${theme.spacing.xl};
`

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: ${theme.spacing.lg};
`

const FormField = styled.div`
  margin-bottom: ${theme.spacing.lg};
`

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.bg.light};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}33;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.bg.light};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.bg.light};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`

const ToggleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${theme.colors.primary};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`

const Settings = () => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistration: true,
        announcement: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const loadSettings = async () => {
        setLoading(true)
        try {
            const data = await apiFetch('/api/settings')
            setSettings(data)
        } catch (err) {
            toast.error('Error al cargar ajustes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await apiFetch('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify(settings)
            })
            toast.success('Ajustes guardados correctamente')
        } catch (err) {
            toast.error('Error al guardar ajustes')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <Header>
                    <Title>Configuración Global</Title>
                </Header>
                <Grid>
                    <SkeletonRect height="200px" />
                    <SkeletonRect height="200px" />
                </Grid>
            </Container>
        )
    }

    return (
        <Container>
            <Header>
                <Title>Configuración Global</Title>
            </Header>

            <Grid>
                <Card style={{ padding: theme.spacing.lg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: theme.spacing.lg }}>
                        <FiActivity size={20} color={theme.colors.primary} />
                        <h2 style={{ fontSize: '1.25rem' }}>Estado del Sistema</h2>
                    </div>

                    <FormField>
                        <ToggleContainer>
                            <ToggleInfo>
                                <FiAlertCircle size={20} color={settings.maintenanceMode ? theme.colors.warning : theme.colors.text.secondary} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Modo Mantenimiento</div>
                                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Bloquea el acceso a clientes mientras trabajas.</div>
                                </div>
                            </ToggleInfo>
                            <Switch>
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <span />
                            </Switch>
                        </ToggleContainer>
                    </FormField>

                    <FormField>
                        <ToggleContainer>
                            <ToggleInfo>
                                <FiUserPlus size={20} color={settings.allowRegistration ? theme.colors.success : theme.colors.text.secondary} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Permitir Registros</div>
                                    <div style={{ fontSize: '0.75rem', color: theme.colors.text.secondary }}>Controla si nuevos usuarios pueden unirse.</div>
                                </div>
                            </ToggleInfo>
                            <Switch>
                                <input
                                    type="checkbox"
                                    checked={settings.allowRegistration}
                                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                />
                                <span />
                            </Switch>
                        </ToggleContainer>
                    </FormField>
                </Card>

                <Card style={{ padding: theme.spacing.lg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: theme.spacing.lg }}>
                        <FiSettings size={20} color={theme.colors.primary} />
                        <h2 style={{ fontSize: '1.25rem' }}>Anuncios y Comunicaciones</h2>
                    </div>

                    <FormField>
                        <Label>Anuncio Global (APK/Web)</Label>
                        <TextArea
                            placeholder="Escribe un mensaje para todos los usuarios..."
                            value={settings.announcement || ''}
                            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                        />
                        <p style={{ fontSize: '0.75rem', color: theme.colors.text.secondary, marginTop: '8px' }}>
                            Este mensaje aparecerá en la pantalla principal de la aplicación.
                        </p>
                    </FormField>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ width: '100%', marginTop: 'auto' }}
                    >
                        {saving ? <LoadingSpinner size="18px" /> : <><FiSave style={{ marginRight: '8px' }} /> Guardar Cambios</>}
                    </Button>
                </Card>
            </Grid>
        </Container>
    )
}

export default Settings
