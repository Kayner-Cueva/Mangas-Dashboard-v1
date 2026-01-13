import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout/Layout'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './theme/theme'

// Screens
import Login from './screens/Auth/Login'
import AdminLogin from './screens/Auth/AdminLogin'
import AdminDashboard from './screens/Admin/AdminDashboard'
import MangasManager from './screens/Admin/MangasManager'
import ChaptersManager from './screens/Admin/ChaptersManager'
import CategoriesManager from './screens/Admin/CategoriesManager'
import SourcesManager from './screens/Admin/SourcesManager'
import UsersManager from './screens/Admin/UsersManager'
import DMCA from './screens/Admin/DMCA'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/panel-admin-x7k9p2" element={<AdminLogin />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route
                path="mangas"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                    <MangasManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chapters"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                    <ChaptersManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                    <CategoriesManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="sources"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                    <SourcesManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UsersManager />
                  </ProtectedRoute>
                }
              />
              <Route path="dmca" element={<DMCA />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

