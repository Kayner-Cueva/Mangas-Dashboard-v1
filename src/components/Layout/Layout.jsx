import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { Sidebar } from './Sidebar'
import { FiMenu } from 'react-icons/fi'

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.bg.card};
`

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$isCollapsed ? '80px' : '260px'};
  min-height: 100vh;
  transition: margin-left ${theme.transitions.normal};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-left: 0;
  }
`

const MobileHeader = styled.header`
  display: none;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.bg.light};
  border-bottom: 1px solid ${theme.colors.border.light};
  position: sticky;
  top: 0;
  z-index: 90;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  border: none;
  background-color: ${theme.colors.bg.card};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.bg.cardDark};
  }
`

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <LayoutContainer>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <MainContent $isCollapsed={isCollapsed}>
        <MobileHeader>
          <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu size={20} />
          </MenuButton>
        </MobileHeader>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  )
}

