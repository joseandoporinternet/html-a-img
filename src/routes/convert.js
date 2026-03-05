const express = require('express');
const { renderHtmlToPng } = require('../services/renderer');
const { validateHtmlBody } = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/convert
 * Convierte HTML a imagen PNG.
 *
 * Body (JSON):
 *   - html (string, obligatorio): El HTML a convertir.
 *   - width (number, opcional): Ancho del viewport (default: 800).
 *   - height (number, opcional): Alto del viewport (default: 600).
 *   - backgroundColor (string, opcional): Color de fondo CSS (default: '#ffffff').
 *   - deviceScaleFactor (number, opcional): Factor de escala/retina (default: 2).
 *   - fullPage (boolean, opcional): Capturar toda la página (default: true).
 *   - transparent (boolean, opcional): Fondo transparente (default: false).
 *   - selector (string, opcional): Selector CSS para capturar solo un elemento.
 *   - responseType (string, opcional): 'buffer' para PNG binario, 'base64' para data URL (default: 'buffer').
 *
 * Headers requeridos:
 *   - x-api-key: La llave de acceso de la API.
 *
 * Respuestas:
 *   - 200: Imagen PNG (binary) o JSON con data URL base64.
 *   - 400: Error de validación.
 *   - 500: Error interno del servidor.
 */
router.post('/', validateHtmlBody, async (req, res) => {
    try {
        const {
            html,
            width,
            height,
            backgroundColor,
            deviceScaleFactor,
            fullPage,
            transparent,
            selector,
            responseType = 'buffer',
            waitForTimeout,
        } = req.body;

        const pngBuffer = await renderHtmlToPng(html, {
            width,
            height,
            backgroundColor,
            deviceScaleFactor,
            fullPage,
            transparent,
            selector,
            waitForTimeout,
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
            'Content-Disposition': 'inline; filename="screenshot.png"',
            'Cache-Control': 'no-cache',
        });

        return res.send(pngBuffer);
    } catch (error) {
        console.error('❌ Error al convertir HTML a PNG:', error.message);

        return res.status(500).json({
            success: false,
            error: 'Error interno al procesar la conversión.',
            details: error.message,
        });
    }
});

module.exports = router;
