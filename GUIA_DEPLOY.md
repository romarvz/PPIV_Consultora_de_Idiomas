# Guía de Despliegue - Consultora de Idiomas

## 📋 Resumen de Despliegue

### Frontend (Vercel)
- **Ubicación:** `client/`
- **Despliegue:** Automático al hacer push a `main`
- **URL:** Configurada en Vercel Dashboard

### Backend (Servicio externo)
- **Ubicación:** `server/`
- **Despliegue:** Manual (Railway, Render, Heroku, etc.)
- **URL:** Configurada en variables de entorno del frontend

---

## 🔍 Verificación de Configuración

### 1. Verificar Frontend en Vercel

#### A. Verificar Auto-Deploy
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **"Deployments"**
4. Verifica que aparezca **"Auto Deploy"** o **"Git Deploy"**
5. Si dice **"Manual Deploy"**, necesitas configurar la integración con Git

#### B. Verificar Variables de Entorno
1. En Vercel Dashboard → Tu Proyecto → **Settings** → **Environment Variables**
2. Verifica que tengas:
   ```
   VITE_API_URL=https://tu-backend-url.com/api
   VITE_NODE_ENV=production
   ```
3. Si falta `VITE_API_URL`, agrégalo con la URL de tu backend

#### C. Verificar Configuración del Proyecto
1. En Vercel Dashboard → Tu Proyecto → **Settings** → **General**
2. Verifica:
   - **Root Directory:** `client` (si el proyecto está en monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

## 🚀 Desplegar Cambios

### Frontend (Vercel) - Automático

Si tienes **Auto-Deploy** configurado:

1. **Hacer commit y push:**
   ```bash
   git add .
   git commit -m "feat: descripción de cambios"
   git push origin main
   ```

2. **Vercel automáticamente:**
   - Detecta el push
   - Ejecuta `npm install` en `client/`
   - Ejecuta `npm run build`
   - Despliega la nueva versión

3. **Verificar despliegue:**
   - Ve a Vercel Dashboard → Deployments
   - Verás un nuevo deployment con estado "Building" → "Ready"
   - El tiempo típico es 2-5 minutos

### Frontend (Vercel) - Manual

Si NO tienes Auto-Deploy:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Desde la carpeta client
cd client

# Deploy a producción
vercel --prod
```

---

## 🔧 Backend - Despliegue Manual

### Opción 1: Railway (Recomendado)

1. **Conectar repositorio:**
   - Ve a [Railway](https://railway.app)
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

2. **Configurar proyecto:**
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
   - **Build Command:** (dejar vacío o `npm install`)

3. **Variables de entorno:**
   - Agrega todas las variables de `server/.env`:
     ```
     MONGODB_URI=tu_uri_de_mongodb
     JWT_SECRET=tu_secret
     PORT=5000
     NODE_ENV=production
     CLOUDINARY_CLOUD_NAME=tu_cloud_name
     CLOUDINARY_API_KEY=tu_api_key
     CLOUDINARY_API_SECRET=tu_api_secret
     CLOUDINARY_UPLOAD_FOLDER=ppiv-consultora/courses
     ```

4. **Desplegar:**
   - Railway detecta cambios automáticamente
   - O puedes hacer "Redeploy" manualmente

### Opción 2: Render

1. **Crear servicio:**
   - Ve a [Render](https://render.com)
   - Click en "New" → "Web Service"
   - Conecta tu repositorio

2. **Configuración:**
   - **Name:** consultora-backend
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Variables de entorno:**
   - Agrega todas las variables del `.env`

4. **Desplegar:**
   - Render despliega automáticamente al hacer push

### Opción 3: Heroku

```bash
# Instalar Heroku CLI
npm i -g heroku

# Login
heroku login

# Crear app (solo primera vez)
cd server
heroku create tu-app-name

# Configurar variables
heroku config:set MONGODB_URI=tu_uri
heroku config:set JWT_SECRET=tu_secret
# ... agregar todas las variables

# Desplegar
git push heroku main
```

---

## 📝 Checklist de Despliegue

### Antes de Desplegar

- [ ] Todos los cambios están commiteados
- [ ] Los cambios están pusheados al repositorio
- [ ] Variables de entorno configuradas en el servicio de despliegue
- [ ] Backend tiene acceso a MongoDB Atlas
- [ ] Frontend tiene la URL correcta del backend en `VITE_API_URL`

### Después de Desplegar

- [ ] Verificar que el frontend carga correctamente
- [ ] Verificar que el backend responde en `/api`
- [ ] Probar login con credenciales de admin
- [ ] Verificar que las nuevas funcionalidades funcionan

---

## 🔄 Cambios Recientes que Requieren Despliegue

### Backend (requiere despliegue manual):
1. ✅ Validación de nivel de estudiante para inscripciones
2. ✅ Capitalización de nombres compuestos
3. ✅ Validación de condicion al registrar estudiantes
4. ✅ Removidas operaciones peligrosas (dropDatabase)

### Frontend (se despliega automáticamente si tienes Auto-Deploy):
1. ✅ Límite de profesores aumentado a 100

---

## 🆘 Troubleshooting

### Frontend no se actualiza en Vercel
- Verifica que hiciste push a la rama `main`
- Revisa los logs en Vercel Dashboard → Deployments
- Verifica que no haya errores de build

### Backend no responde
- Verifica que el servicio esté corriendo (Railway/Render/Heroku)
- Revisa los logs del servicio
- Verifica que las variables de entorno estén correctas
- Verifica que MongoDB Atlas permita conexiones desde la IP del servicio

### Variables de entorno no funcionan
- En Vercel: Verifica que empiecen con `VITE_` para variables del frontend
- En Backend: Verifica que todas las variables estén en el servicio de despliegue
- Reinicia el servicio después de cambiar variables

---

## 📞 Comandos Útiles

```bash
# Ver estado de git
git status

# Ver últimos commits
git log --oneline -5

# Verificar cambios pendientes
git diff

# Push a producción
git push origin main

# Verificar que el backend está corriendo localmente
cd server
npm run dev

# Verificar que el frontend build funciona
cd client
npm run build
```

---

## ⚠️ Importante

- **Nunca** hagas push de archivos `.env` al repositorio
- **Siempre** verifica que las variables de entorno estén configuradas antes de desplegar
- **Revisa** los logs después de cada despliegue para detectar errores temprano

