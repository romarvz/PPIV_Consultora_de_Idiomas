# 🔒 Guía de Seguridad para Testing

## ⚠️ PROBLEMA CRÍTICO RESUELTO

**ANTES (PELIGROSO):**
```javascript
afterAll(async () => {
  await mongoose.connection.dropDatabase(); // ❌ ELIMINA TODA LA BASE DE DATOS
  await mongoose.connection.close();
});
```

**AHORA (SEGURO):**
- ✅ Verificaciones de entorno de test
- ✅ Validación de URI de base de datos
- ✅ Limpieza de colecciones en lugar de eliminar base de datos
- ✅ Múltiples capas de seguridad

## 🛡️ Medidas de Seguridad Implementadas

### 1. Verificación de Entorno
```javascript
const isTestEnvironment = () => {
  return (
    process.env.NODE_ENV === 'test' || 
    process.env.JEST_WORKER_ID !== undefined ||
    process.argv.some(arg => arg.includes('jest'))
  );
};
```

### 2. Validación de Base de Datos
- La URI **DEBE** contener "test" en el nombre
- Solo se permite conectar a bases de datos claramente marcadas como de testing
- Verificación del nombre de la base de datos después de conectar

### 3. Limpieza Segura
- Se limpian las **colecciones**, NO se elimina la base de datos completa
- Múltiples verificaciones antes de cualquier operación destructiva

## 📋 Configuración Requerida

### 1. Variables de Entorno
Crear archivo `.env.test`:
```bash
MONGO_TEST_URI=mongodb://127.0.0.1:27017/idiomas_test
NODE_ENV=test
```

### 2. Comandos Seguros
```bash
# Para ejecutar tests de forma segura
npm run test:safe

# Para desarrollo de tests
npm run test:watch
```

## 🚨 Lista de Verificación Antes de Ejecutar Tests

- [ ] ¿Tienes configurada `MONGO_TEST_URI`?
- [ ] ¿La URI contiene "test" en el nombre?
- [ ] ¿Estás usando `NODE_ENV=test`?
- [ ] ¿Has verificado que no apunta a producción?

## 🔧 Configuración MongoDB para Testing

### Opción 1: MongoDB Local de Test
```bash
# Crear una instancia separada para tests
mongod --port 27018 --dbpath /data/test_db
```

### Opción 2: MongoDB Memory Server (Recomendado)
Ya está incluido en las dependencias. Se puede configurar para usar una base de datos en memoria que se destruye automáticamente.

## 📝 Buenas Prácticas

1. **NUNCA** ejecutar tests contra bases de datos de producción
2. **SIEMPRE** usar nombres que incluyan "test" 
3. **VERIFICAR** dos veces la configuración antes de ejecutar
4. **USAR** `deleteMany()` en lugar de `dropDatabase()`
5. **CONFIGURAR** timeouts apropiados para tests
6. **DOCUMENTAR** cualquier cambio en la configuración

## 🆘 En Caso de Emergencia

Si accidentalmente eliminaste datos importantes:

1. **DETENER** todos los procesos inmediatamente
2. **NO ESCRIBIR** nada más a la base de datos
3. **RESTAURAR** desde el backup más reciente
4. **REVISAR** la configuración de testing antes de continuar

## 🔄 Proceso de Recuperación Implementado

El archivo de test ahora incluye estas protecciones automáticas:
- Validación previa a la conexión
- Verificación del entorno
- Limpieza segura sin eliminación de base de datos
- Logs de seguridad para monitoreo

**¡Los tests ahora son seguros de ejecutar!**