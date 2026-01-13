import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { Button } from './Button'
import { FiX } from 'react-icons/fi'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.md};
`

const ModalContainer = styled.div`
  background-color: ${theme.colors.bg.light};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  max-width: ${props => props.width || '600px'};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.light};
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.md};
  border: none;
  background-color: transparent;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.bg.card};
    color: ${theme.colors.text.primary};
  }
`

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.light};
`

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width,
  footer 
}) => {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer width={width} onClick={e => e.stopPropagation()}>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <CloseButton onClick={onClose}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>
  )
}

