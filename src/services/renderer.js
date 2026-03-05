const puppeteer = require('puppeteer');

let browser = null;

/**
 * Inicializa el navegador headless de Puppeteer.
 * Se reutiliza la misma instancia para mejor rendimiento.
 */
async function initBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--font-render-hinting=none',
            ],
        });
        console.log('🌐 Navegador headless inicializado.');
    }
    return browser;
}

/**
 * Renderiza un string HTML a un buffer PNG.
 *
 * @param {string} html - El HTML a renderizar.
 * @param {object} options - Opciones de renderizado.
 * @param {number} [options.width=800] - Ancho del viewport.
 * @param {number} [options.height=600] - Alto del viewport.
 * @param {string} [options.backgroundColor='#ffffff'] - Color de fondo.
 * @param {number} [options.deviceScaleFactor=2] - Factor de escala (retina).
 * @param {boolean} [options.fullPage=true] - Capturar toda la página.
 * @param {boolean} [options.transparent=false] - Fondo transparente.
 * @param {string} [options.selector] - Selector CSS del elemento a capturar.
 * @returns {Promise<Buffer>} Buffer con la imagen PNG.
 */
async function renderHtmlToPng(html, options = {}) {
    const {
        width = 800,
        height = 600,
        backgroundColor = '#ffffff',
        deviceScaleFactor = 2,
        fullPage = true,
        transparent = false,
        selector = null,
        waitForTimeout = 500,
    } = options;

    const b = await initBrowser();
    const page = await b.newPage();

    try {
        // Configurar viewport
        await page.setViewport({
            width: parseInt(width, 10),
            height: parseInt(height, 10),
            deviceScaleFactor: parseFloat(deviceScaleFactor),
        });

        // Construir el HTML completo con el fondo
        const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100%;
              background-color: ${transparent ? 'transparent' : backgroundColor};
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

        // Cargar el HTML en la página
        await page.setContent(fullHtml, {
            waitUntil: ['load', 'networkidle0'],
            timeout: 30000,
        });

        // Esperar un momento para que se rendericen fuentes y animaciones
        if (waitForTimeout > 0) {
            await new Promise(resolve => setTimeout(resolve, Math.min(waitForTimeout, 5000)));
        }

        // Opciones de screenshot
        const screenshotOptions = {
            type: 'png',
            omitBackground: transparent,
        };

        let screenshot;

        if (selector) {
            // Capturar solo un elemento específico
            const element = await page.$(selector);
            if (!element) {
                throw new Error(`No se encontró el elemento con el selector: "${selector}"`);
            }
            screenshot = await element.screenshot(screenshotOptions);
        } else {
            // Capturar la página completa o el viewport
            screenshotOptions.fullPage = fullPage;
            screenshot = await page.screenshot(screenshotOptions);
        }

        // Asegurar que sea un Buffer de Node.js (Puppeteer puede devolver Uint8Array)
        return Buffer.from(screenshot);
    } finally {
        await page.close();
    }
}

/**
 * Cierra el navegador headless.
 */
async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        console.log('🌐 Navegador headless cerrado.');
    }
}

module.exports = {
    initBrowser,
    renderHtmlToPng,
    closeBrowser,
};
