import styled from 'styled-components'
import { theme } from '../../theme/theme'

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text.primary};
`

const StyledInput = styled.input`
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
  
  &:disabled {
    background-color: ${theme.colors.bg.card};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: 1rem;
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.light};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight}33;
  }
  
  &:disabled {
    background-color: ${theme.colors.bg.card};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: ${theme.colors.error};
`

export const Input = ({ label, error, type = 'text', ...props }) => {
  const Component = type === 'textarea' ? StyledTextarea : StyledInput
  
  return (
    <InputContainer>
      {label && <Label>{label}</Label>}
      <Component type={type} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  )
}

export const Textarea = ({ label, error, ...props }) => {
  return (
    <InputContainer>
      {label && <Label>{label}</Label>}
      <StyledTextarea {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  )
}

