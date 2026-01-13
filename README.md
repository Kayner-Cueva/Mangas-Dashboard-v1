# 📚 Manga Dashboard - Plataforma de Administración Profesional

Manga Dashboard es una solución robusta y moderna para la gestión integral de catálogos de manga. Diseñada con un enfoque en la escalabilidad, seguridad y experiencia de usuario, esta plataforma permite administrar mangas, capítulos, categorías y fuentes de manera eficiente.

## 📌 Estado del Proyecto

**Estado:** Web Platform v1.1 – Estable 
Este proyecto corresponde exclusivamente a la plataforma web administrativa. Cualquier desarrollo futuro (clientes móviles u otros consumidores de la API) se considerará una fase independiente.

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura desacoplada de alto rendimiento:

- **Frontend**: React 19 + Vite (Puerto 3000) + Styled Components (UI/UX Premium)
- **Backend**: Node.js + Express + TypeScript
- **ORM**: Prisma (Type-safe database access)
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (Access & Refresh Tokens) con Cookies HTTP-only y sistema de refresco estable (Race-condition free)
- **Documentación**: Swagger / OpenAPI 3.0

## 🚀 Características Principales

- 🔐 **Seguridad Avanzada**: Autenticación robusta con manejo de sesiones mediante Refresh Tokens estables y protección contra ataques de fuerza bruta (Rate Limiting).
- 🛡️ **RBAC (Role-Based Access Control)**: Sistema de permisos basado en roles para proteger operaciones críticas.
- 📱 **UI/UX Profesional**: Interfaz moderna con **Sidebar Colapsable Minimalista**, Skeletons para carga fluida, tablas dinámicas y formularios validados con `react-hook-form`.
- 📑 **Gestión de Contenido**: CRUD completo de Mangas, Capítulos, Categorías y Fuentes con selectores dinámicos inteligentes.
- 📊 **Dashboard de Estadísticas**: Vista general del estado del catálogo en tiempo real con conteo de usuarios y actividad reciente.
- ⚖️ **Cumplimiento Google Play**: Implementación de moderación de contenido, clasificación por edad (Age Rating) y sistema de eliminación de datos de usuario.
- 👥 **Gestión de Usuarios**: Panel administrativo para control de roles, activación/desactivación de cuentas y seguimiento de actividad.
- 📤 **Exportación de Datos**: Funcionalidad para exportar metadata del catálogo en formatos JSON y CSV.

## ⚖️ Aviso Legal

Esta plataforma funciona exclusivamente como un sistema administrativo y de catálogo. No aloja, distribuye ni modifica contenido con derechos de autor. Toda la información gestionada corresponde a metadata y enlaces externos.

## 📋 Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **PostgreSQL**: Instancia local o remota
- **npm**: v9.0.0 o superior

## 🛠️ Configuración e Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd mangas-dashboard
```

### 2. Configuración del Backend
```bash
cd server
npm install
```
Crea un archivo `.env` en la carpeta `server/` con las siguientes variables:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/mangas_db?schema=public"
JWT_SECRET="tu_secreto_para_access_token"
REFRESH_TOKEN_SECRET="tu_secreto_para_refresh_token"
API_PORT=4000
FRONTEND_URL="http://localhost:3000"
```
Ejecuta las migraciones de Prisma:
```bash
npx prisma migrate dev
```

### 3. Configuración del Frontend
```bash
cd ..
npm install
```
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL="http://localhost:4000"
```

## 📦 Scripts Disponibles

### Backend (`/server`)
- `npm run dev`: Inicia el servidor de desarrollo con recarga automática.
- `npm run build`: Compila el proyecto TypeScript a JavaScript.
- `npm run test`: Ejecuta la suite de pruebas con Jest.
- `npm run prisma:studio`: Abre la interfaz visual para explorar la base de datos.

### Frontend (Raíz)
- `npm run dev`: Inicia el entorno de desarrollo de Vite.
- `npm run build`: Genera el bundle optimizado para producción.

## 👥 Modelo de Permisos

El sistema utiliza un control de acceso basado en roles (RBAC) para garantizar la seguridad y la integridad del contenido:

- **ADMIN**: Control total del sistema (usuarios, exportación, estadísticas y configuración global).
- **EDITOR**: Gestión de contenido (mangas, capítulos, categorías, fuentes). Solo puede eliminar el contenido que ha creado personalmente.
- **USER**: Rol reservado para clientes finales (APK). Gestionado exclusivamente por la API pública, no tiene acceso al Dashboard administrativo.

## 🧠 Documentación Técnica

- [Arquitectura y decisiones técnicas](./ARCHITECTURE.md)
- [Historial detallado de desarrollo y fases](./DEVELOPMENT_HISTORY.md)
- [Reporte de evolución](./REPORT.md)

---

Este proyecto fue diseñado siguiendo buenas prácticas de arquitectura, seguridad y cumplimiento de políticas de distribución (Google Play), con el objetivo de servir como base sólida para productos reales.

Desarrollado con ❤️ para la comunidad de Manga.

