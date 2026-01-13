import styled from 'styled-components'
import { theme } from '../../theme/theme'

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${theme.colors.bg.card};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`

export const Th = styled.th`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg.light};
  color: ${theme.colors.text.secondary};
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid ${theme.colors.border};
  white-space: nowrap;
`

export const Td = styled.td`
  padding: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
  border-bottom: 1px solid ${theme.colors.border};
  vertical-align: middle;
`

export const Tr = styled.tr`
  &:hover {
    background: ${theme.colors.bg.light};
  }
  &:last-child ${Td} {
    border-bottom: none;
  }
`

export const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$active ? '#10b98120' : '#ef444420'};
  color: ${props => props.$active ? '#10b981' : '#ef4444'};
  border: 1px solid ${props => props.$active ? '#10b98140' : '#ef444440'};
`
