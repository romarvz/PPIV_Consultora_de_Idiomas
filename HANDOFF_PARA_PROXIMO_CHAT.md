# 🔄 HANDOFF - CONTINUACIÓN DE PROYECTO CONSULTORA DE IDIOMAS

**INSTRUCCIONES PARA CLAUDE:** Este es un proyecto en curso. Lee cuidadosamente toda esta información antes de responder. El desarrollador necesita continuar desde donde quedó en el chat anterior.

---

## 📋 CONTEXTO DEL PROYECTO

### **Proyecto:** Sistema de Gestión Académica y Financiera - Consultora de Idiomas
### **Desarrollador:** Aye (estudiante, proyecto académico PPIV)
### **Stack:** Node.js + Express + MongoDB + React + Vite
### **Repositorio:** https://github.com/romarvz/PPIV_Consultora_de_Idiomas

---

## 🎯 ESTADO ACTUAL DEL PROYECTO

### ✅ **LO QUE YA ESTÁ FUNCIONANDO (en rama Dev)**

**Backend completo:**
- ✅ Autenticación JWT con roles (Admin, Profesor, Estudiante)
- ✅ CRUD de usuarios con soft/hard delete
- ✅ Modelos MongoDB: BaseUser con discriminador
- ✅ **Modelo Factura** - Facturas electrónicas
- ✅ **Modelo Cobro** - Registro de pagos de alumnos
- ✅ **Modelo Concepto** - Conceptos facturables
- ✅ **Modelo ConceptCategory** - Categorías
- ✅ **Modelo Contador** - Numeración automática
- ✅ Endpoints funcionando para generar facturas
- ✅ Sistema de cobros parciales y totales

**Frontend básico:**
- ✅ Configuración Vite + React
- ✅ React Router configurado
- ✅ Componentes de login y autenticación
- ⚠️ Componentes financieros usan datos MOCK (no conectados al backend)

---

## 🔴 TRABAJO EN CURSO - PRIORIDAD ALTA

### **FASE ACTUAL: Simulación ARCA/CAEA + Conexión Frontend**

**Rama activa:** `aye/simulacionArca`

### **Objetivos pendientes:**
1. ✅ Completar simulación CAEA (Código de Autorización Electrónico Anticipado)
2. ✅ Hacer PR de simulación ARCA a rama Dev
3. ✅ Conectar frontend con backend (eliminar MOCK)
4. ✅ Consolidar múltiples ramas del frontend

---

## 🗂️ RAMAS DEL REPOSITORIO

### **Ramas Backend:**
- `Dev` - Rama principal, funcionando ✅
- `aye/simulacionArca` - Simulación ARCA/AFIP (EN TRABAJO)

### **Ramas Frontend (requieren consolidación):**
- `financial-acutalizada` - Principal trabajo frontend
- `feature/aye-financial-module` - Módulo financiero
- `aye/feature/payments` - Componentes de pagos
- `aye/feature/financial` - Funcionalidades financial

**⚠️ PROBLEMA:** Múltiples ramas sin mergear, con posibles conflictos

---

## 📚 DOCUMENTACIÓN CLAVE PROPORCIONADA

En el chat anterior se entregaron estos documentos:

1. **PLAN_DE_ACCION_PROYECTO.md** - Plan completo con:
   - Código para implementar CAEA según manual ARCA v4.0
   - Servicios frontend (facturaService.js, cobroService.js)
   - Componentes React actualizados
   - Estrategia de testing
   - Checklists de tareas

2. **Manual ARCA v4.0** - Manual oficial de AFIP para facturación electrónica

---

## 🎓 CONTEXTO ACADÉMICO - MUY IMPORTANTE

### **PLAZO: 2 SEMANAS** para entregar:
- ✅ Funcionalidades completas
- ✅ Tests unitarios y de integración
- ✅ **Manuales de usuario**
- ✅ **Manuales técnicos**
- ✅ **Documentación de pruebas** (ver formato abajo)

### **FORMATO DE DOCUMENTACIÓN DE PRUEBAS REQUERIDO:**

Para cada funcionalidad se debe documentar **1 prueba básica representativa**:

```markdown
## Prueba: [Nombre de la funcionalidad]

### a) ¿Qué se probó?
[Descripción detallada de qué funcionalidad específica se está probando]

### b) ¿Qué resultado se esperaba?
[Resultado esperado según especificación]

### c) ¿Qué resultado se obtuvo?
[Resultado real obtenido]
- ✅ Éxito / ❌ Fallo
- Capturas de pantalla
- Logs relevantes
- Observaciones
```

---

## 🔍 CONCEPTOS TÉCNICOS CRÍTICOS

### **TERMINOLOGÍA CORRECTA:**

❌ **INCORRECTO:**
- "Pagos" (ambiguo)
- "PaymentRegistration"
- "Pagos a alumnos"

✅ **CORRECTO:**
- **"Cobros"** = Dinero que recibe el instituto de los alumnos
- **"Factura"** = Documento que emite el instituto al alumno
- **"Pago a profesor"** = Dinero que el instituto paga a profesores (funcionalidad futura)

### **SISTEMA DE FACTURACIÓN ELECTRÓNICA ARGENTINA:**

**CAE (Código de Autorización Electrónico):**
- Modo normal de facturación
- Requiere conectividad con AFIP en tiempo real
- Se solicita y obtiene al momento de emitir la factura

**CAEA (Código de Autorización Electrónico Anticipado):**
- Modo de contingencia cuando AFIP no responde
- Se solicita POR ADELANTADO (antes del período de facturación)
- Períodos quincenales:
  - 1era quincena: día 1 al 15
  - 2da quincena: día 16 al último día del mes
- Después del período, se INFORMAN los comprobantes emitidos con CAEA

**Manual de referencia:** Manual ARCA v4.0 (AFIP) - Secciones 2.3, 2.18

---

## 💾 MODELOS DE BASE DE DATOS (RESUMEN)

### **Factura.model.js** (existente en Dev)
Campos principales:
- `numeroFactura`, `puntoVenta`, `tipoComprobante`
- `alumnoId` (ref a usuarios)
- `conceptos` (array de conceptos facturables)
- `total`, `subtotal`, `iva`, `descuentos`
- `estado`: 'pendiente' | 'autorizada' | 'pagada' | 'vencida'
- **NECESITA AGREGAR:** Campos CAEA (ver plan de acción)

### **Cobro.model.js** (existente en Dev)
- `facturaId` (ref a Factura)
- `alumnoId` (ref a usuarios)
- `monto`
- `metodoPago`: 'efectivo' | 'transferencia' | 'tarjeta'
- `fecha`
- `notas`

---

## 🎯 SIGUIENTE PASO INMEDIATO

### **LO QUE EL DESARROLLADOR DEBE HACER AHORA:**

1. Hacer checkout de rama `aye/simulacionArca`
2. Compartir los archivos actuales:
   - `server/models/Factura.model.js`
   - Cualquier servicio AFIP existente
   - Controladores de facturas
3. Revisar punto por punto el plan de acción
4. Implementar paso a paso con mi guía

### **METODOLOGÍA DE TRABAJO:**

> **⚠️ CRÍTICO:** El desarrollador quiere avanzar **PUNTO POR PUNTO**
> - No avanzar automáticamente al siguiente punto
> - Esperar su confirmación explícita
> - Permitir repreguntas para aprender
> - Permitir correcciones o datos adicionales
> - **Esperar que diga "SIGUIENTE PUNTO" para continuar**

---

## 📊 PRIORIDADES (en orden)

1. 🔴 **ALTA:** Completar simulación CAEA
2. 🔴 **ALTA:** PR de CAEA a Dev
3. 🟡 **MEDIA:** Conectar frontend con backend
4. 🟡 **MEDIA:** Consolidar ramas frontend
5. 🟢 **BAJA:** Preparar estructura para pagos a profesores (futuro)
6. 🟢 **BAJA:** Preparar integración MercadoPago (futuro)

---

## 🔧 INFORMACIÓN TÉCNICA ADICIONAL

### **Endpoints existentes en Dev:**

**Autenticación:**
- `POST /api/auth/login`
- `POST /api/auth/register/*`
- `GET /api/auth/profile`

**Usuarios:**
- `GET /api/auth/students`
- `GET /api/auth/professors`
- `PUT /api/auth/deactivate/:id`

**Facturas (verificar disponibilidad):**
- `POST /api/facturas` - Crear factura
- `GET /api/facturas` - Listar facturas
- `GET /api/facturas/:id` - Obtener factura

**Cobros (verificar disponibilidad):**
- `POST /api/cobros` - Registrar cobro
- `GET /api/cobros` - Listar cobros

### **Frontend - Componentes problemáticos:**
- `client/src/components/PaymentRegistration.jsx` (nombre incorrecto, usa MOCK)
- Ubicación del MOCK: `client/src/services/mockData.js` y `mockApi.js`

---

## 📝 ARCHIVOS CLAVE A SOLICITAR

Si el desarrollador no los comparte automáticamente, solicitar:

1. `server/models/Factura.model.js`
2. `server/controllers/facturaController.js`
3. `server/routes/factura.routes.js`
4. `server/services/afipService.js` (si existe)
5. `client/src/components/PaymentRegistration.jsx`
6. `client/src/services/mockData.js`

---

## ⚠️ PROBLEMAS CONOCIDOS

1. **Terminología inconsistente** en frontend (usa "pagos" en vez de "cobros")
2. **Múltiples ramas sin consolidar** en frontend
3. **Datos MOCK hardcodeados** en componentes React
4. **Simulación CAEA incompleta** (verificar estado)
5. **Falta documentación de pruebas** para entrega académica

---

## 🎓 FORMATO DE ENTREGA ACADÉMICA

El desarrollador debe entregar para su materia:

### **1. Manuales de Usuario**
- Guías paso a paso para usar el sistema
- Capturas de pantalla
- Casos de uso comunes

### **2. Manuales Técnicos**
- Arquitectura del sistema
- Diagramas de BD
- Guía de instalación
- Documentación de APIs

### **3. Documentación de Pruebas**
Por cada funcionalidad:
- a) Qué se probó
- b) Resultado esperado
- c) Resultado obtenido

---

## 🚦 SEÑALES DE ALERTA

Si el desarrollador menciona estos temas, requieren atención especial:

- ⚠️ "No recuerdo dónde quedé" → Revisar rama `aye/simulacionArca`
- ⚠️ "Tengo que integrar trabajo de compañeras" → Verificar qué endpoints ya existen
- ⚠️ "MercadoPago" → Es funcionalidad FUTURA, no es prioridad ahora
- ⚠️ "Pagos a profesores" → Es funcionalidad FUTURA, no es prioridad ahora
- ⚠️ "El frontend no funciona" → Probablemente no está conectado al backend

---

## 🎯 OBJETIVO FINAL DE ESTE SPRINT

Al terminar este trabajo, el desarrollador debe tener:

✅ Simulación CAEA completa y funcionando
✅ PR de CAEA mergeado en Dev
✅ Frontend conectado al backend real (sin MOCK)
✅ Componentes con terminología correcta
✅ Ramas consolidadas
✅ Documentación de pruebas lista para entregar
✅ Manuales de usuario y técnico completos

---

## 📞 ESTILO DE COMUNICACIÓN PREFERIDO

- ✅ Español argentino (el desarrollador es de Argentina)
- ✅ Explicaciones técnicas pero didácticas
- ✅ Código comentado y bien documentado
- ✅ Paso a paso, esperando confirmación
- ✅ Permitir repreguntas sin avanzar automáticamente
- ❌ No usar jerga muy técnica sin explicar
- ❌ No asumir conocimientos avanzados
- ❌ No avanzar sin confirmación explícita

---

## 🔄 CUANDO COMIENCE EL NUEVO CHAT

**El desarrollador pegará este documento completo y luego dirá:**

> "Hola Claude, este es el contexto del proyecto en el que estoy trabajando. El chat anterior se llenó. Por favor leé todo el documento HANDOFF y luego confirmame que entendiste el contexto. Cuando esté listo, voy a compartir [archivos específicos] para que me ayudes a continuar."

**Tu respuesta debe ser:**

1. Confirmar que leíste y entendiste el contexto
2. Resumir brevemente:
   - Estado del proyecto
   - Prioridad actual (CAEA)
   - Metodología (punto por punto)
   - Plazo (2 semanas para entrega)
3. Solicitar los archivos que necesitas revisar
4. Esperar su respuesta antes de proponer código o soluciones

---

## 📂 ESTRUCTURA DE CARPETAS (REFERENCIA)

```
PPIV_Consultora_de_Idiomas/
│
├── server/
│   ├── controllers/
│   │   ├── authControllerNew.js
│   │   └── facturaController.js (revisar)
│   ├── models/
│   │   ├── BaseUser.js
│   │   ├── Factura.model.js ⭐
│   │   ├── Cobro.model.js ⭐
│   │   ├── concept.model.js
│   │   ├── conceptCategory.model.js
│   │   └── contador.model.js
│   ├── routes/
│   │   ├── authNew.js
│   │   └── factura.routes.js (revisar)
│   ├── services/
│   │   └── afipService.js (revisar si existe)
│   ├── middleware/
│   │   └── authMiddlewareNew.js
│   └── index.js
│
└── client/
    └── src/
        ├── components/
        │   └── PaymentRegistration.jsx ⚠️
        ├── services/
        │   ├── api.js
        │   ├── mockData.js ⚠️
        │   └── mockApi.js ⚠️
        └── App.jsx
```

---

## 🔗 RECURSOS IMPORTANTES

- **Repositorio:** https://github.com/romarvz/PPIV_Consultora_de_Idiomas
- **Rama principal:** Dev
- **Rama trabajo actual:** aye/simulacionArca
- **Manual AFIP:** Manual ARCA v4.0 (ya revisado en chat anterior)
- **Documentación AFIP:** https://www.afip.gob.ar/ws/

---

## ✅ CHECKLIST DE INICIO DE NUEVO CHAT

Cuando empieces un nuevo chat con este documento, verifica:

- [ ] Leí todo el documento HANDOFF completo
- [ ] Entiendo el estado actual del proyecto
- [ ] Conozco la prioridad (simulación CAEA)
- [ ] Entiendo la metodología (punto por punto)
- [ ] Sé que debo esperar confirmación antes de avanzar
- [ ] Conozco el plazo de entrega (2 semanas)
- [ ] Conozco el formato de documentación requerido
- [ ] Solicité los archivos necesarios
- [ ] Esperé la respuesta del desarrollador

---

## 💡 ÚLTIMA INSTRUCCIÓN IMPORTANTE

**AYE (DESARROLLADOR):**

Cuando pegues este documento en el nuevo chat, agregá al final:

```
ADEMÁS, el estado actual es:
- [Describe brevemente qué acabás de terminar]
- [Qué estás por empezar ahora]
- [Cualquier problema que encontraste]
- [Archivos que vas a compartir]
```

Esto le dará a Claude contexto inmediato sobre dónde retomar.

---

**FIN DEL DOCUMENTO HANDOFF**

---

**VERSIÓN:** 1.0  
**FECHA:** 30 de Octubre 2025  
**PROYECTO:** PPIV Consultora de Idiomas  
**DESARROLLADOR:** Aye
