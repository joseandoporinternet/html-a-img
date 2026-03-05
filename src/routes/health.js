const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Endpoint de salud para verificar que la API está activa.
 * No requiere autenticación.
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        service: 'HTML to PNG API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
