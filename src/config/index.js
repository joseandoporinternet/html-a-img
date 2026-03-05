require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  apiKey: process.env.API_KEY || '',
  maxHtmlSize: parseInt(process.env.MAX_HTML_SIZE, 10) || 500000,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
};

// Validar que la API_KEY esté configurada
if (!config.apiKey) {
  console.error('❌ ERROR: La variable de entorno API_KEY es obligatoria. Configurala en el archivo .env');
  process.exit(1);
}

module.exports = config;
