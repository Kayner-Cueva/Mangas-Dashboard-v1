import styled from 'styled-components'
import { theme } from '../../theme/theme'

const StyledCard = styled.div`
  background-color: ${theme.colors.bg.light};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${props => props.$padding || theme.spacing.lg};
  border: 1px solid ${theme.colors.border.light};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    box-shadow: ${props => props.$hoverable ? theme.shadows.lg : theme.shadows.md};
    ${props => props.$hoverable && 'transform: translateY(-2px);'}
  }
`

export const Card = ({ children, padding, hoverable = false, ...props }) => {
  return (
    <StyledCard $padding={padding} $hoverable={hoverable} {...props}>
      {children}
    </StyledCard>
  )
}

