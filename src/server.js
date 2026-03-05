const app = require('./app');
const config = require('./config');
const { initBrowser, closeBrowser } = require('./services/renderer');

async function startServer() {
    try {
        // Pre-inicializar el navegador headless
        await initBrowser();

        const server = app.listen(config.port, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════════╗');
            console.log('║        🖼️  HTML to PNG API - Activa          ║');
            console.log('╠══════════════════════════════════════════════╣');
            console.log(`║  🌐 URL:    http://localhost:${config.port}             ║`);
            console.log(`║  🔑 API Key: ${config.apiKey.substring(0, 12)}...        ║`);
            console.log(`║  📦 Max HTML: ${(config.maxHtmlSize / 1000).toFixed(0)}K caracteres          ║`);
            console.log('╠══════════════════════════════════════════════╣');
            console.log('║  Endpoints:                                  ║');
            console.log('║  GET  /             - Info de la API          ║');
            console.log('║  GET  /api/health   - Estado de salud         ║');
            console.log('║  POST /api/convert  - Convertir HTML → PNG   ║');
            console.log('╚══════════════════════════════════════════════╝');
            console.log('');
        });

        // Manejo de cierre graceful
        const gracefulShutdown = async (signal) => {
            console.log(`\n⚠️ Señal ${signal} recibida. Cerrando servidor...`);
            await closeBrowser();
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
