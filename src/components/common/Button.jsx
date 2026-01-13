import styled from 'styled-components'
import { theme } from '../../theme/theme'

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${props => {
    if (props.$size === 'small') return `${theme.spacing.sm} ${theme.spacing.md}`
    if (props.$size === 'large') return `${theme.spacing.md} ${theme.spacing.xl}`
    return `${theme.spacing.md} ${theme.spacing.lg}`
  }};
  font-size: ${props => {
    if (props.$size === 'small') return '0.875rem'
    if (props.$size === 'large') return '1.125rem'
    return '1rem'
  }};
  font-weight: 500;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  cursor: pointer;
  border: none;
  
  ${props => {
    if (props.$variant === 'primary') {
      return `
        background-color: ${theme.colors.primary};
        color: white;
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryDark};
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.md};
        }
      `
    }
    if (props.$variant === 'secondary') {
      return `
        background-color: ${theme.colors.secondary};
        color: white;
        &:hover:not(:disabled) {
          background-color: #7c3aed;
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.md};
        }
      `
    }
    if (props.$variant === 'outline') {
      return `
        background-color: transparent;
        color: ${theme.colors.primary};
        border: 2px solid ${theme.colors.primary};
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary};
          color: white;
        }
      `
    }
    if (props.$variant === 'danger') {
      return `
        background-color: ${theme.colors.error};
        color: white;
        &:hover:not(:disabled) {
          background-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.md};
        }
      `
    }
    return `
      background-color: ${theme.colors.bg.cardDark};
      color: ${theme.colors.text.light};
      &:hover:not(:disabled) {
        background-color: ${theme.colors.text.secondary};
      }
    `
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

export const Button = ({ children, variant = 'primary', size = 'medium', ...props }) => {
  return (
    <StyledButton $variant={variant} $size={size} {...props}>
      {children}
    </StyledButton>
  )
}

