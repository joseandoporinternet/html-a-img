const config = require('../config');

/**
 * Middleware de autenticación por API Key.
 * Busca la llave en el header 'x-api-key' o en el query parameter 'api_key'.
 */
function authMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'Acceso denegado. Se requiere una llave de acceso (API Key).',
            hint: 'Envía la llave en el header "x-api-key" o como query parameter "api_key".',
        });
    }

    if (apiKey !== config.apiKey) {
        return res.status(403).json({
            success: false,
            error: 'Llave de acceso inválida.',
        });
    }

    next();
}

module.exports = authMiddleware;
