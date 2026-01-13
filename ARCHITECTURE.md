# 🏗️ Arquitectura del Sistema - Manga Dashboard

Este documento detalla las decisiones técnicas y la estructura del proyecto Manga Dashboard v1.0.

## 1. Visión General
El sistema está diseñado como una plataforma desacoplada (Decoupled Architecture) donde el Frontend y el Backend se comunican exclusivamente a través de una API RESTful.

## 2. Frontend (React 19)
- **Framework**: React 19 con Vite para un desarrollo rápido y bundles optimizados.
- **Estilos**: `styled-components` para un diseño modular y dinámico.
- **Gestión de Formularios**: `react-hook-form` + `zod` para validaciones estrictas en el cliente.
- **Autenticación**: Context API (`AuthContext`) que gestiona el estado global del usuario y la persistencia del Access Token, con lógica de auto-refresco integrada.
- **Layout Dinámico**: Sistema de navegación con **Sidebar Colapsable** que utiliza estados de React y transiciones CSS para optimizar el espacio en escritorio.
- **Componentes Comunes**: Biblioteca interna de componentes reutilizables (`Button`, `Table`, `LoadingSpinner`, `EmptyState`, `Skeleton`, `Badge`).

## 3. Backend (Node.js + Express + TypeScript)
- **Lenguaje**: TypeScript para asegurar la integridad de los datos y facilitar el mantenimiento.
- **ORM**: Prisma para el acceso a la base de datos PostgreSQL con tipado fuerte.
- **Seguridad**:
    - **JWT**: Access Tokens de corta duración.
    - **Refresh Tokens Estables**: Almacenados en base de datos y entregados vía Cookies HTTP-only. Se utiliza un mecanismo de refresco que no rota el token innecesariamente para evitar errores de concurrencia.
    - **RBAC**: Middleware de autorización que valida roles (`ADMIN`, `EDITOR`, `USER`).
    - **Rate Limiting**: Protección configurada para permitir el flujo normal de desarrollo (500 req/15min) mientras protege contra abusos.
- **Documentación**: Swagger (OpenAPI 3.0) integrado para pruebas y referencia de la API.

## 4. Base de Datos (PostgreSQL)
El esquema de Prisma define las siguientes entidades principales:
- `User`: Gestión de cuentas, roles y estado de actividad.
- `Manga`: Metadata del manga, incluyendo clasificación por edad, moderación y autor.
- `Chapter`: Gestión de capítulos y sus respectivas páginas.
- `Category` & `Source`: Organización y origen del contenido.
- `Stat`: Seguimiento de visualizaciones y actividad reciente.
- `UserDeletionRequest`: Sistema para cumplimiento de privacidad (Google Play).

## 5. Decisiones Técnicas Clave
- **Validación Dual**: Se implementó validación con Zod tanto en el Frontend (para UX inmediata) como en el Backend (para integridad de datos).
- **Optimización de API**: Uso de técnicas de **Debouncing** en el cliente y reordenamiento de middlewares en el servidor para una comunicación más fluida y diagnósticos precisos.
- **RBAC Granular**: Sistema de permisos que combina roles (`ADMIN`, `EDITOR`) con **Propiedad de Contenido**. Los editores tienen autonomía sobre su propio contenido pero no pueden interferir con el de otros.
- **Cumplimiento de Políticas**: El campo `isAdult` y el sistema de moderación fueron diseñados específicamente para cumplir con las normativas de distribución de Google Play.
- **Exportación de Datos**: Implementada en el cliente para permitir a los administradores respaldar la metadata en formatos universales (JSON/CSV).
