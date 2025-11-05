# Modelo Horario - Documentación

## Descripción
El modelo `Horario` gestiona los horarios de clases para la consultora de idiomas. Permite definir franjas horarias por día de la semana con validaciones automáticas de solapamiento y formato.

## Características Principales

### 1. Campos del Schema
```javascript
{
  dia: String,           // enum: lunes-domingo (minúsculas)
  horaInicio: String,    // formato HH:mm (ej: "09:00")
  horaFin: String,       // formato HH:mm (ej: "11:30")
  descripcion: String    // autogenerado: "Lunes 09:00 - 11:00"
}
```

### 2. Validaciones Automáticas
- ✅ Formato de hora válido (HH:mm)
- ✅ Hora fin posterior a hora inicio
- ✅ Sin solapamiento en el mismo día
- ✅ Días válidos (lunes a domingo)
- ✅ Índice único compuesto `{dia, horaInicio, horaFin}`

### 3. Funcionalidades Automáticas
- 🔄 Normalización de formato (9:30 → 09:30)
- 📝 Autogeneración de descripción
- 🎯 Virtual field `display` con día capitalizado

## Uso Básico

### Crear Horario
```javascript
const { Horario } = require('./models');

// Crear nuevo horario
const horario = new Horario({
  dia: 'lunes',
  horaInicio: '09:00',
  horaFin: '11:00'
});

await horario.save();
console.log(horario.display); // "Lunes 09:00 - 11:00"
```

### Métodos Disponibles

#### Métodos de Instancia
```javascript
// Obtener duración
horario.getDuracionMinutos();        // 120
horario.getDuracionFormateada();     // "2 horas"

// Validar solapamiento manualmente
await horario.validarSolapamiento();

// Formato JSON para API
horario.toJSON();
```

#### Métodos Estáticos
```javascript
// Obtener horarios por día
const horariosLunes = await Horario.getPorDia('lunes');

// Verificar disponibilidad
const disponible = await Horario.verificarDisponibilidad('martes', '14:00', '16:00');
// Retorna: { disponible: true } o { disponible: false, conflicto: "Martes 15:00 - 17:00" }

// Obtener horarios en rango
const horariosMatutinos = await Horario.getPorRangoHorario('08:00', '12:00');
```

## Ejemplos de Validaciones

### ✅ Casos Válidos
```javascript
// Horario básico
{ dia: 'lunes', horaInicio: '09:00', horaFin: '11:00' }

// Formato flexible (se normaliza automáticamente)
{ dia: 'martes', horaInicio: '9:30', horaFin: '10:0' } // → '09:30', '10:00'

// Horarios adyacentes
{ dia: 'lunes', horaInicio: '11:00', horaFin: '13:00' } // OK si existe 09:00-11:00
```

### ❌ Casos que Fallan
```javascript
// Hora fin anterior a inicio
{ dia: 'lunes', horaInicio: '11:00', horaFin: '10:00' }
// Error: "La hora de fin debe ser posterior a la hora de inicio"

// Formato inválido
{ dia: 'lunes', horaInicio: '25:00', horaFin: '11:00' }
// Error: "Hora de inicio debe tener formato HH:mm"

// Día inválido
{ dia: 'lunex', horaInicio: '09:00', horaFin: '11:00' }
// Error: "Día debe ser uno de: lunes, martes, miercoles..."

// Solapamiento
// Si existe: lunes 09:00-11:00
{ dia: 'lunes', horaInicio: '10:00', horaFin: '12:00' }
// Error: "El horario se solapa con un horario existente: Lunes 09:00 - 11:00"
```

## Integración con Otros Modelos

### Con Profesor (disponibilidad)
El modelo `Profesor` ya tiene un sistema de disponibilidad similar. El modelo `Horario` puede usarse como:
- ✅ Horarios de clases programadas
- ✅ Bloques de tiempo disponibles
- ✅ Plantillas de horarios

### Posibles Extensiones
```javascript
// Futuras mejoras sugeridas:
{
  profesor: ObjectId,     // Referencia a Profesor
  estudiante: ObjectId,   // Referencia a Estudiante
  materia: ObjectId,      // Referencia a Language/Materia
  tipo: String,          // 'clase', 'disponibilidad', 'bloqueado'
  recurrente: Boolean,   // Si se repite semanalmente
  fechaInicio: Date,     // Para horarios con fecha específica
  fechaFin: Date         // Para horarios temporales
}
```

## Pruebas y Validación

Para ejecutar las pruebas del modelo:
```bash
cd server
node test-horario.js
```

Las pruebas verifican:
- ✅ Creación de horarios válidos
- ✅ Validaciones de formato y lógica
- ✅ Detección de solapamientos
- ✅ Métodos estáticos y de instancia
- ✅ Normalización automática
- ✅ Virtual fields y formato JSON

## Índices de Base de Datos

```javascript
// Índice único compuesto (evita duplicados exactos)
{ dia: 1, horaInicio: 1, horaFin: 1 } // unique: true

// Índices de optimización
{ dia: 1 }         // Búsquedas por día
{ horaInicio: 1 }  // Ordenamiento por hora
```

## Notas Técnicas

- **Sin timestamps**: El modelo no incluye `createdAt`/`updatedAt` según requisitos
- **Colección**: `horarios` (plural, minúsculas)
- **Exportación**: `mongoose.model('Horario', horarioSchema)`
- **Validación en tiempo real**: Los solapamientos se validan en `pre('save')`
- **Formato consistente**: Las horas se normalizan automáticamente (ej: 9:30 → 09:30)