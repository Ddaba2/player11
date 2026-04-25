# 🖨️ Guide Installation - Serveur PDF Puppeteer

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│   React App (Frontend)                      │
│   Port: 5173                                │
│                                             │
│   [Bouton Export PDF]                       │
│         ↓                                   │
│   POST /api/generate-pdf                    │
└─────────┬───────────────────────────────────┘
          │
          ↓
┌─────────────────────────────────────────────┐
│   Puppeteer Server (Backend)                │
│   Port: 3001                                │
│                                             │
│   1. Ouvre Chrome headless                  │
│   2. Charge /cv-print/:id                   │
│   3. Rendu Chrome réel                      │
│   4. Génère PDF A4                          │
│   5. Retourne le PDF                        │
└─────────────────────────────────────────────┘
```

---

## 📦 ÉTAPE 1: Installer le Serveur

### 1.1 Naviguer dans le dossier

```bash
cd c:\Users\dabad\Desktop\Palyer11\pdf-server
```

### 1.2 Installer les dépendances

```bash
npm install
```

Cela installera :
- `express` - Serveur web
- `puppeteer` - Chrome headless (≈300MB)
- `cors` - Autoriser les requêtes cross-origin

---

## 🚀 ÉTAPE 2: Démarrer le Serveur

### 2.1 Mode développement

```bash
npm run dev
```

### 2.2 Mode production

```bash
npm start
```

### 2.3 Vérifier que ça fonctionne

```
╔══════════════════════════════════════════════╗
║   🖨️  Serveur PDF Puppeteer                 ║
║   Port: 3001                                ║
║   Endpoint: POST /api/generate-pdf          ║
╚══════════════════════════════════════════════╝
```

Test rapide :
```bash
curl http://localhost:3001/api/health
# {"status":"ok","service":"pdf-generator"}
```

---

## 🔧 ÉTAPE 3: Configurer le Frontend

### 3.1 Remplacer le composant d'export

Dans `CVView.tsx`, remplacez :

```tsx
// AVANT
import PDFExport from '../components/PDFExport';

<PDFExport cvId={cvId} cvData={cv} />
```

Par :

```tsx
// APRÈS
import PuppeteerPDFExport from '../components/PuppeteerPDFExport';

<PuppeteerPDFExport 
  cvId={cvId} 
  cvData={cv}
  serverUrl="http://localhost:3001" // URL du serveur
/>
```

---

## 🎨 ÉTAPE 4: Créer la Page Print (Optionnel)

La page `/cv-print/:id` doit être créée dans votre app React pour un rendu parfait.

### 4.1 Ajouter le routing

Si vous utilisez react-router :

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CVPrintPage from './pages/CVPrintPage';

<BrowserRouter>
  <Routes>
    {/* Routes existantes */}
    <Route path="/cv-print/:id" element={<CVPrintPage />} />
  </Routes>
</BrowserRouter>
```

### 4.2 Alternative sans router

Le serveur peut charger n'importe quelle URL. Modifiez `server.js` :

```javascript
// server.js - Ligne 57
const printUrl = `${baseUrl}/?cv=${cvId}&print=true`;
```

Puis dans votre app React, détectez le paramètre `print=true` pour afficher uniquement le CV.

---

## 🧪 ÉTAPE 5: Tester

### 5.1 Démarrer les deux services

Terminal 1 - App React :
```bash
npm run dev
```

Terminal 2 - Serveur PDF :
```bash
cd pdf-server
npm start
```

### 5.2 Tester l'export

1. Ouvrez http://localhost:5173
2. Connectez-vous
3. Ouvrez un CV
4. Cliquez sur **"Exporter PDF (Puppeteer)"**
5. Attendre 3-5 secondes
6. ✅ Le PDF se télécharge automatiquement

---

## ⚙️ Configuration Avancée

### Variables d'environnement

Créez `pdf-server/.env` :

```env
PORT=3001
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
APP_URL=http://localhost:5173
```

### Modification server.js

```javascript
// Utiliser les variables d'environnement
const PORT = process.env.PORT || 3001;
const TIMEOUT = parseInt(process.env.PUPPETEER_TIMEOUT) || 30000;

// server.js - Ligne 45
browser = await puppeteer.launch({
  headless: process.env.PUPPETEER_HEADLESS !== 'false',
  args: [...],
  timeout: TIMEOUT,
});
```

---

## 🐛 Résolution de Problèmes

### ❌ "Cannot find module 'puppeteer'"

```bash
cd pdf-server
npm install
```

### ❌ "ECONNREFUSED localhost:3001"

Le serveur n'est pas démarré :
```bash
cd pdf-server
npm start
```

### ❌ "TimeoutError: Navigation timeout"

Augmentez le timeout dans `server.js` :
```javascript
await page.goto(printUrl, {
  waitUntil: 'networkidle0',
  timeout: 60000, // 60s au lieu de 30s
});
```

### ❌ PDF vide ou incomplet

Vérifiez que la page print est accessible :
```bash
# Ouvrez dans votre navigateur
http://localhost:5173/cv-print/VOTRE_CV_ID
```

### ❌ Images ne s'affichent pas

Vérifiez CORS dans Supabase :
```
Dashboard → Storage → Settings → CORS
Ajouter: http://localhost:5173
```

---

## 📊 Performances

### Temps de génération

| Étape | Durée |
|-------|-------|
| Lancement Chrome | 1-2s |
| Chargement page | 1-2s |
| Rendu + PDF | 0.5-1s |
| **Total** | **3-5s** |

### Optimisations possibles

1. **Pool de browsers** (réutiliser Chrome)
2. **Cache PDF** (éviter regénération)
3. **Queue** (gestion multiple exports)

---

## 🚀 Déploiement Production

### Option 1: Railway.app

```bash
# Créer un fichier Procfile
echo "web: node server.js" > Procfile

# Déployer
railway init
railway up
```

### Option 2: Render.com

```yaml
# render.yaml
services:
  - type: web
    name: player11-pdf-server
    env: node
    buildCommand: npm install
    startCommand: node server.js
```

### Option 3: VPS (DigitalOcean, OVH)

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer les dépendances Puppeteer
sudo apt-get install -y \
  chromium \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils

# Démarrer avec PM2
npm install -g pm2
pm2 start server.js --name pdf-server
pm2 save
pm2 startup
```

---

## 📝 Structure des Fichiers

```
Palyer11/
├── src/
│   ├── components/
│   │   └── PuppeteerPDFExport.tsx  ← Nouveau
│   └── pages/
│       └── CVPrintPage.tsx         ← Nouveau (optionnel)
├── pdf-server/
│   ├── server.js                   ← Serveur Puppeteer
│   ├── package.json                ← Dépendances
│   └── .env                        ← Config (optionnel)
└── PDF_PUPPETEER_SETUP.md          ← Ce fichier
```

---

## ✅ Checklist Finale

- [ ] Serveur installé (`npm install`)
- [ ] Serveur démarré (`npm start`)
- [ ] Frontend configuré (import PuppeteerPDFExport)
- [ ] Page print accessible (test dans navigateur)
- [ ] CORS Supabase configuré
- [ ] Test d'export réussi
- [ ] PDF téléchargé avec nom correct

---

## 🎯 Résultat Attendu

✅ **PDF 100% pixel-perfect** (Chrome engine)  
✅ **A4 exact** (210×297mm)  
✅ **Haute résolution** (300 DPI équivalent)  
✅ **Couleurs fidèles**  
✅ **Polices natives**  
✅ **Images HD**  
✅ **Nom dynamique** (CV_Daba_Diallo.pdf)  
✅ **Optimisé impression**  
✅ **Optimisé WhatsApp** (<5MB)  

---

## 🆘 Support

En cas de problème :

1. Vérifiez les logs du serveur (terminal)
2. Vérifiez la console navigateur (F12)
3. Testez l'URL print directement
4. Vérifiez que les deux services tournent

---

**Version:** 1.0.0  
**Stack:** React + Puppeteer + Express  
**Qualité:** 100% Pixel-Perfect 🎯
