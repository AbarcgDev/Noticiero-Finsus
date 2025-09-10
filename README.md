# 📰 Noticiero FinSus - Plataforma de Gestión de Noticias

Aplicación Node.js/TypeScript para la gestión y publicación de noticieros con soporte para fuentes RSS y generación de audio mediante IA.

## ✨ Características Principales

- 🎙️ Generación de audio de noticias con IA (Google Gemini)
- 📡 Gestión de fuentes RSS
- 🗄️ Almacenamiento en la nube (Cloudflare R2)
- 🐳 Despliegue con Docker y Docker Compose
- 🏗️ Arquitectura limpia con separación de responsabilidades
- 🛠️ TypeScript para tipado estático
- 🔄 API RESTful completa

## 🚀 Guía Rápida de Inicio

### Prerrequisitos

- Docker y Docker Compose instalados
- Cuenta en [Google AI Studio](https://ai.google.dev/) para la API de Gemini
- Cuenta en Cloudflare R2 para almacenamiento de archivos
  + Se utiliza la API de R2 Compatible con AWS S3, por lo que se puede reemplazar por cualquier otro servicio que lo sea.

### Configuración Inicial

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/noticiero-finsus.git
   cd noticiero-finsus
   ```

2. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. Configura las variables de entorno en `.env` (ver sección de configuración)

### 🐳 Despliegue con Docker Compose (Recomendado)

```bash
# Construir y ejecutar toda la infraestructura
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener todos los servicios
docker-compose down
```

La aplicación estará disponible en: http://localhost:3000

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura los siguientes valores:

- `DB_*`: Configuración de la base de datos MySQL
- `GEMINI_API_KEY`: Tu clave de API de Google Gemini
- `R2_*`: Configuración de Cloudflare R2 (opcional)
- `JWT_SECRET`: Clave secreta para JWT

### Estructura de Carpetas

```
├── src/
│   ├── app/              # Código fuente de la aplicación
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores de la API
│   ├── middlewares/      # Middlewares de Express
│   ├── models/           # Modelos de la base de datos
│   └── services/         # Lógica de negocio
├── init.sql/             # Scripts de inicialización de la base de datos
└── docker-compose.yml    # Configuración de Docker Compose
```

## 📚 Documentación de la API

### Autenticación

Todas las rutas (excepto `/health` y `/login`) requieren autenticación mediante JWT.

### Endpoints Principales

#### 1. Noticieros

**Obtener todos los noticieros**
```http
GET /api/noticieros
```

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Últimas noticias financieras",
      "state": "published",
      "publicationDate": "2025-09-09T12:00:00.000Z"
    }
  ],
}
```

**Crear un nuevo noticiero**
```http
POST /api/noticieros
Authorization: Bearer <token>

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Noticiero Finsus - 2025-09-09",
  "guion": "<Guion generado con IA>",
  "state": "pending",
  "publicationDate": "2025-09-09T12:00:00.000Z"
}
```

#### 2. Generación de Audio

Se envia un comando para publicar el noticiero, con la intencion de que el guion sea previamente aprobado por el usuario. Una vez recibido el comando se genera el audio, se almacena en el bucket configurado y se actualiza el estado del noticiero a "published". Este audio se puede consultar en el endpoint `/api/noticieros/latest/audio` si es el ultimo noticiero publicado o en el endpoint `/api/noticieros/:id/audio` para un audio en especifico.

!IMPORTANTE: El servidor responde inmediatamente pero el audio  se genera en segundo plao y tardará unos minutos en estar disponible.

**Generar audio para un noticiero**
```http
PATCH /api/noticieros/:id/publish
Authorization: Bearer <token>
```

**Ejemplo de respuesta exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Audio generado exitosamente"
}
```

## 🛠️ Desarrollo

### Instalación de dependencias

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
# Iniciar base de datos
docker-compose up -d mysql

# Iniciar la aplicación
npm run dev
```

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia APACHE-2.0. Ver `LICENSE` para más información.

## ✉️ Contacto

Tu Nombre - [@tuusuario](https://twitter.com/tuusuario) - email@ejemplo.com

Enlace del proyecto: [https://github.com/tuusuario/noticiero-finsus](https://github.com/tuusuario/noticiero-finsus)

