/**
 * 🖥️ Serveur Puppeteer pour Génération PDF Pixel-Perfect
 * 
 * Installation:
 * npm init -y
 * npm install express puppeteer cors
 * 
 * Lancement:
 * node server.js
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * 🎯 Endpoint: POST /api/generate-pdf
 * 
 * Body:
 * {
 *   cvData: { ... },           // Données du CV
 *   supabaseUrl: '...',        // URL Supabase pour les images
 *   baseUrl: 'http://localhost:5173' // URL de l'app React
 * }
 */
app.post('/api/generate-pdf', async (req, res) => {
  const { cvId, supabaseUrl, baseUrl = 'http://localhost:5173' } = req.body;

  if (!cvId) {
    return res.status(400).json({ error: 'cvId requis' });
  }

  let browser;

  try {
    console.log(`🚀 Génération PDF pour CV: ${cvId}`);

    // 1. Lancer Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // 2. Configuration viewport A4 exact
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2, // Haute résolution
    });

    // 3. Construire l'URL de la page print
    const printUrl = `${baseUrl}/cv-print/${cvId}?print=true`;
    console.log(`📄 URL: ${printUrl}`);

    // 4. Naviguer vers la page print
    await page.goto(printUrl, {
      waitUntil: 'networkidle0', // Attendre toutes les ressources
      timeout: 30000,
    });

    // 5. Attendre que les images soient chargées
    await page.evaluate(async () => {
      const images = document.querySelectorAll('img');
      const promises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);
      
      // Délai supplémentaire pour le rendu
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    console.log('✅ Page chargée, génération PDF...');

    // 6. Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      width: '210mm',
      height: '297mm',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      landscape: false,
    });

    console.log('✅ PDF généré:', pdfBuffer.length, 'bytes');

    // 7. Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=CV-${cvId}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    res.status(500).json({
      error: 'Erreur génération PDF',
      details: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

/**
 * 📊 Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdf-generator' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   🖨️  Serveur PDF Puppeteer                 ║
║   Port: ${PORT}                               ║
║   Endpoint: POST /api/generate-pdf           ║
╚══════════════════════════════════════════════╝
  `);
});
