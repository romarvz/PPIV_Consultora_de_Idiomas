# Análisis de Incompatibilidades: Dev vs Alexa-cursos-backend2

## 📋 Resumen Ejecutivo

Este documento detalla las incompatibilidades encontradas entre la rama `Dev` y `Alexa-cursos-backend2` para facilitar la integración.

---

## 🔴 INCOMPATIBILIDADES CRÍTICAS

### 1. **Estructura de Rutas (`server/index.js`)**

**Problema:** Las ramas tienen estructuras diferentes para registrar rutas.

#### Rama Dev:
- Registra todas las rutas directamente en `server/index.js`
- Incluye rutas de Dashboard y Auditoría
- Usa `cursoRoutes.js` (nombre diferente)
- NO tiene archivo `server/routes/index.js`

#### Rama Alexa-cursos-backend2:
- Tiene un archivo `server/routes/index.js` que centraliza rutas
- NO registra rutas de Dashboard y Auditoría
- Usa `cursos.js` (nombre diferente)
- NO registra las rutas de cursos/clases en `server/index.js`

**ACEPTADA:**
**Solución Recomendada:**
```javascript
// En server/index.js, agregar después de las rutas financieras:
const cursosRoutes = require('./routes/cursos');
const clasesRoutes = require('./routes/clases');
app.use('/api/cursos', cursosRoutes);
app.use('/api/clases', clasesRoutes);
```

---

### 2. **Archivo `server/routes/index.js`**

**Problema:** Este archivo existe en `Alexa-cursos-backend2` pero NO existe en `Dev`.

**Impacto:** Si Dev no usa este archivo, puede causar confusión al hacer merge.

**ACEPTADA:** **Solución:** 
Eliminar `routes/index.js` de Alexa-cursos-backend2 y registrar rutas directamente en `server/index.js` (como hace Dev)

---

### 3. **Rutas Faltantes en Alexa-cursos-backend2**

**Rutas que Dev tiene pero Alexa-cursos-backend2 NO tiene:**
- `/api/dashboard` → `server/routes/dashboard.js`
- `/api/auditoria` → `server/routes/auditoria.js`

**Impacto:** Si estas rutas son necesarias, se perderán al hacer merge.

**ACEPTADA:** **Solución:** Agregar estas rutas en `server/index.js` de Alexa-cursos-backend2 antes del merge. 

---

### 4. **Modelo Curso (`server/models/Curso.js`)**

**Diferencias encontradas:**

#### Campos en Alexa-cursos-backend2 que pueden no estar en Dev:
- `horario` (ObjectId, ref: 'Horario') - **REQUERIDO**
- `imageUrl` (String) - Campo nuevo

#### Cambios en validaciones:
- Cambio de `mongoose.model('User')` a `mongoose.model('BaseUser')` en middlewares pre-save
- Índice agregado: `cursoSchema.index({ horario: 1 })`
- Populate agregado en métodos estáticos: `.populate('horario')`

**Solución:** Asegurar que Dev tenga estos campos antes del merge, o hacer merge manual preservando ambos.
**NOTA Alexa:** Quiero pasar mis cambios de Alexa-cursos-backend2 a Dev. Quisiera que los campos que están en Alexa-cursos-backend2 pasaran a Dev. 
---

## ⚠️ INCOMPATIBILIDADES MENORES

### 5. **Manejo de Errores**

**Dev:**
```javascript
const { errorHandler } = require('./shared/middleware');
app.use(errorHandler);
```

**Alexa-cursos-backend2:**
```javascript
app.use((err, req, res, next) => {
  // Manejo inline
});
```

**ACEPTADA:** **Solución:** Usar el patrón de Dev (más limpio y mantenible).

---

### 6. **Mensajes de Endpoints en Ruta Raíz**

**Dev:** Lista completa de endpoints incluyendo dashboard, auditoría, etc.

**Alexa-cursos-backend2:** Lista reducida sin dashboard ni auditoría.

**ACEPTADA:** **Solución:** Actualizar después del merge para incluir todos los endpoints.

---

### 7. **Archivos de Rutas con Nombres Diferentes**

- Dev: `cursoRoutes.js`
- Alexa-cursos-backend2: `cursos.js`

**ACEPTADA:** **Solución:** Decidir un nombre estándar. Recomendación: usar `cursos.js` (más consistente con otras rutas).

---

## 📝 ARCHIVOS QUE REQUIEREN ATENCIÓN ESPECIAL

### Archivos modificados en ambas ramas:
1. `server/index.js` ⚠️ **CONFLICTO SEGURO**
2. `server/models/Curso.js` ⚠️ **CONFLICTO PROBABLE**
3. `server/routes/teacherRoutes.js` ⚠️ **REVISAR**
4. `client/src/services/apiAdapter.js` ⚠️ **REVISAR**

### Archivos nuevos en Alexa-cursos-backend2:
- `server/routes/index.js` (no existe en Dev)
- `server/routes/cursos.js` (Dev tiene `cursoRoutes.js`)
- `server/routes/clases.js` (nuevo)
- `server/controllers/cursosController.js` (Dev puede tener versión diferente)
- `server/services/cursosService.js` (nuevo)
- `server/validators/cursosValidator.js` (nuevo)

---

## 🛠️ PLAN DE ACCIÓN RECOMENDADO

### Paso 1: Guardar cambios actuales
```bash
# Guardar cambios sin commitear (stash)
git stash push -m "Cambios antes de revisar Dev"

# O hacer commit
git add .
git commit -m "WIP: Correcciones CRUD cursos"
```

### Paso 2: Cambiar a Dev y actualizar
```bash
git checkout Dev
git pull origin Dev
```

### Paso 3: Revisar archivos específicos
```bash
# Ver diferencias en archivos críticos
git diff Dev..Alexa-cursos-backend2 -- server/index.js
git diff Dev..Alexa-cursos-backend2 -- server/models/Curso.js
```

### Paso 4: Volver a tu rama y preparar merge
```bash
git checkout Alexa-cursos-backend2
git merge Dev --no-commit --no-ff
```

### Paso 5: Resolver conflictos manualmente
- Priorizar cambios de Dev para rutas de dashboard/auditoría
- Preservar cambios de Alexa-cursos-backend2 para cursos/clases
- Asegurar que `server/index.js` incluya TODAS las rutas

---

## ✅ CHECKLIST PRE-MERGE

- [ ] Guardar todos los cambios actuales (stash o commit)
- [ ] Verificar que Dev tenga las rutas de dashboard y auditoría
- [ ] Verificar que Dev tenga el modelo Curso actualizado
- [ ] Decidir si mantener o eliminar `server/routes/index.js`
- [ ] Preparar resolución de conflictos en `server/index.js`
- [ ] Verificar compatibilidad de `apiAdapter.js` en frontend
- [ ] Probar que todas las rutas funcionen después del merge

---

## 📞 NOTAS ADICIONALES

- La rama Dev tiene commits recientes relacionados con infraestructura y rutas financieras
- La rama Alexa-cursos-backend2 está 1 commit adelante de origin
- Hay cambios sin commitear en Alexa-cursos-backend2 que deben guardarse antes de cambiar de rama

---

**Fecha de análisis:** $(date)
**Rama base:** Dev
**Rama comparada:** Alexa-cursos-backend2

