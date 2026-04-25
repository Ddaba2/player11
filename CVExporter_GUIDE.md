# 📄 Guide d'Utilisation - CVExporter

## 🎯 Fonctionnalités

Le composant `CVExporter` est un système d'export PDF professionnel pour CV sportifs avec :

✅ **Format A4 Paysage** forcé  
✅ **Haute définition** (scale: 2)  
✅ **Images Supabase** supportées (CORS)  
✅ **Fit-to-Page** automatique  
✅ **Barre de progression**  
✅ **Pas de zoom** (windowWidth fixe à 1200px)  

---

## 📦 Installation

```bash
npm install html2canvas jspdf
```

---

## 🚀 Utilisation de Base

### 1. Importer le composant

```tsx
import CVExporter from './components/CVExporter';
```

### 2. Utilisation dans CVView.tsx

```tsx
import { useRef } from 'react';
import CVExporter from '../components/CVExporter';

export default function CVView({ cvId, cv }) {
  const exporterRef = useRef<any>(null);

  return (
    <div>
      {/* Bouton d'export personnalisé */}
      <button onClick={() => exporterRef.current?.exportToPDF()}>
        Télécharger PDF
      </button>

      {/* Conteneur du CV avec ref */}
      <div id="cv-print-area">
        {/* Votre contenu CV */}
      </div>

      {/* Composant Exporter */}
      <CVExporter
        cvId={cvId}
        cvData={cv}
        ref={exporterRef}
      />
    </div>
  );
}
```

---

## ⚙️ Configuration Détaillée

### Options html2canvas

```typescript
{
  scale: 2,                    // HD Quality (2x)
  useCORS: true,               // ✅ Images Supabase
  allowTaint: true,            // Tolère cross-origin
  width: 1200,                 // ✅ Largeur FIXE
  windowWidth: 1200,           // ✅ Viewport FIXE
  scrollX: 0,                  // Pas de décalage
  scrollY: 0,
  x: 0,                        // Coordonnées de départ
  y: 0,
  logging: false,              // Désactive logs
  letterRendering: true,       // Meilleur rendu texte
  foreignObjectRendering: false, // Compatibilité
  removeContainer: true,       // Nettoyage
  backgroundColor: '#0f172a',  // Match votre design
}
```

### Options jsPDF

```typescript
{
  orientation: 'landscape',    // ✅ FORCE PAYSAGE
  unit: 'mm',
  format: 'a4',                // 297mm × 210mm
  compress: true,              // Optimise taille
}
```

---

## 🔧 Props du Composant

| Prop | Type | Description |
|------|------|-------------|
| `cvId` | `string` | **Requis** - ID du CV |
| `cvData` | `object` | **Requis** - Données du CV |
| `triggerExport` | `boolean` | Déclenche l'export automatiquement |
| `onExportComplete` | `function` | Callback après export réussi |

---

## 💡 Exemples Avancés

### Exemple 1: Export avec bouton personnalisé

```tsx
import { useRef, useState } from 'react';

export default function MonComposant() {
  const [exporting, setExporting] = useState(false);
  
  const handleExport = async () => {
    setExporting(true);
    // Logique d'export
    setExporting(false);
  };

  return (
    <button 
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? 'Export...' : 'Exporter PDF'}
    </button>
  );
}
```

### Exemple 2: Export automatique au chargement

```tsx
<CVExporter
  cvId={cvId}
  cvData={cv}
  triggerExport={true}
  onExportComplete={() => console.log('PDF généré!')}
/>
```

### Exemple 3: Intégration avec votre CVView actuel

```tsx
// Dans CVView.tsx
import CVExporter from '../components/CVExporter';

export default function CVView({ cvId, onNavigate }) {
  const [cv, setCv] = useState(null);

  return (
    <div>
      {/* Header avec bouton */}
      <div className="header">
        <CVExporter
          cvId={cvId}
          cvData={cv}
        />
      </div>

      {/* CV Container */}
      <div id="cv-print-area">
        <CVPreview cv={cv} />
      </div>
    </div>
  );
}
```

---

## 🎨 Personnalisation du Style

### Modifier les marges PDF

Dans `getCanvasOptions()`:

```typescript
// Dans CVExporter.tsx, ligne ~60
const margin = 5; // Changez cette valeur (en mm)
```

### Changer la qualité d'image

```typescript
// Ligne ~130
const imgData = canvas.toDataURL('image/png', 1.0); // 0.1 à 1.0
```

### Format Portrait au lieu de Paysage

```typescript
// Ligne ~95
const pdf = new jsPDF({
  orientation: 'portrait', // Changez ici
  unit: 'mm',
  format: 'a4',
});

// Ligne ~100
const pageWidth = 210;  // Portrait width
const pageHeight = 297; // Portrait height
```

---

## 🐛 Résolution de Problèmes

### ❌ Les images ne s'affichent pas

**Solution:** Vérifiez CORS dans Supabase

```
Supabase Dashboard → Storage → Settings → CORS
Ajouter: https://votre-domaine.com
```

### ❌ Le PDF est zoomé

**Solution:** Vérifiez `windowWidth`

```typescript
html2canvas: {
  windowWidth: 1200, // Doit être FIXE
  width: 1200,       // Même valeur
}
```

### ❌ Le contenu dépasse une page

**Solution:** Réduisez le contenu du CV
- Limitez les expériences à 5
- Réduisez la bio
- Limitez les palmarès à 6

### ❌ Erreur "Cannot read property..."

**Solution:** Vérifiez que `cvContainerRef.current` existe

```typescript
if (!cvContainerRef.current) {
  console.error('Conteneur non trouvé');
  return;
}
```

---

## 📊 Logs de Debug

Le composant génère des logs détaillés :

```
⏳ Chargement des images...
⚙️ Configuration canvas: { scale: 2, width: 1200, useCORS: true }
✅ Canvas créé: 2400 x 1600
📄 PDF: { pageWidth: 297, pageHeight: 210, finalWidth: 287, ... }
✅ Export PDF réussi!
```

---

## 🎯 Checklist avant Production

- [ ] Images Supabase accessibles (CORS configuré)
- [ ] `width` et `windowWidth` à 1200px
- [ ] `scale: 2` pour HD
- [ ] `useCORS: true` activé
- [ ] Orientation landscape confirmée
- [ ] Test avec différents CVs
- [ ] Vérifié sur mobile et desktop

---

## 📝 Notes Importantes

1. **Toujours utiliser `useRef`** pour cibler le conteneur
2. **Attendre les images** avant la capture (déjà inclus)
3. **Width fixe obligatoire** (1200px recommandé)
4. **CORS obligatoire** pour images Supabase
5. **Scale 2** = meilleur compromis qualité/taille

---

## 🆘 Support

En cas de problème :
1. Vérifiez les logs console (F12)
2. Confirmez que les images sont chargées
3. Testez avec un CV simple
4. Vérifiez la configuration CORS Supabase

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2026-04-19
