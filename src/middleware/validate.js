const config = require('../config');

/**
 * Middleware de validación del body para la conversión HTML → PNG.
 * Verifica que el HTML esté presente y no exceda el tamaño máximo.
 */
function validateHtmlBody(req, res, next) {
    const { html } = req.body;

    if (!html || typeof html !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'El campo "html" es obligatorio y debe ser un string.',
            ejemplo: {
                html: '<div style="padding:20px; background:#fff;"><h1>Hola Mundo</h1></div>',
            },
        });
    }

    if (html.length > config.maxHtmlSize) {
        return res.status(413).json({
            success: false,
            error: `El HTML excede el tamaño máximo permitido (${config.maxHtmlSize} caracteres).`,
        });
    }

    next();
}

module.exports = { validateHtmlBody };
