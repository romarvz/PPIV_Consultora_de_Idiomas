# Sistema Integral para Consultora de Idiomas en Inglés

Este proyecto es un sistema integral que automatiza la gestión de una consultora de idiomas en inglés. Permite registrar estudiantes, programar clases, rastrear progresos, manejar pagos y generar reportes, facilitando la administración y el seguimiento académico y financiero.

## Características Principales

- **Gestión de Estudiantes (Clientes):**
  - Registro de datos personales.
  - Historial académico: asistencia, calificaciones y certificaciones.
  - Cursos y niveles de inglés (A1–C2).
  - Búsquedas filtradas por estado (inscripto, en curso, graduado).

- **Gestión de Servicios (Cursos y Clases):**
  - Catálogo de cursos grupales, individuales y corporativos.
  - Detalle de duración, modalidad (presencial/online), costos y recursos asociados (aulas físicas o virtuales).

- **Agenda y Reservas:**
  - Programación de clases por fecha, hora, duración y profesor asignado.
  - Control de disponibilidad de aulas/profesores con alertas por conflictos.
  - Notificaciones automáticas vía email/SMS como recordatorio de clases.

- **Gestión de Pagos y Facturación:**
  - Registro de pagos en efectivo y simulación de integración con pasarelas electrónicas (ej. Mercado Pago).
  - Emisión de comprobantes y facturas simuladas, con copia digital almacenada.

- **Gestión de Profesores:**
  - Registro de perfiles y especialidades.
  - Asignación de clases y control de disponibilidad.
  - Evaluaciones de desempeño.

- **Reportes e Indicadores:**
  - Informes detallados por estudiante, curso o período.
  - Métricas de progreso académico (% de avance, niveles completados).
  - Reportes de facturación e ingresos.

- **Alertas y Notificaciones:**
  - Avisos de pagos pendientes, vencimientos y bajo rendimiento académico.

- **Control de Usuarios y Seguridad:**
  - Roles diferenciados (administrador, profesor, estudiante).
  - Accesos seguros mediante autenticación y encriptación.
  - Registro de auditoría de acciones para trazabilidad.

- **Compatibilidad y Accesibilidad:**
  - Aplicación web responsiva, accesible desde navegadores modernos en desktop y dispositivos móviles.
  - Garantiza disponibilidad y rendimiento.

## Plataformas

- Aplicación web responsiva, asegurando compatibilidad y escalabilidad.

## Tecnologías

- **Frontend:** React.js + Vite
- **Backend:** Node.js
- **Base de datos:** MongoDB
- **Integración:** Firebase

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/romarvz/PPIV_Consultora_De_Idiomas.git
```

2. Instalar dependencias
```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install
```

3. Configurar variables de entorno
- Crear archivo `.env` en la raíz del proyecto
- Añadir las variables necesarias (MongoDB URI, Firebase config, etc.)

4. Iniciar la aplicación
```bash
# Frontend
cd client
npm run dev

# Backend
cd server
npm run dev
```

## Estructura del Proyecto

El proyecto sigue una arquitectura cliente-servidor con separación clara de responsabilidades:

- `/client`: Aplicación frontend en React.js
- `/server`: API backend en Node.js/Express
- `/config`: Archivos de configuración
- `/tests`: Pruebas unitarias e integración

## Scripts Disponibles

### Frontend (client/)
- `npm run dev`: Inicia el servidor de desarrollo con Vite
- `npm run build`: Genera la versión de producción
- `npm run preview`: Previsualiza la build de producción

### Backend (server/)
- `npm run dev`: Inicia el servidor de desarrollo con nodemon
- `npm start`: Inicia la aplicación en producción
- `npm test`: Ejecuta las pruebas

## Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Crear Pull Request

## Licencia
