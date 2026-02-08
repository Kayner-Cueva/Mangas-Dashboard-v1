# 📚 Guía Detallada del Proyecto: Manga Dashboard

Este documento proporciona una visión integral de **Manga Dashboard**, una plataforma profesional diseñada para la gestión de catálogos de manga, detallando sus funcionalidades, arquitectura y tecnologías utilizadas.

---

## 🛠️ Lenguajes y Tecnologías
El proyecto utiliza un stack moderno y profesional (PERN modificado con Vite):

### **Frontend**
- **Lenguaje**: JavaScript (Vite / React 19)
- **Estilos**: `styled-components` para un diseño premium y modular.
- **Gestión de Formularios**: `react-hook-form` con validación de esquemas mediante `zod`.
- **Iconografía**: `react-icons`.
- **Notificaciones**: `react-hot-toast` para feedback en tiempo real.

### **Backend**
- **Lenguaje**: **TypeScript** (Node.js + Express)
- **ORM**: **Prisma** (con tipado fuerte para PostgreSQL)
- **Base de Datos**: **PostgreSQL**
- **Documentación**: **Swagger** (OpenAPI 3.0) para la especificación de la API.
- **Seguridad**: `bcryptjs` para hashing de contraseñas y `jsonwebtoken` para autenticación.

---

## 🚀 Funcionalidades Detalladas

### 1. 🔐 Seguridad y Autenticación
- **Sistema de Tokens Dual**: Usa Access Tokens de corta vida y Refresh Tokens almacenados en base de datos.
- **Cookies HTTP-Only**: Los tokens se manejan de forma segura en el navegador para evitar ataques XSS.
- **RBAC (Control de Acceso Basado en Roles)**:
  - **ADMIN**: Acceso total a estadísticas, gestión de usuarios, exportación y configuración global.
  - **EDITOR**: Gestión de contenido. Solo puede eliminar lo que él mismo ha creado.
  - **USER**: Rol para aplicaciones consumidoras (APK), sin acceso al dashboard.
- **Rate Limiting**: Protección contra ataques de fuerza bruta en todos los endpoints de la API.

### 2. 📑 Gestión de Contenido (CRUD)
- **Mangas**: Administración de metadata (título, autor, descripción, estado, clasificación de edad).
- **Capítulos**: Gestión de capítulos asociados a mangas, permitiendo añadir páginas y gestionar el orden.
- **Categorías**: Organización del catálogo por géneros o temáticas.
- **Fuentes**: Gestión de los orígenes del contenido (sites de donde se extrae la información).

### 3. 📊 Dashboard Administrativo
- **Estadísticas en Tiempo Real**: Visualización de cantidad de mangas, capítulos y categorías.
- **Actividad Reciente**: Gráficos o listas que muestran el crecimiento de usuarios y contenido en los últimos 7 días.
- **Interfaz Premium**: Sidebar colapsable, estados de carga (Skeletons) y diseño responsivo.

### 4. ⚖️ Cumplimiento y Políticas (Google Play Ready)
- **Clasificación por Edad**: Soporte para marcar contenido como adulto (`isAdult`).
- **Moderación**: Herramientas integradas para moderar el contenido del catálogo.
- **Derechos de Autor**: Secciones dedicadas a Avisos Legales, DMCA y Copyright.
- **Eliminación de Datos**: Sistema para que los usuarios soliciten el borrado de su cuenta y datos personales, cumpliendo normativas internacionales.

### 5. 📤 Herramientas de Datos
- **Exportación**: Los administradores pueden descargar la metadata de los mangas, fuentes y categorías en formatos **JSON** y **CSV** para respaldos o análisis externos.

---

## 🏗️ Arquitectura y Estructura
El proyecto sigue una arquitectura **desacoplada**:

- **Cliente (`/src`)**: Una Single Page Application (SPA) optimizada con Vite.
- **Servidor (`/server`)**: Una API REST robusta con TypeScript.
- **Validación Dual**: Todas las entradas de datos se validan en el cliente (para UX) y en el servidor (para integridad de datos) usando **Zod**.

---

## 📜 Resumen de Desarrollo
El proyecto ha evolucionado a través de más de 20 fases, pasando de una base simple a una plataforma empresarial con:
- Eliminación de dependencias obsoletas (Supabase).
- Implementación de un sistema de login seguro y separado (Admin vs Editor).
- Optimización de rendimiento mediante **debouncing** y reordenamiento de middlewares.
- Refactorización constante para mantener un código limpio y escalable.

---
*Este documento resume la esencia técnica y funcional de Manga Dashboard v1.0.*
