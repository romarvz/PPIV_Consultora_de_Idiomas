# Deploy Frontend en Vercel

## Pasos para Deploy

### 1. Preparación
- ✅ Configuración de Vercel (`vercel.json`)
- ✅ Variables de entorno configuradas
- ✅ Build optimizado con Vite
- ✅ API URL dinámica

### 2. Variables de Entorno en Vercel
Configurar en el dashboard de Vercel:

```
VITE_API_URL=https://tu-backend-url.herokuapp.com/api
VITE_NODE_ENV=production
```

### 3. Comandos de Build
```bash
# Build local para testing
npm run build:prod

# Preview local
npm run serve
```

### 4. Deploy en Vercel

#### Opción A: Desde GitHub
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático

#### Opción B: CLI de Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 5. Configuración Post-Deploy
- Configurar dominio personalizado (opcional)
- Configurar redirects si es necesario
- Verificar que todas las rutas funcionen

## Estructura de Archivos
```
client/
├── vercel.json          # Configuración Vercel
├── .env.production      # Variables producción
├── .env.example         # Ejemplo variables
├── vite.config.js       # Config optimizada
└── dist/               # Build output
```

## Troubleshooting
- Si hay errores de routing: verificar `vercel.json`
- Si API no conecta: verificar `VITE_API_URL`
- Si build falla: verificar dependencias en `package.json`