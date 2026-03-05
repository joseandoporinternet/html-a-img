# 🖼️ HTML to PNG API

API REST que convierte HTML a imágenes PNG. Utiliza **Puppeteer** (Chrome Headless) para renderizar el HTML con soporte completo de CSS, fuentes web e imágenes.

## 🚀 Características

- ✅ Convierte cualquier HTML a imagen PNG de alta calidad
- ✅ CORS habilitado para aceptar peticiones de cualquier origen
- ✅ Autenticación mediante API Key
- ✅ Soporte para fondo transparente
- ✅ Captura de elementos específicos por selector CSS
- ✅ Respuesta en binario (PNG) o base64
- ✅ Viewport y escala configurables (soporte retina)
- ✅ Rate limiting para protección contra abuso
- ✅ Helmet para headers de seguridad

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd html_a_img

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env y configura tu API_KEY
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
# Puerto del servidor
PORT=3000

# Llave de acceso única para la API (OBLIGATORIA)
API_KEY=tu_llave_secreta_aqui

# Tamaño máximo del HTML (en caracteres)
MAX_HTML_SIZE=500000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🏃 Ejecución

```bash
# Producción
npm start

# Desarrollo (con hot reload)
npm run dev
```

## 📡 Endpoints

### `GET /`
Información general de la API (no requiere autenticación).

### `GET /api/health`
Estado de salud del servicio (no requiere autenticación).

### `POST /api/convert`
Convierte HTML a imagen PNG. **Requiere API Key**.

#### Headers

| Header         | Requerido | Descripción        |
| -------------- | --------- | ------------------ |
| `Content-Type` | ✅         | `application/json` |
| `x-api-key`    | ✅         | Tu llave de acceso |

#### Body (JSON)

| Campo               | Tipo    | Requerido | Default   | Descripción                            |
| ------------------- | ------- | --------- | --------- | -------------------------------------- |
| `html`              | string  | ✅         | -         | HTML a convertir                       |
| `width`             | number  | ❌         | `800`     | Ancho del viewport en px               |
| `height`            | number  | ❌         | `600`     | Alto del viewport en px                |
| `backgroundColor`   | string  | ❌         | `#ffffff` | Color de fondo CSS                     |
| `deviceScaleFactor` | number  | ❌         | `2`       | Factor de escala (2 = retina)          |
| `fullPage`          | boolean | ❌         | `true`    | Capturar toda la página                |
| `transparent`       | boolean | ❌         | `false`   | Fondo transparente                     |
| `selector`          | string  | ❌         | `null`    | Selector CSS del elemento a capturar   |
| `responseType`      | string  | ❌         | `buffer`  | `buffer` (PNG) o `base64` (JSON)       |
| `waitForTimeout`    | number  | ❌         | `500`     | Tiempo de espera para renderizado (ms) |

#### Respuestas

**`responseType: 'buffer'` (default):** Retorna la imagen PNG directamente como binario.

**`responseType: 'base64'`:** Retorna un JSON:
```json
{
  "success": true,
  "data": {
    "dataUrl": "data:image/png;base64,...",
    "base64": "iVBORw0KGgo...",
    "mimeType": "image/png",
    "sizeBytes": 12345
  }
}
```

## 📝 Ejemplos

### cURL — Obtener PNG binario

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: TU_API_KEY" \
  -d '{"html": "<div style=\"padding:40px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-family:Arial;font-size:24px;border-radius:16px;\"><h1>¡Hola Mundo!</h1><p>Esto es una imagen generada desde HTML</p></div>"}' \
  --output imagen.png
```

### cURL — Obtener Base64

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: TU_API_KEY" \
  -d '{"html": "<h1>Hola</h1>", "responseType": "base64"}'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'TU_API_KEY',
  },
  body: JSON.stringify({
    html: '<div style="padding:20px"><h1>Hola Mundo</h1></div>',
    width: 1200,
    responseType: 'base64',
  }),
});

const data = await response.json();
console.log(data.data.dataUrl);
```

### JavaScript (obtener blob para descargar)

```javascript
const response = await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'TU_API_KEY',
  },
  body: JSON.stringify({
    html: '<div style="padding:20px"><h1>Hola Mundo</h1></div>',
  }),
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'captura.png';
link.click();
```

### Python (requests)

```python
import requests

response = requests.post(
    'http://localhost:3000/api/convert',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'TU_API_KEY',
    },
    json={
        'html': '<div style="padding:20px"><h1>Hola Mundo</h1></div>',
    },
)

with open('imagen.png', 'wb') as f:
    f.write(response.content)
```

## 🏗️ Estructura del Proyecto

```
html_a_img/
├── src/
│   ├── config/
│   │   └── index.js          # Configuración centralizada
│   ├── middleware/
│   │   ├── auth.js            # Autenticación por API Key
│   │   └── validate.js        # Validación del body
│   ├── routes/
│   │   ├── convert.js         # POST /api/convert
│   │   └── health.js          # GET /api/health
│   ├── services/
│   │   └── renderer.js        # Renderizado con Puppeteer
│   ├── app.js                 # Configuración de Express
│   └── server.js              # Punto de entrada
├── .env                       # Variables de entorno (no commitear)
├── .env.example               # Ejemplo de variables
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Seguridad

- **API Key** requerida en todas las peticiones a `/api/convert`
- **Helmet** para headers de seguridad HTTP
- **Rate Limiting** para prevenir abuso (100 peticiones por 15 minutos por defecto)
- **Validación de entrada** para tamaño máximo del HTML
- **CORS** configurado (acepta peticiones de cualquier origen)

## 📄 Licencia

ISC
