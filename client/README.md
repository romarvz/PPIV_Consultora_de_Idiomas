# Lingua Academy - Client

## Estructura del Proyecto

### Archivos Principales

- **`index.html`** - Página principal que incluye tanto la landing page como el punto de entrada para la aplicación React
- **`public/demo.html`** - Sistema de demostración standalone sin autenticación

### Directorios

- **`src/`** - Código fuente de la aplicación React
- **`public/`** - Archivos estáticos servidos directamente
  - **`css/`** - Hojas de estilo organizadas por funcionalidad
  - **`figma-views/`** - Vistas estáticas optimizadas para exportar a Figma

### Rutas de Acceso

1. **Landing Page**: `/` - Página principal de marketing (por defecto)
2. **Demo System**: `/public/demo.html` - Sistema de demostración
3. **React App**: Activada desde la landing page con el botón "Acceder al Sistema"

### CSS Organizado

- **`css/landing.css`** - Estilos para la landing page
- **`css/demo.css`** - Estilos para el sistema demo
- **`css/figma-common.css`** - Estilos comunes para vistas de Figma
- **`css/figma-dashboard.css`** - Estilos específicos del dashboard para Figma

### Scripts de Desarrollo

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Previsualiza build de producción
```

### Flujo de Usuario

1. Usuario accede a `/` → Ve la landing page directamente
2. Desde landing: "Probar Sistema" → `/public/demo.html`
3. Desde landing: "Acceder al Sistema" → Oculta landing y muestra aplicación React con login