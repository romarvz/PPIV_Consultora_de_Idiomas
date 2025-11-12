# GUÍA DE IMPLEMENTACIÓN - CONECTAR FRONTEND AL BACKEND

---

## PASO 1: COPIAR ARCHIVOS DE API (10 min)

### 1.1 Copiar facturaApi.js

```bash
# Ruta destino: client/src/services/facturaApi.js
```

Copiar el contenido de `facturaApi.js`.

### 1.2 Copiar cobroApi.js

```bash
# Ruta destino: client/src/services/cobroApi.js
```

Copiar el contenido de `cobroApi.js`.

### 1.3 Verificar que api.js ya existe
 `client/src/services/api.js` configurado correctamente.

---

## PASO 2: REEMPLAZAR FinancialDashboard.jsx (5 min)

### 2.1 Hacer backup del original

```bash
cd client/src/dashboard
mv FinancialDashboard.jsx FinancialDashboard.jsx.OLD
```

### 2.2 Copiar nueva versión

Copiar el contenido de `FinancialDashboard_UPDATED.jsx` a `client/src/dashboard/FinancialDashboard.jsx`

---

## PASO 3: ACTUALIZAR IMPORTS (5 min)

### 3.1 Verificar estructura de carpetas

Asegurate que tengas:
```
client/
  src/
    services/
      api.js            ← Ya existe
      facturaApi.js     ← NUEVO
      cobroApi.js       ← NUEVO
      mockApi.js        ← Se puede eliminar después
    dashboard/
      FinancialDashboard.jsx  ← ACTUALIZADO
```

### 3.2 Verificar imports en FinancialDashboard.jsx

Deben estar así:
```javascript
import facturaAPI from '../services/facturaApi'
import cobroAPI from '../services/cobroApi'
```

---

## PASO 4: PROBAR CONEXIÓN BÁSICA (15 min)

### 4.1 Iniciar backend

```bash
cd server
npm run dev
```

Verificar que el backend esté corriendo en http://localhost:5000

### 4.2 Iniciar frontend

```bash
cd client
npm run dev
```

### 4.3 Hacer login

1. Ir a http://localhost:5173/login (o tu puerto de Vite)
2. Login con usuario admin
3. Ir al Dashboard Financiero

### 4.4 Verificar consola del navegador

Abrir DevTools (F12) y ver si hay errores de CORS o conexión.

---

## PASO 5: PROBAR CREAR FACTURA (20 min)

### 5.1 En el Dashboard, click en "Nueva Factura"

### 5.2 Llenar el formulario:

```
ID Estudiante: <pegar ID real de un estudiante de tu BD>
Condición Fiscal: Consumidor Final
Período: 2025-11
Fecha Vencimiento: 2025-11-30
```

### 5.3 Click en "Crear Borrador"

**Resultado esperado:**
- Alert: "Factura creada en borrador: FC B 00001-XXXXXXXX"
- Factura aparece en la tabla con estado "Borrador"

**Si falla:**
- Ver consola del navegador (F12)
- Ver consola del backend
- Verificar que el ID del estudiante existe

---

## PASO 6: PROBAR AUTORIZAR FACTURA (10 min)

### 6.1 Click en "Autorizar" en la factura borrador

### 6.2 Confirmar el diálogo

**Resultado esperado:**
- Alert: "Factura autorizada con CAE: XXXXXXXXXXXXXX"
- Estado cambia a "Pendiente"
- Aparece el número de CAE en la tabla
- Botones "Autorizar" y "Eliminar" desaparecen

**Si falla:**
- Verificar que la factura esté en estado "Borrador"
- Ver logs del backend

---

## PASO 7: PROBAR ELIMINAR BORRADOR (5 min)

### 7.1 Crear otra factura en borrador

### 7.2 Click en "Eliminar"

### 7.3 Confirmar

**Resultado esperado:**
- Alert: "Factura eliminada exitosamente"
- Factura desaparece de la tabla

---

## PASO 8: PROBAR REGISTRAR COBRO (15 min)

### 8.1 Obtener ID de una factura autorizada

Copiar el `_id` de una factura en estado "Pendiente" (desde la BD o desde el response anterior)

### 8.2 Click en "Registrar Cobro"

### 8.3 Llenar formulario:

```
ID Factura: <pegar ID de factura pendiente>
Monto: 50000 (o el monto de la factura)
Método de Pago: Efectivo
Observaciones: Cobro de prueba
```

### 8.4 Click en "Registrar Cobro"

**Resultado esperado:**
- Alert: "Cobro registrado exitosamente"
- Cobro aparece en el tab "Cobros"
- Estadísticas se actualizan

**Si falla:**
- Verificar que la factura exista y esté autorizada
- Verificar que el backend tenga el endpoint de cobros implementado

---

## PASO 9: VERIFICAR ESTADÍSTICAS (10 min)

### 9.1 Revisar las tarjetas superiores

Deben mostrar:
- **Ingresos del Mes**: Suma de cobros del mes actual
- **Facturas Pendientes**: Cantidad de facturas en estado "Pendiente"
- **Cobros del Mes**: Cantidad de cobros registrados este mes
- **Deuda Total**: Suma del total de facturas pendientes

**Nota:** Las estadísticas se calcularán cuando implementes la carga de datos completa.

---

## PASO 10: MEJORAS PENDIENTES (Para después)

### 10.1 Selector de estudiante

En vez de pedir el ID manualmente, agregar un dropdown con todos los estudiantes.

### 10.2 Agregar ítems a la factura

Implementar la sección de ítems en el formulario de crear factura.

### 10.3 Listado completo de facturas

Implementar endpoint para listar TODAS las facturas (no solo de un estudiante).

### 10.4 Filtros y búsqueda

Agregar filtros por fecha, estado, estudiante, etc.

---

## ERRORES COMUNES Y SOLUCIONES

### Error: "Cannot read property 'data' of undefined"

**Causa:** El backend no está respondiendo correctamente.

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar la URL en `api.js` (debe ser http://localhost:5000/api)
3. Ver logs del backend

---

### Error: "Network Error" o "CORS"

**Causa:** Problema de CORS entre frontend y backend.

**Solución:**

En `server/index.js` debe estar:
```javascript
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:5173', // o tu puerto de Vite
  credentials: true
}))
```

---

### Error: "401 Unauthorized"

**Causa:** Token expirado o inválido.

**Solución:**
1. Hacer logout
2. Hacer login de nuevo
3. El nuevo token se guardará automáticamente

---

### Error: "facturaService.crearFactura is not a function"

**Causa:** El servicio del backend no está importado correctamente.

**Solución:**
1. Verificar que `facturaBorrador.service.js` existe
2. Verificar que el controller lo importa correctamente
3. Reiniciar el servidor backend

---

## CHECKLIST DE VERIFICACIÓN

- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 5173
- [ ] Login funcionando
- [ ] Token guardado en localStorage
- [ ] Crear factura borrador ✅
- [ ] Autorizar factura ✅
- [ ] Ver CAE asignado ✅
- [ ] Eliminar borrador ✅
- [ ] Registrar cobro ✅
- [ ] Ver estadísticas actualizadas
- [ ] No hay errores en consola

---

## PRÓXIMOS PASOS

Una vez que todo funcione:

1. **Documentar pruebas** (capturas de pantalla)
2. **Crear casos de prueba** (Excel o documento)
3. **Escribir manual técnico**
4. **Escribir manual de usuario**

---

## TIEMPO TOTAL ESTIMADO

| Tarea | Tiempo |
|-------|--------|
| Copiar archivos | 20 min |
| Configurar | 10 min |
| Probar crear factura | 20 min |
| Probar autorizar | 10 min |
| Probar cobros | 15 min |
| Verificar y ajustar | 30 min |
| **TOTAL** | **~2 horas** |

---

**¿Listo para empezar? Arrancá por el PASO 1 y avisame si tenés algún problema!**
