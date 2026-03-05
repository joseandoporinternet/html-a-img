const express = require('express');
const { convertSvgTemplateToPng } = require('../services/fastRenderer');

const router = express.Router();

/**
 * POST /api/convert-fast
 * Convierte una plantilla SVG (con variables) a imagen PNG usando Sharp.
 *
 * Body (JSON):
 *   - svg         (string, obligatorio):  El SVG con placeholders {{VARIABLE}}.
 *   - variables   (object, opcional):     Objeto clave-valor para sustituir en el SVG.
 *   - density     (number, opcional):     DPI de renderizado (default: 300).
 *   - responseType (string, opcional):    'buffer' para PNG binario | 'base64' (default: 'buffer').
 *
 * Headers requeridos:
 *   - x-api-key: La llave de acceso de la API.
 *
 * Respuestas:
 *   - 200: Imagen PNG (binaria) o JSON con data URL en base64.
 *   - 400: Error de validación del body.
 *   - 500: Error interno durante el renderizado.
 */
router.post('/', async (req, res) => {
    // ── Validación del body ────────────────────────────────
    const { svg, variables = {}, density, responseType = 'buffer' } = req.body;

    if (!svg || typeof svg !== 'string' || svg.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'El campo "svg" es obligatorio y debe ser un string no vacío.',
            ejemplo: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#fff"/><text x="20" y="40" font-size="24">{{TITULO}}</text></svg>',
                variables: { TITULO: 'Hola Mundo' },
            },
        });
    }

    if (typeof variables !== 'object' || Array.isArray(variables)) {
        return res.status(400).json({
            success: false,
            error: 'El campo "variables" debe ser un objeto clave-valor.',
        });
    }

    // ── Renderizado ───────────────────────────────────────
    try {
        const pngBuffer = await convertSvgTemplateToPng(svg, variables, {
            density: density ? Number(density) : 300,
        });

        // Responder como base64 JSON
        if (responseType === 'base64') {
            const base64 = pngBuffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64}`;

            return res.json({
                success: true,
                data: {
                    dataUrl,
                    base64,
                    mimeType: 'image/png',
                    sizeBytes: pngBuffer.length,
                },
            });
        }

        // Responder como imagen binaria (default)
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': pngBuffer.length,
            'Content-Disposition': 'inline; filename="fast-render.png"',
            'Cache-Control': 'no-cache',
        });

        return res.send(pngBuffer);
    } catch (error) {
        console.error('❌ Error al convertir SVG a PNG:', error.message);

        return res.status(500).json({
            success: false,
            error: 'Error interno al procesar la conversión SVG.',
            details: error.message,
        });
    }
});

module.exports = router;
