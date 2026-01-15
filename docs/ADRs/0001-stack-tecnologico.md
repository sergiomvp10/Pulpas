# ADR 0001: Stack Tecnológico

**Fecha**: 2025-11-11  
**Estado**: Aceptado  
**Decisores**: Equipo de desarrollo

## Contexto

Necesitamos seleccionar un stack tecnológico para el sistema de gestión de pulpas de fruta que cumpla con los siguientes requisitos:

1. Autenticación segura con usuario/contraseña
2. Control de inventario por lotes con trazabilidad
3. Sistema de alertas por WhatsApp
4. Generación de etiquetas QR
5. Dashboard con métricas en tiempo real
6. Gestión de fotos de productos
7. Reportes y análisis de ventas
8. Fácil despliegue y mantenimiento
9. Escalabilidad para crecimiento futuro

## Decisión

Hemos decidido usar un stack moderno basado en Next.js con las siguientes tecnologías:

### Frontend y Backend
- **Next.js 14+ (App Router)**: Framework full-stack de React
  - Permite API routes y server actions en el mismo proyecto
  - Server-side rendering para mejor rendimiento
  - Despliegue simple en Vercel
  - Excelente experiencia de desarrollo

- **TypeScript**: Tipado estático
  - Reduce errores en tiempo de desarrollo
  - Mejor autocompletado y refactoring
  - Documentación implícita del código

- **Tailwind CSS**: Framework de utilidades CSS
  - Desarrollo rápido de interfaces
  - Diseño consistente
  - Optimización automática de CSS

- **shadcn/ui**: Biblioteca de componentes
  - Componentes accesibles y personalizables
  - Basados en Radix UI
  - Integración perfecta con Tailwind

### Base de Datos
- **PostgreSQL**: Base de datos relacional
  - Robusta y confiable
  - Soporte para transacciones ACID (crítico para inventario)
  - Excelente rendimiento para consultas complejas
  - Amplio soporte en proveedores cloud

- **Prisma ORM**: Object-Relational Mapping
  - Type-safe database client
  - Migraciones automáticas
  - Prisma Studio para visualización de datos
  - Excelente integración con TypeScript

### Autenticación
- **Auth.js (NextAuth v5)**: Biblioteca de autenticación
  - Soporte para múltiples proveedores
  - Credentials provider para usuario/contraseña
  - Manejo seguro de sesiones
  - Integración nativa con Next.js

- **bcrypt**: Hashing de contraseñas
  - Estándar de la industria
  - Protección contra rainbow tables
  - Configurable cost factor

### Almacenamiento
- **Supabase Storage / Cloudinary**: Almacenamiento de imágenes
  - CDN global para fotos de productos
  - Transformaciones de imagen automáticas
  - URLs firmadas para seguridad

### Notificaciones
- **Twilio WhatsApp API**: Alertas por WhatsApp
  - API confiable y bien documentada
  - Sandbox para desarrollo
  - Fácil migración a WhatsApp Cloud API (Meta) en el futuro

### Generación de Documentos
- **qrcode**: Generación de códigos QR
  - Ligera y rápida
  - Soporte para PNG y SVG

- **react-pdf / pdfkit**: Generación de PDFs
  - Etiquetas imprimibles
  - Reportes descargables

### Despliegue
- **Vercel**: Hosting de aplicación
  - Despliegue automático desde Git
  - Preview deployments para PRs
  - Edge network global
  - Cron jobs para alertas

- **Neon / Supabase**: Hosting de PostgreSQL
  - Serverless PostgreSQL
  - Backups automáticos
  - Escalado automático
  - Free tier generoso

## Alternativas Consideradas

### 1. Backend Separado (NestJS / FastAPI)
**Rechazado porque:**
- Mayor complejidad de despliegue (dos aplicaciones)
- No necesitamos API pública por ahora
- Next.js API routes son suficientes para el MVP
- Podemos extraer backend más adelante si es necesario

### 2. Base de Datos NoSQL (MongoDB)
**Rechazado porque:**
- Inventario requiere transacciones ACID
- Relaciones complejas (lotes, ventas, movimientos)
- PostgreSQL es más apropiado para datos estructurados
- Mejor soporte para consultas analíticas

### 3. Firebase
**Rechazado porque:**
- Menos control sobre la base de datos
- Costos pueden escalar rápidamente
- Migraciones más difíciles
- Preferimos PostgreSQL estándar

### 4. Vue.js / Angular
**Rechazado porque:**
- Next.js ofrece mejor integración full-stack
- React tiene ecosistema más grande
- Mejor soporte para server-side rendering
- shadcn/ui está diseñado para React

## Consecuencias

### Positivas
- **Desarrollo rápido**: Un solo proyecto, un solo lenguaje (TypeScript)
- **Type safety**: Desde BD hasta UI con TypeScript + Prisma
- **Despliegue simple**: Un comando para desplegar todo
- **Escalabilidad**: Fácil extraer servicios más adelante si es necesario
- **Mantenibilidad**: Stack moderno con buena documentación
- **Costo inicial bajo**: Free tiers generosos en Vercel y Neon

### Negativas
- **Vendor lock-in parcial**: Vercel-specific features (cron, edge)
- **Monolito inicial**: Puede requerir refactoring si crece mucho
- **Curva de aprendizaje**: Next.js App Router es relativamente nuevo

### Mitigaciones
- Usar abstracciones para servicios externos (WhatsApp, storage)
- Diseñar código modular desde el inicio
- Documentar decisiones de arquitectura
- Mantener lógica de negocio separada de framework

## Notas

- Esta decisión puede revisarse en 6-12 meses según las necesidades del negocio
- Si se requiere API pública, consideraremos extraer un backend separado
- Si WhatsApp Sandbox no es suficiente, migraremos a WhatsApp Cloud API
- Prisma facilita migración a otro ORM si es necesario

## Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Vercel Platform](https://vercel.com/docs)
