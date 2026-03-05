const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const convertRoutes = require('./routes/convert');
const healthRoutes = require('./routes/health');

const app = express();

// ─── Seguridad ──────────────────────────────────────────
app.use(helmet());

// ─── CORS: aceptar peticiones de cualquier origen ───────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
}));

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        error: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ─── Body parsing ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rutas públicas ─────────────────────────────────────
app.use('/api/health', healthRoutes);

// ─── Rutas protegidas por API Key ───────────────────────
app.use('/api/convert', authMiddleware, convertRoutes);

// ─── Ruta raíz ──────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🖼️ HTML to PNG API',
        version: '1.0.0',
        endpoints: {
            health: 'GET  /api/health',
            convert: 'POST /api/convert',
        },
        auth: 'Envía tu API Key en el header "x-api-key".',
        docs: {
            convert: {
                method: 'POST',
                url: '/api/convert',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'TU_API_KEY',
                },
                body: {
                    html: '<div style="padding:20px"><h1>Hola Mundo</h1></div>',
                    width: 800,
                    height: 600,
                    backgroundColor: '#ffffff',
                    deviceScaleFactor: 2,
                    fullPage: true,
                    transparent: false,
                    selector: null,
                    responseType: 'buffer | base64',
                },
            },
        },
    });
});

// ─── Manejo de rutas no encontradas ─────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// ─── Manejo global de errores ───────────────────────────
app.use((err, req, res, _next) => {
    console.error('💥 Error no manejado:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor.',
    });
});

module.exports = app;
