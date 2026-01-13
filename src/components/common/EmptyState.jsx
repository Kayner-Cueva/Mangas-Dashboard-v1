import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { FiInbox } from 'react-icons/fi'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxl} ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.text.secondary};
  background: ${theme.colors.bg.light};
  border-radius: ${theme.borderRadius.lg};
  border: 2px dashed ${theme.colors.border.light};
  margin: ${theme.spacing.xl} 0;
`

const IconWrapper = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
  opacity: 0.5;
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`

const Message = styled.p`
  font-size: 1rem;
  max-width: 400px;
`

export const EmptyState = ({ title = 'No hay datos', message = 'No se encontraron elementos para mostrar.', icon: Icon = FiInbox }) => (
    <Container>
        <IconWrapper>
            <Icon />
        </IconWrapper>
        <Title>{title}</Title>
        <Message>{message}</Message>
    </Container>
)
