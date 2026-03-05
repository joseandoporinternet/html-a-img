const sharp = require('sharp');

/**
 * Reemplaza las variables de la plantilla SVG usando un simple string replace.
 * Las variables en el SVG deben estar escritas con dobles llaves: {{NOMBRE_VAR}}
 *
 * @param {string} svgTemplate - El string SVG con placeholders.
 * @param {object} variables   - Objeto clave-valor con los reemplazos a aplicar.
 * @returns {string}           - El SVG con todas las variables sustituidas.
 */
function interpolateSvg(svgTemplate, variables = {}) {
    let result = svgTemplate;

    for (const [key, value] of Object.entries(variables)) {
        // Permite tanto {{CLAVE}} como la llave plana CLAVE dentro del SVG
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(placeholder, String(value));
    }

    return result;
}

/**
 * Convierte un string SVG (ya con variables resueltas) a un buffer PNG
 * usando Sharp con una densidad de 300 DPI para máxima nitidez de texto.
 *
 * @param {string} svgString - El SVG final (sin placeholders).
 * @param {object} options   - Opciones adicionales de Sharp.
 * @param {number} [options.density=300]  - DPI de renderizado (default 300).
 * @param {number} [options.quality=100]  - Calidad PNG (default 100).
 * @returns {Promise<Buffer>}             - Buffer con la imagen PNG resultante.
 */
async function renderSvgToPng(svgString, options = {}) {
    const { density = 300 } = options;

    const svgBuffer = Buffer.from(svgString, 'utf-8');

    const pngBuffer = await sharp(svgBuffer, { density })
        .png()
        .toBuffer();

    return pngBuffer;
}

/**
 * Pipeline completo: interpola variables en el SVG y lo convierte a PNG.
 *
 * @param {string} svgTemplate  - SVG con placeholders {{VARIABLE}}.
 * @param {object} variables    - Objeto clave-valor de reemplazos.
 * @param {object} options      - Opciones de renderizado (density, etc.).
 * @returns {Promise<Buffer>}   - Buffer PNG listo para enviar.
 */
async function convertSvgTemplateToPng(svgTemplate, variables = {}, options = {}) {
    const resolvedSvg = interpolateSvg(svgTemplate, variables);
    const pngBuffer = await renderSvgToPng(resolvedSvg, options);
    return pngBuffer;
}

module.exports = {
    interpolateSvg,
    renderSvgToPng,
    convertSvgTemplateToPng,
};
