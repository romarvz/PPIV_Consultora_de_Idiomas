# Configuración de Cloudinary para imágenes de cursos

Esta guía resume cómo habilitar la subida de imágenes a Cloudinary desde el dashboard.

## 1. Crear la cuenta y obtener credenciales
- Registrate en [https://cloudinary.com/](https://cloudinary.com/).
- En el panel `"Getting Started"` copiá los valores de:
  - `Cloud name`
  - `API Key`
  - `API Secret`
- (Opcional) creá una carpeta en tu Media Library para agrupar las imágenes, por ejemplo `ppiv-consultora/courses`.

## 2. Variables de entorno en el backend
Editá `server/.env` (o crealo a partir de `.env.example`) y agregá:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
# Opcional, se usa el valor por defecto si no lo definís
CLOUDINARY_UPLOAD_FOLDER=ppiv-consultora/courses
```

> ⚠️ Nunca subas este archivo a Git. Verificá que `.env` está listado en `.gitignore`.

Guardá los cambios y reiniciá el servidor (`npm run dev` o `npm start` dentro de `server/`), porque la configuración se lee al arrancar.

## 3. Probar la subida desde el dashboard
1. Iniciá sesión como admin.
2. Abrí `Gestión de cursos` → `Crear/Editar`.
3. En el campo **Imagen del curso** probá subir un archivo (`.jpg`, `.png`, `.webp`, máx. 5 MB).
4. Al confirmar, la API (`POST /api/uploads/course-image`) debería devolver una URL segura (`secureUrl`). El formulario la guarda en `imageUrl`, y el curso se crea o actualiza con ese enlace.

Si Cloundinary no está configurado, el backend responderá `503` y el formulario mostrará el mensaje de error.

## 4. Migrar cursos existentes
- Editá cada curso desde el dashboard y subí una imagen nueva, o pegá manualmente la URL de una imagen ya hosteada.
- Guardá los cambios. El front (`Home` / `Cursos`) mostrará la imagen inmediatamente porque usa `imageUrl` de la API pública.

## 5. Verificación rápida
- En DevTools > Network debería verse `POST /api/uploads/course-image` con status `201` al subir.
- El detalle del curso en la base tendrá `imageUrl` apuntando a `https://res.cloudinary.com/...`.
- En el sitio público la card del curso mostrará la imagen. Si falla la carga, ahora hay un fallback automático al logo.

Con esto la plataforma queda lista para usar Cloudinary tanto en nuevos cursos como en los existentes.*** End Patch

