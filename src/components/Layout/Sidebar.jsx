import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { useAuth } from '../../context/AuthContext'
import {
  FiLayout,
  FiBook,
  FiFileText,
  FiTag,
  FiLogOut,
  FiMenu,
  FiX,
  FiUsers,
  FiSettings
} from 'react-icons/fi'

const SidebarContainer = styled.aside`
  width: ${props => props.$isCollapsed ? '80px' : '260px'};
  min-height: 100vh;
  background-color: ${theme.colors.bg.dark};
  color: ${theme.colors.text.light};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width ${theme.transitions.normal};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 260px;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    transition: transform ${theme.transitions.normal};
    box-shadow: ${theme.shadows.xl};
  }
`

const SidebarHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.dark};
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'space-between'};
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: 1.25rem;
  font-weight: 700;
  
  span {
    display: ${props => props.$isCollapsed ? 'none' : 'block'};
  }
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.bg.cardDark};
    color: ${theme.colors.text.light};
  }
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${theme.colors.text.light};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.bg.cardDark};
  }
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: block;
  }
`

const Nav = styled.nav`
  flex: 1;
  padding: ${theme.spacing.md};
  overflow-y: auto;
`

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const NavItem = styled.li`
  width: 100%;
`

const NavLinkStyled = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  font-weight: 500;
  
  &:hover {
    background-color: ${theme.colors.bg.cardDark};
    color: ${theme.colors.text.light};
  }
  
  &.active {
    background-color: ${theme.colors.primary};
    color: white;
  }
  
  span {
    display: ${props => props.$isCollapsed ? 'none' : 'block'};
  }
  
  svg {
    width: 20px;
    height: 20px;
    min-width: 20px;
  }
`

const SidebarFooter = styled.div`
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.dark};
`

const UserInfo = styled.div`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.cardDark};
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
`

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  word-break: break-word;
`

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: transparent;
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border.dark};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-weight: 500;
  
  &:hover {
    background-color: ${theme.colors.error}20;
    color: ${theme.colors.error};
    border-color: ${theme.colors.error};
  }
  
  span {
    display: ${props => props.$isCollapsed ? 'none' : 'block'};
  }
  
  svg {
    width: 20px;
    height: 20px;
    min-width: 20px;
  }
`

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
        <SidebarHeader $isCollapsed={isCollapsed}>
          <Logo $isCollapsed={isCollapsed}>
            <span>Panel Contenido</span>
          </Logo>
          {!isCollapsed && (
            <CloseButton onClick={onClose}>
              <FiX size={20} />
            </CloseButton>
          )}
          <ToggleButton onClick={onToggleCollapse}>
            <FiMenu size={20} />
          </ToggleButton>
        </SidebarHeader>

        <Nav>
          <NavList>
            <NavItem>
              <NavLinkStyled to="/dashboard" onClick={onClose} $isCollapsed={isCollapsed}>
                <FiLayout /> <span>Dashboard</span>
              </NavLinkStyled>
            </NavItem>
            <NavItem>
              <NavLinkStyled to="/mangas" onClick={onClose} $isCollapsed={isCollapsed}>
                <FiBook /> <span>Contenido</span>
              </NavLinkStyled>
            </NavItem>
            <NavItem>
              <NavLinkStyled to="/chapters" onClick={onClose} $isCollapsed={isCollapsed}>
                <FiFileText /> <span>Capítulos</span>
              </NavLinkStyled>
            </NavItem>
            {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
              <>
                <NavItem>
                  <NavLinkStyled to="/categories" onClick={onClose} $isCollapsed={isCollapsed}>
                    <FiTag /> <span>Categorías</span>
                  </NavLinkStyled>
                </NavItem>
                <NavItem>
                  <NavLinkStyled to="/sources" onClick={onClose} $isCollapsed={isCollapsed}>
                    <FiTag /> <span>Fuentes</span>
                  </NavLinkStyled>
                </NavItem>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <NavItem>
                  <NavLinkStyled to="/users" onClick={onClose} $isCollapsed={isCollapsed}>
                    <FiUsers /> <span>Usuarios</span>
                  </NavLinkStyled>
                </NavItem>
                <NavItem>
                  <NavLinkStyled to="/settings" onClick={onClose} $isCollapsed={isCollapsed}>
                    <FiSettings /> <span>Configuración</span>
                  </NavLinkStyled>
                </NavItem>
              </>
            )}
          </NavList>
        </Nav>

        <SidebarFooter>
          {user && (
            <UserInfo $isCollapsed={isCollapsed}>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
          )}
          <LogoutButton onClick={handleLogout} $isCollapsed={isCollapsed}>
            <FiLogOut /> <span>Cerrar Sesión</span>
          </LogoutButton>
        </SidebarFooter>
      </SidebarContainer>
    </>
  )
}

