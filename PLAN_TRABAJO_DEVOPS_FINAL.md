# 🚀 PLAN DE TRABAJO - TP INTEGRADOR DEVOPS
**Proyecto:** Sistema Consultora de Idiomas  
**Fecha límite:** 16/11/2025  
**Equipo:** 5 Desarrolladoras

---

## 👥 EQUIPO DE TRABAJO

- **Roma** - Dockerización
- **Dani** - Tests Backend
- **Lore** - Tests Frontend
- **Aye** - CI/CD Pipeline
- **Vero** - Tests E2E + Logging + Diagramas (Disponible: Vie 8 - Lun 10 AM)

---

## 📋 DISTRIBUCIÓN DE DOCUMENTACIÓN

**Cada desarrolladora documenta solo su parte:**
- **Roma:** docs/DOCKER_GUIDE.md + video docker-compose
- **Dani:** docs/TESTING_BACKEND.md + screenshots tests backend
- **Lore:** docs/TESTING_FRONTEND.md + screenshots tests frontend
- **Aye:** README (sección CI/CD) + screenshots pipeline
- **Vero:** docs/MONITORING.md + diagramas base

**Coordinación final (Jueves 14 - voluntaria o sorteo):**
- Ensamblar README completo
- Video demo final integrador (2-3 min)
- Verificar links y formato
- Crear release v1.0.0

---

## 👤 ROMA - DOCKERIZACIÓN

### **Issue: Dockerización del Sistema**

**Responsable:** Roma  
**Etiquetas:** `docker`, `infraestructura`, `alta-prioridad`  
**Estimación:** 2-3 días

---

### **DÍA 1-2 (Viernes 8 - Sábado 9): Setup Docker Backend**

#### **Preparación**
- [ ] Instalar Docker Desktop en mi PC
- [ ] Verificar que Docker funciona: `docker --version`
- [ ] Crear cuenta en Docker Hub (https://hub.docker.com)
- [ ] Clonar repositorio DevOps en mi máquina
- [ ] Revisar estructura del backend actual

#### **Crear Dockerfile para Backend**
- [ ] Crear archivo `backend/Dockerfile`
- [ ] Definir imagen base: `FROM node:18-alpine`
- [ ] Copiar package.json y package-lock.json
- [ ] Instalar dependencias: `RUN npm ci --only=production`
- [ ] Copiar código fuente
- [ ] Exponer puerto: `EXPOSE 5000`
- [ ] Definir CMD: `CMD ["node", "index.js"]`
- [ ] Crear `.dockerignore` (excluir node_modules, .env, .git)

#### **Probar Build Backend**
- [ ] Construir imagen: `docker build -t consultora-backend ./backend`
- [ ] Verificar que la imagen se creó: `docker images`
- [ ] Probar contenedor: `docker run -p 5000:5000 consultora-backend`
- [ ] Verificar endpoint: `curl http://localhost:5000/api/auth/test`
- [ ] Documentar errores encontrados y soluciones

#### **Checkpoint Día 1-2**
- [ ] Screenshot de imagen creada en Docker
- [ ] Screenshot de contenedor corriendo
- [ ] Commit y push: `git commit -m "feat(docker): Dockerfile backend - Roma"`

---

### **DÍA 3-4 (Domingo 10 - Lunes 11): Frontend + MongoDB**

#### **Crear Dockerfile para Frontend**
- [ ] Crear archivo `frontend/Dockerfile`
- [ ] Etapa 1 (build): compilar React con Vite
- [ ] Etapa 2 (producción): usar nginx para servir
- [ ] Copiar build de frontend a nginx
- [ ] Configurar nginx.conf para SPA (React Router)
- [ ] Exponer puerto: `EXPOSE 80`

#### **Probar Build Frontend**
- [ ] Construir imagen: `docker build -t consultora-frontend ./frontend`
- [ ] Verificar imagen creada
- [ ] Probar contenedor: `docker run -p 3000:80 consultora-frontend`
- [ ] Abrir http://localhost:3000 en navegador
- [ ] Verificar que se ve la interfaz

#### **Crear docker-compose.yml**
- [ ] Crear archivo `docker-compose.yml` en raíz
- [ ] Definir servicio `backend`
  - [ ] Imagen: consultora-backend
  - [ ] Puerto: 5000:5000
  - [ ] Variables de entorno (.env)
  - [ ] Dependencia de MongoDB
- [ ] Definir servicio `frontend`
  - [ ] Imagen: consultora-frontend
  - [ ] Puerto: 3000:80
  - [ ] Dependencia de backend
- [ ] Definir servicio `mongodb`
  - [ ] Imagen: mongo:latest
  - [ ] Puerto: 27017:27017
  - [ ] Volumen para persistencia
- [ ] Definir networks para conectar servicios

#### **Probar docker-compose**
- [ ] Ejecutar: `docker-compose up -d`
- [ ] Verificar 3 contenedores corriendo: `docker-compose ps`
- [ ] Probar frontend en http://localhost:3000
- [ ] Probar backend en http://localhost:5000
- [ ] Verificar logs sin errores: `docker-compose logs`

#### **Checkpoint Día 3-4**
- [ ] Screenshot de `docker-compose ps`
- [ ] Screenshot de app corriendo en navegador
- [ ] Commit: `git commit -m "feat(docker): docker-compose completo - Roma"`

---

### **DÍA 5-6 (Martes 12 - Miércoles 13): Optimización + Docker Hub**

#### **Optimizar Dockerfiles**
- [ ] Backend: Usar multi-stage build (opcional)
- [ ] Frontend: Optimizar tamaño de imagen
- [ ] Agregar healthchecks en docker-compose
- [ ] Configurar restart policies (restart: always)

#### **Docker Hub**
- [ ] Login en Docker Hub: `docker login`
- [ ] Taggear imagen backend: `docker tag consultora-backend usuario/consultora-backend:latest`
- [ ] Taggear imagen frontend: `docker tag consultora-frontend usuario/consultora-frontend:latest`
- [ ] Push backend: `docker push usuario/consultora-backend:latest`
- [ ] Push frontend: `docker push usuario/consultora-frontend:latest`
- [ ] Verificar imágenes en Docker Hub web

#### **Testing Final**
- [ ] Hacer down: `docker-compose down -v`
- [ ] Limpiar todo: `docker system prune -a`
- [ ] Levantar desde cero: `docker-compose up -d`
- [ ] Verificar que TODO funciona
- [ ] Probar que frontend puede llamar a backend
- [ ] Probar login con usuario de prueba

#### **MI DOCUMENTACIÓN (Roma)**
- [ ] Crear `docs/DOCKER_GUIDE.md`
  - [ ] Requisitos previos (instalar Docker)
  - [ ] Comandos para construir imágenes
  - [ ] Comandos docker-compose básicos
  - [ ] Troubleshooting común
  - [ ] Variables de entorno necesarias
- [ ] Grabar video corto (1 min): Levantar con `docker-compose up`
- [ ] Tomar screenshots:
  - [ ] docker-compose ps
  - [ ] Docker Hub con imágenes
  - [ ] App corriendo en browser

#### **Checkpoint Día 5-6**
- [ ] docs/DOCKER_GUIDE.md completado
- [ ] Screenshots tomados
- [ ] Video corto grabado
- [ ] Commit final: `git commit -m "docs(docker): guía completa - Roma"`

---

### **Entregables ROMA**
- [ ] `backend/Dockerfile`
- [ ] `frontend/Dockerfile`
- [ ] `docker-compose.yml`
- [ ] `.dockerignore` (backend y frontend)
- [ ] `docs/DOCKER_GUIDE.md`
- [ ] Imágenes en Docker Hub
- [ ] Screenshots
- [ ] Video corto (1 min)

---

## 👤 DANI - TESTS BACKEND

### **Issue: Testing Automatizado Backend**

**Responsable:** Dani  
**Etiquetas:** `testing`, `backend`, `jest`, `alta-prioridad`  
**Estimación:** 2-3 días

---

### **DÍA 1-2 (Viernes 8 - Sábado 9): Setup + Tests Unitarios**

#### **Preparación**
- [ ] Clonar repositorio DevOps
- [ ] Instalar dependencias backend: `cd backend && npm install`
- [ ] Instalar Jest y dependencias de testing:
  ```bash
  npm install --save-dev jest supertest @jest/globals
  ```
- [ ] Crear configuración Jest: `backend/jest.config.js`
- [ ] Agregar script en package.json: `"test": "jest --coverage"`

#### **Tests de Modelos (Mongoose)**
- [ ] Crear carpeta `backend/tests/models/`
- [ ] Crear `tests/models/baseUser.test.js`
  - [ ] Test: Crear usuario estudiante
  - [ ] Test: Validación de email único
  - [ ] Test: Validación de DNI formato
  - [ ] Test: Hash de password
- [ ] Crear `tests/models/profesor.test.js`
  - [ ] Test: Crear profesor con especialidad
  - [ ] Test: Validación de tarifa numérica
  - [ ] Test: Validación de especialidades válidas
- [ ] Crear `tests/models/admin.test.js`
  - [ ] Test: Crear administrador
  - [ ] Test: Permisos de admin

#### **Ejecutar Tests Unitarios**
- [ ] Correr tests: `npm test`
- [ ] Verificar que todos pasan (verde)
- [ ] Revisar coverage: debe ser >60%
- [ ] Capturar screenshot del resultado

#### **Checkpoint Día 1-2**
- [ ] Screenshot de tests pasando
- [ ] Screenshot de coverage report
- [ ] Commit: `git commit -m "test(backend): tests unitarios modelos - Dani"`

---

### **DÍA 3-4 (Domingo 10 - Lunes 11): Tests de Endpoints**

#### **Setup de Tests de API**
- [ ] Crear carpeta `backend/tests/api/`
- [ ] Configurar base de datos de testing (MongoDB en memoria o test DB)
- [ ] Crear helpers para tests (crear usuarios, generar tokens)

#### **Tests de Autenticación**
- [ ] Crear `tests/api/auth.test.js`
  - [ ] Test: POST /api/auth/login - login exitoso
  - [ ] Test: POST /api/auth/login - credenciales incorrectas
  - [ ] Test: POST /api/auth/login - usuario no existe
  - [ ] Test: GET /api/auth/verify-token - token válido
  - [ ] Test: GET /api/auth/verify-token - token inválido
  - [ ] Test: POST /api/auth/logout - cerrar sesión
- [ ] Ejecutar tests de auth: `npm test auth.test.js`
- [ ] Verificar todos pasan

#### **Tests de Usuarios**
- [ ] Crear `tests/api/users.test.js`
  - [ ] Test: POST /register/estudiante - crear estudiante
  - [ ] Test: POST /register/profesor - crear profesor
  - [ ] Test: GET /profile - obtener perfil propio
  - [ ] Test: PUT /profile - actualizar perfil
  - [ ] Test: PUT /change-password - cambiar contraseña
  - [ ] Test: GET /students - listar estudiantes (auth)
  - [ ] Test: PUT /deactivate/:id - desactivar usuario (admin)
  - [ ] Test: DELETE /delete/:id - eliminar usuario (admin)
- [ ] Ejecutar todos los tests
- [ ] Revisar coverage total

#### **Checkpoint Día 3-4**
- [ ] Screenshot de todos los tests pasando
- [ ] Coverage >70%
- [ ] Commit: `git commit -m "test(backend): tests endpoints API - Dani"`

---

### **DÍA 5-6 (Martes 12 - Miércoles 13): Coverage + MI DOCUMENTACIÓN**

#### **Mejorar Coverage**
- [ ] Identificar funciones sin testear
- [ ] Agregar tests faltantes
- [ ] Objetivo: Coverage >75%
- [ ] Generar reporte HTML: `npm test -- --coverage --coverageReporters=html`

#### **Tests de Validaciones (Opcional si da tiempo)**
- [ ] Crear `tests/validators/auth.test.js`
  - [ ] Test: Validación email formato
  - [ ] Test: Validación password débil
  - [ ] Test: Validación DNI inválido
  - [ ] Test: Validación campos requeridos

#### **MI DOCUMENTACIÓN (Dani)**
- [ ] Crear `docs/TESTING_BACKEND.md`
  - [ ] Cómo correr tests: `npm test`
  - [ ] Estructura de carpetas tests
  - [ ] Casos de prueba cubiertos
  - [ ] Coverage alcanzado (tabla con %)
  - [ ] Cómo ver reporte de coverage
- [ ] Tomar screenshots:
  - [ ] Tests pasando en terminal
  - [ ] Reporte de coverage
  - [ ] Coverage HTML (abrir en browser)

#### **Integración con CI**
- [ ] Verificar que tests corren en CI (coordinación con Aye)
- [ ] Asegurar que `npm test` funciona sin errores

#### **Checkpoint Día 5-6**
- [ ] Coverage final >75%
- [ ] docs/TESTING_BACKEND.md completado
- [ ] Screenshots tomados
- [ ] Commit: `git commit -m "docs(backend): documentación testing - Dani"`

---

### **Entregables DANI**
- [ ] Carpeta `backend/tests/` con todos los tests
- [ ] Coverage >75%
- [ ] `docs/TESTING_BACKEND.md`
- [ ] Screenshots de tests pasando
- [ ] Reporte de coverage HTML

---

## 👤 LORE - TESTS FRONTEND

### **Issue: Testing Frontend React**

**Responsable:** Lore  
**Etiquetas:** `testing`, `frontend`, `react`, `alta-prioridad`  
**Estimación:** 2 días

---

### **DÍA 1-2 (Viernes 8 - Sábado 9): Tests de Componentes**

#### **Preparación**
- [ ] Clonar repositorio DevOps
- [ ] Instalar dependencias frontend: `cd frontend && npm install`
- [ ] Instalar testing libraries:
  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
  ```
- [ ] Crear configuración: `frontend/vitest.config.js`
- [ ] Agregar script: `"test": "vitest"` en package.json

#### **Setup de Testing**
- [ ] Crear carpeta `frontend/tests/components/`
- [ ] Crear archivo setup: `tests/setup.js`
- [ ] Configurar mocks de API (axios)

#### **Tests de Componentes UI**
- [ ] Crear `tests/components/Login.test.jsx`
  - [ ] Test: Renderiza formulario de login
  - [ ] Test: Muestra campos email y password
  - [ ] Test: Muestra error si campos vacíos
  - [ ] Test: Llama a API al hacer submit
  - [ ] Test: Redirige después de login exitoso
- [ ] Crear `tests/components/Register.test.jsx`
  - [ ] Test: Renderiza formulario de registro
  - [ ] Test: Validaciones de campos
  - [ ] Test: Muestra errores de validación
- [ ] Crear `tests/components/UserProfile.test.jsx`
  - [ ] Test: Muestra datos del usuario
  - [ ] Test: Permite editar perfil
  - [ ] Test: Guarda cambios correctamente
- [ ] Crear `tests/components/Dashboard.test.jsx`
  - [ ] Test: Renderiza dashboard según rol
  - [ ] Test: Muestra estadísticas

#### **Ejecutar Tests**
- [ ] Correr tests: `npm test`
- [ ] Verificar que todos pasan
- [ ] Generar coverage: `npm test -- --coverage`
- [ ] Objetivo: >60% coverage
- [ ] Capturar screenshots

#### **Checkpoint Día 1-2**
- [ ] Screenshot de tests pasando
- [ ] Screenshot de coverage
- [ ] Commit: `git commit -m "test(frontend): tests componentes React - Lore"`

---

### **DÍA 3-4 (Domingo 10 - Lunes 11): Más Tests + MI DOCUMENTACIÓN**

#### **Tests Adicionales**
- [ ] Crear `tests/components/ProfessorCard.test.jsx` (si existe componente)
- [ ] Crear `tests/components/StudentList.test.jsx` (si existe componente)
- [ ] Crear `tests/hooks/useAuth.test.js` (si tienen custom hooks)

#### **Mejorar Coverage**
- [ ] Identificar componentes sin testear
- [ ] Agregar tests faltantes
- [ ] Revisar coverage final >60%
- [ ] Generar reporte HTML

#### **MI DOCUMENTACIÓN (Lore)**
- [ ] Crear `docs/TESTING_FRONTEND.md`
  - [ ] Cómo correr tests: `npm test`
  - [ ] Estructura de tests
  - [ ] Componentes testeados
  - [ ] Coverage alcanzado
  - [ ] Cómo ver reporte HTML
- [ ] Tomar screenshots:
  - [ ] Tests pasando en terminal
  - [ ] Coverage report
  - [ ] Coverage HTML en browser

#### **Integración con CI**
- [ ] Verificar que tests corren en CI (coordinación con Aye)
- [ ] Asegurar que `npm test` funciona sin errores

#### **Checkpoint Día 3-4**
- [ ] Coverage >60%
- [ ] docs/TESTING_FRONTEND.md completado
- [ ] Screenshots tomados
- [ ] Commit: `git commit -m "docs(frontend): documentación testing - Lore"`

---

### **Entregables LORE**
- [ ] Carpeta `frontend/tests/components/` con todos los tests
- [ ] Coverage >60%
- [ ] `docs/TESTING_FRONTEND.md`
- [ ] Screenshots

---

## 👤 AYE - CI/CD PIPELINE

### **Issue: Pipeline CI/CD con GitHub Actions**

**Responsable:** Aye  
**Etiquetas:** `ci-cd`, `github-actions`, `pipeline`, `alta-prioridad`  
**Estimación:** 3 días

---

### **DÍA 1-2 (Viernes 8 - Sábado 9): GitHub Actions Setup**

#### **Preparación**
- [ ] Clonar repositorio DevOps
- [ ] Crear cuenta en Docker Hub (si no tiene)
- [ ] Estudiar GitHub Actions: https://docs.github.com/actions
- [ ] Revisar ejemplos de workflows Node.js

#### **Configurar Secrets en GitHub**
- [ ] Ir a Settings → Secrets and variables → Actions
- [ ] Agregar `DOCKER_USERNAME` (usuario de Docker Hub)
- [ ] Agregar `DOCKER_PASSWORD` (password de Docker Hub)
- [ ] Agregar `MONGODB_URI` (para tests - puede ser mock)
- [ ] Agregar `JWT_SECRET` (para tests)

#### **Crear Workflow Básico**
- [ ] Crear carpeta `.github/workflows/`
- [ ] Crear archivo `ci-cd.yml`
- [ ] Definir nombre: "CI/CD Pipeline"
- [ ] Definir triggers:
  ```yaml
  on:
    push:
      branches: [ main, dev ]
    pull_request:
      branches: [ main ]
  ```

#### **Job: Test Backend**
- [ ] Configurar job `test-backend`
- [ ] Checkout código: `actions/checkout@v3`
- [ ] Setup Node.js 18: `actions/setup-node@v3`
- [ ] Instalar deps: `npm ci`
- [ ] Correr tests: `npm test`
- [ ] Subir coverage: `actions/upload-artifact@v3`

#### **Job: Test Frontend**
- [ ] Configurar job `test-frontend`
- [ ] Checkout código
- [ ] Setup Node.js 18
- [ ] Instalar deps: `npm ci`
- [ ] Correr tests: `npm test`

#### **Probar Workflow**
- [ ] Hacer commit del workflow
- [ ] Push a rama Dev
- [ ] Ir a GitHub → Actions
- [ ] Verificar ejecución automática
- [ ] Revisar logs de cada job
- [ ] Corregir errores si los hay

#### **Checkpoint Día 1-2**
- [ ] Screenshot de workflow ejecutándose
- [ ] Tests pasando en CI (verde)
- [ ] Commit: `git commit -m "ci(pipeline): workflow básico - Aye"`

---

### **DÍA 3-4 (Domingo 10 - Lunes 11): Build y Push Docker**

#### **Job: Build and Push Docker**
- [ ] Agregar job `build-docker` que dependa de tests:
  ```yaml
  needs: [test-backend, test-frontend]
  ```
- [ ] Login a Docker Hub: `docker/login-action@v2`
  - [ ] Usar secrets: DOCKER_USERNAME y DOCKER_PASSWORD
- [ ] Setup Docker Buildx: `docker/setup-buildx-action@v2`

#### **Build Backend**
- [ ] Configurar `docker/build-push-action@v4`
- [ ] Context: `./backend`
- [ ] File: `./backend/Dockerfile`
- [ ] Push: `true`
- [ ] Tags: `${{ secrets.DOCKER_USERNAME }}/consultora-backend:latest`

#### **Build Frontend**
- [ ] Configurar `docker/build-push-action@v4`
- [ ] Context: `./frontend`
- [ ] File: `./frontend/Dockerfile`
- [ ] Push: `true`
- [ ] Tags: `${{ secrets.DOCKER_USERNAME }}/consultora-frontend:latest`

#### **Optimizar Workflow (Opcional)**
- [ ] Usar cache para node_modules
- [ ] Usar cache para Docker layers

#### **Probar Pipeline Completo**
- [ ] Hacer cambio pequeño en código
- [ ] Push a rama Dev
- [ ] Ver pipeline completo ejecutarse
- [ ] Verificar:
  - [ ] Tests backend corren ✓
  - [ ] Tests frontend corren ✓
  - [ ] Docker build backend ✓
  - [ ] Docker build frontend ✓
  - [ ] Push a Docker Hub ✓
- [ ] Verificar imágenes en Docker Hub web

#### **Checkpoint Día 3-4**
- [ ] Pipeline completo funcionando end-to-end
- [ ] Imágenes subidas a Docker Hub
- [ ] Screenshots de cada etapa
- [ ] Commit: `git commit -m "ci(pipeline): build y push Docker - Aye"`

---

### **DÍA 5-6 (Martes 12 - Miércoles 13): MI DOCUMENTACIÓN**

#### **Badges en README**
- [ ] Agregar badge de build status:
  ```markdown
  ![CI/CD Pipeline](https://github.com/usuario/repo/actions/workflows/ci-cd.yml/badge.svg)
  ```
- [ ] Agregar badge de coverage (opcional)
- [ ] Verificar que badges se ven correctos

#### **MI DOCUMENTACIÓN (Aye)**
- [ ] Agregar sección "CI/CD Pipeline" en README.md principal
  - [ ] Descripción del pipeline
  - [ ] Qué hace cada job (tests, build, push)
  - [ ] Cómo ver el pipeline en GitHub Actions
  - [ ] Link a GitHub Actions del repo
  - [ ] Badges de status
- [ ] Tomar screenshots:
  - [ ] Pipeline completo ejecutándose (verde)
  - [ ] Vista de jobs expandidos
  - [ ] Tests pasando en CI
  - [ ] Docker build exitoso
  - [ ] Imágenes en Docker Hub

#### **Verificaciones Finales**
- [ ] Pipeline funciona en push a `main`
- [ ] Pipeline funciona en push a `dev`
- [ ] Pipeline funciona en pull requests
- [ ] Todos los jobs pasan correctamente

#### **Checkpoint Día 5-6**
- [ ] README sección CI/CD completada
- [ ] Screenshots tomados
- [ ] Badges funcionando
- [ ] Commit: `git commit -m "docs(pipeline): documentación CI/CD - Aye"`

---

### **Entregables AYE**
- [ ] `.github/workflows/ci-cd.yml` funcionando
- [ ] README.md (sección CI/CD Pipeline)
- [ ] Badges de GitHub Actions
- [ ] Screenshots del pipeline

---

## 👤 VERO - TESTS E2E + LOGGING + DIAGRAMAS

### **Issue: Tests E2E, Monitoreo y Diagramas Base**

**Responsable:** Vero  
**Disponibilidad:** Viernes 8 - Lunes 10   
**Etiquetas:** `e2e`, `playwright`, `monitoring`, `extras`  
**Estimación:** 3 días

---

### **DÍA 1 (Viernes 8 - Sábado 9): Tests E2E con Playwright**

#### **Preparación**
- [ ] Clonar repositorio DevOps
- [ ] Verificar que backend y frontend funcionan localmente
- [ ] Instalar dependencias frontend: `cd frontend && npm install`

#### **Instalar Playwright**
- [ ] Instalar Playwright: `npm install --save-dev @playwright/test`
- [ ] Inicializar: `npx playwright install`
- [ ] Crear configuración: `playwright.config.js`
- [ ] Crear carpeta `frontend/tests/e2e/`

#### **Tests E2E de Flujos Críticos**
- [ ] Crear `tests/e2e/login.spec.js`
  - [ ] Test: Login exitoso con credenciales válidas
  - [ ] Test: Login fallido con password incorrecta
  - [ ] Test: Mensaje de error visible
  - [ ] Test: Redirección después de login
- [ ] Crear `tests/e2e/register.spec.js`
  - [ ] Test: Registro completo de nuevo estudiante
  - [ ] Test: Validación de campos obligatorios
  - [ ] Test: Email duplicado muestra error
- [ ] Crear `tests/e2e/profile.spec.js`
  - [ ] Test: Ver perfil de usuario logueado
  - [ ] Test: Editar información del perfil
  - [ ] Test: Guardar cambios exitosamente
- [ ] Crear `tests/e2e/admin-flow.spec.js`
  - [ ] Test: Admin puede crear usuarios
  - [ ] Test: Admin puede desactivar usuarios

#### **Ejecutar Tests E2E**
- [ ] Levantar backend y frontend localmente o con docker-compose
- [ ] Correr tests: `npx playwright test`
- [ ] Verificar que todos pasan
- [ ] Generar reporte: `npx playwright show-report`
- [ ] Videos automáticos de tests (Playwright los genera)

#### **Checkpoint Día 1**
- [ ] Screenshot de tests E2E pasando
- [ ] Videos de tests guardados
- [ ] Commit: `git commit -m "test(e2e): tests Playwright - Vero"`

---

### **DÍA 2 (Domingo 10): Sistema de Logging (EXTRAS +10 pts)**

#### **Instalar Winston en Backend**
- [ ] Instalar Winston:
  ```bash
  cd backend
  npm install winston
  ```

#### **Configurar Logger**
- [ ] Crear archivo `backend/config/logger.js`
- [ ] Configurar Winston con:
  - [ ] Niveles: error, warn, info, debug
  - [ ] Formato: timestamp + nivel + mensaje
  - [ ] Salidas: consola + archivo (logs/app.log)
- [ ] Configurar rotación de logs (opcional)

#### **Agregar Logs en el Código**
- [ ] Importar logger en archivos principales
- [ ] Agregar logs en:
  - [ ] Endpoints de autenticación (login, register)
  - [ ] Errores en middleware de auth
  - [ ] Operaciones de base de datos
  - [ ] Errores generales

#### **Docker Logs**
- [ ] Verificar que logs se ven con `docker-compose logs backend`
- [ ] Configurar logging driver en docker-compose (opcional)

#### **MI DOCUMENTACIÓN (Vero)**
- [ ] Crear `docs/MONITORING.md`
  - [ ] Sistema de logging implementado
  - [ ] Niveles de log y qué significa cada uno
  - [ ] Cómo ver logs localmente
  - [ ] Cómo ver logs en Docker: `docker-compose logs -f backend`
  - [ ] Ubicación de archivos de log
- [ ] Tomar screenshots de logs funcionando

#### **Checkpoint Día 2**
- [ ] Sistema de logs funcionando
- [ ] docs/MONITORING.md creado
- [ ] Commit: `git commit -m "feat(logging): sistema Winston - Vero"`

---

### **DÍA 3 (Lunes 11): Diagramas Base**

#### **Diagrama de Arquitectura**
- [ ] Crear `docs/ARCHITECTURE.md`
- [ ] Crear diagrama mostrando:
  - [ ] Frontend (React + Vite)
  - [ ] Backend (Node.js + Express)
  - [ ] Base de datos (MongoDB)
  - [ ] Contenedores Docker
  - [ ] GitHub Actions
- [ ] Usar: Mermaid, draw.io, Lucidchart, o Canva
- [ ] Exportar como imagen PNG
- [ ] Guardar en `docs/images/arquitectura.png`

#### **Diagrama de Pipeline (Base)**
- [ ] Crear diagrama básico mostrando:
  - [ ] Trigger (push/PR a GitHub)
  - [ ] Tests Backend
  - [ ] Tests Frontend
  - [ ] Build Docker
  - [ ] Push a Docker Hub
- [ ] Exportar como imagen PNG
- [ ] Guardar en `docs/images/pipeline.png`
- [ ] Nota: Aye puede mejorar/actualizar este diagrama después

#### **Documentar Diagramas**
- [ ] Crear `docs/ARCHITECTURE.md` con:
  - [ ] Imagen del diagrama
  - [ ] Explicación de cada componente
  - [ ] Flujo de datos
  - [ ] Tecnologías usadas

#### **Checkpoint Día 3 (Martes 11 AM - antes de viajar)**
- [ ] Diagramas creados y exportados
- [ ] docs/ARCHITECTURE.md completado
- [ ] Commit final: `git commit -m "docs(diagrams): arquitectura y pipeline base - Vero"`
- [ ] ✅ TODO COMPLETADO - BUEN VIAJE! 🚀

---

### **Entregables VERO**
- [ ] Carpeta `frontend/tests/e2e/` con tests Playwright
- [ ] Sistema de logging en backend (Winston)
- [ ] `docs/MONITORING.md`
- [ ] `docs/ARCHITECTURE.md` con diagramas
- [ ] Imágenes: `docs/images/arquitectura.png` y `pipeline.png`
- [ ] Videos de tests E2E
- [ ] Screenshots de logs

---

## 📊 COORDINACIÓN DEL EQUIPO

### **Reuniones Diarias (15 min - Virtual)**
- [ ] **Viernes 8 (Noche):** Kick-off - Crear issues, dudas iniciales
- [ ] **Sábado 9 (Noche):** Checkpoint - Reportar avances y bloqueos
- [ ] **Domingo 10 (Noche):** Checkpoint - Integración Docker + Tests
- [ ] **Lunes 11 (Noche):** Checkpoint - Vero cierra, resto avanza
- [ ] **Martes 12 (Noche):** Checkpoint - Pipeline + Coverage
- [ ] **Miércoles 13 (Noche):** Checkpoint - Documentación individual
- [ ] **Jueves 14 (Tarde):** Checkpoint - Ensamblar todo + video final
- [ ] **Viernes 15 (Mañana):** Revisión final antes de entregar

### **Dependencias entre tareas**
- **Vero** necesita que Roma tenga docker-compose el lunes (para E2E)
- **Aye** necesita que Roma termine Docker (para integrarlo en CI/CD)
- **Aye** necesita que Dani y Lore terminen tests (para pipeline)
- **Coordinadora final** necesita que todas terminen su documentación

### **Comunicación**
- [ ] Crear grupo de WhatsApp/Discord/Telegram
- [ ] Vero avisa cuándo termina cada día (tiene menos tiempo)
- [ ] Avisar inmediatamente si hay bloqueos
- [ ] Hacer code review entre ustedes (opcional pero recomendado)
- [ ] Compartir screenshots en el grupo para motivación

---

## 🎬 COORDINACIÓN FINAL (Jueves 14 - Voluntaria)

**Una persona se ofrece o sortean para hacer:**

### **Ensamblar README Completo**
- [ ] Tomar README de Aye (sección CI/CD)
- [ ] Agregar sección "Dockerización" (linkear a docs/DOCKER_GUIDE.md de Roma)
- [ ] Agregar sección "Testing" (linkear a docs de Dani y Lore)
- [ ] Agregar sección "Monitoreo" (linkear a docs/MONITORING.md de Vero)
- [ ] Agregar diagramas de Vero
- [ ] Agregar sección "Equipo" con roles de cada una
- [ ] Verificar que todos los links funcionan
- [ ] Verificar ortografía

### **Video Demo Final (2-3 min)**
- [ ] Grabar pantalla mostrando:
  - [ ] Clonar repo
  - [ ] `docker-compose up -d`
  - [ ] Abrir app en browser (login, crear usuario)
  - [ ] Ver logs: `docker-compose logs backend`
  - [ ] Hacer cambio pequeño en código
  - [ ] Push a GitHub
  - [ ] Ir a GitHub Actions → ver pipeline corriendo
  - [ ] Mostrar tests pasando
  - [ ] Mostrar imágenes en Docker Hub
- [ ] Editar video (quitar pausas largas)
- [ ] Subir a YouTube (unlisted) o Google Drive
- [ ] Agregar link en README

### **Verificación Final**
- [ ] Todos los links funcionan
- [ ] Todas las imágenes se ven
- [ ] Video está accesible
- [ ] README tiene índice
- [ ] Crear release: v1.0.0

### **Checkpoint Final**
- [ ] README completo ensamblado
- [ ] Video demo subido y linkeado
- [ ] Release creado
- [ ] ✅ PROYECTO LISTO PARA ENTREGAR

---

## 🎯 CRITERIOS DE ÉXITO (100 pts)

### **Funcionalidad (20 pts)**
- [ ] App corre con Docker ✓
- [ ] Login funciona ✓
- [ ] CRUD básico funciona ✓

### **Git (10 pts)**
- [ ] Commits claros y frecuentes ✓
- [ ] Branches por feature ✓
- [ ] Pull requests con revisión ✓

### **Dockerización (20 pts)**
- [ ] Dockerfile backend ✓
- [ ] Dockerfile frontend ✓
- [ ] docker-compose.yml ✓
- [ ] Funciona en cualquier máquina ✓

### **CI/CD (30 pts)**
- [ ] Pipeline en GitHub Actions ✓
- [ ] Tests automáticos ✓
- [ ] Build Docker automático ✓
- [ ] Push a Docker Hub ✓

### **Documentación (10 pts)**
- [ ] README completo ✓
- [ ] Diagramas claros ✓
- [ ] Instrucciones funcionan ✓

### **Extras (10 pts)** ← APUNTAR AQUÍ PARA 100 PTS
- [ ] Coverage >70% ✓ (Dani + Lore)
- [ ] Tests E2E completos ✓ (Vero)
- [ ] Sistema de logging ✓ (Vero)
- [ ] Monitoreo documentado ✓ (Vero)
- [ ] Video demo profesional ✓ (Coordinadora)

---

## 🚀 MENSAJES DE MOTIVACIÓN

**Para Roma:** ¡Docker es la base de todo! Tu trabajo es súper importante porque todos dependen de que funcione. 💪

**Para Dani:** Tests backend sólidos = proyecto confiable. Coverage alto = puntos extras asegurados. 🧪

**Para Lore:** Tests frontend hacen brillar el proyecto. UI testeada = calidad profesional. ✨

**Para Aye:** El pipeline es la cereza del pastel. Lo más visible y profesional del proyecto. 🎯

**Para Vero:** E2E + Logging = Extras que nos llevan a 100 puntos. ¡Sos clave para el 10! 🌟

---

## 📞 CONTACTO Y AYUDA

**Si alguien se bloquea:**
1. Avisar en el grupo INMEDIATAMENTE
2. No esperar horas para pedir ayuda
3. Compartir el error completo (screenshot)
4. Otra del equipo ayuda o buscan solución juntas

**Recursos útiles:**
- Docker: https://docs.docker.com/get-started/
- Jest: https://jestjs.io/docs/getting-started
- Playwright: https://playwright.dev/docs/intro
- GitHub Actions: https://docs.github.com/en/actions
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/

---

**¡ÉXITOS CON EL TP! 🚀🎉**

**Objetivo: 95-100 puntos**  
**Fecha entrega: 16/11/2025**  
**¡Pueden lograrlo! 💪**
