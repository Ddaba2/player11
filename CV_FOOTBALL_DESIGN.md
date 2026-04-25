# ⚽ CV Football Premium - Guide d'Utilisation

## 🎨 Design Inspiré FIFA Ultimate Team

Un CV sportif premium avec un design sombre "Dark Mode" et des accents orange/rouge vifs, inspiré des cartes FUT de FIFA.

---

## 📦 NOUVEAU COMPOSANT CRÉÉ

✅ **CVPreviewFootball.tsx** - Design football premium complet

### Emplacement
```
src/components/CVPreviewFootball.tsx
```

---

## 🚀 UTILISATION

### Option 1: Remplacer le design actuel

Dans `CVView.tsx`, remplacez :

```tsx
// AVANT
import CVPreview from '../components/CVPreview';

<CVPreview cv={cv} />
```

Par :

```tsx
// APRÈS
import CVPreviewFootball from '../components/CVPreviewFootball';

<CVPreviewFootball cv={cv} />
```

### Option 2: Ajouter un sélecteur de design

Permettez à l'utilisateur de choisir entre les deux designs :

```tsx
import CVPreview from '../components/CVPreview';
import CVPreviewFootball from '../components/CVPreviewFootball';

const [design, setDesign] = useState<'classic' | 'football'>('football');

// Dans le rendu
{design === 'football' ? (
  <CVPreviewFootball cv={cv} />
) : (
  <CVPreview cv={cv} />
)}

// Boutons de sélection
<div className="flex gap-2 mb-4">
  <button onClick={() => setDesign('football')}>
    Football Premium
  </button>
  <button onClick={() => setDesign('classic')}>
    Classique
  </button>
</div>
```

---

## 🎯 CARACTÉRISTIQUES DU DESIGN

### En-tête (Dark Section)

```
┌──────────────────────────────────────────┐
│  [Fibre de carbone + dégradé lumineux]   │
│                                          │
│  ┌──────┐  FOOTBALL                      │
│  │ PHOTO│  DABA DIALLO                   │
│  │      │  Défenseur central • Amazone   │
│  └──────┘                                │
│                                          │
│  📅 20 ans  🇲🇱 Malienne  🦶 Droit      │
│  ✉️ Email   📞 Tél      📍 Position      │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │  50  │  │  10  │  │  7   │           │
│  │MATCHS│  │ BUTS │  │PASSES│           │
│  └──────┘  └──────┘  └──────┘           │
└──────────────────────────────────────────┘
```

**Éléments visuels :**
- ✅ Fond bleu très sombre (#0a0e1a)
- ✅ Texture fibre de carbone subtile
- ✅ Photo avec bordure néon orange
- ✅ Nom en très grandes lettres blanches
- ✅ Grille d'informations parfaitement alignée
- ✅ 3 boîtes de statistiques avec bordures orange

---

### Section Principale (White Section)

```
┌────────────────┬─────────────────────────┐
│ COLONNE GAUCHE │ COLONNE DROITE          │
│                │                         │
│ PROFIL         │ PARCOURS PROFESSIONNEL  │
│ Bio courte     │                         │
│                │ 2025 — Présent          │
│ PHYSIQUE       │ ┌─────────────────┐     │
│ • 184 cm       │ │ Amazone Elite   │     │
│ • 80 kg        │ │ 35 matches      │     │
│ • Droit        │ │ 99% duels       │     │
│                │ └─────────────────┘     │
│ STYLE DE JEU   │                         │
│ [Physique]     │ 2023 — 2025             │
│ [Leader]       │ ┌─────────────────┐     │
│ [Technique]    │ │ ASKC            │     │
│                │ │ 28 matches      │     │
│ VIDÉOS         │ └─────────────────┘     │
│ [QR CODE]      │                         │
│ YouTube Link   │ PALMARÈS                │
│                │ 🏆 Titre 1              │
│                │ 🏆 Titre 2              │
└────────────────┴─────────────────────────┘
```

---

## 🎨 PALETTE DE COULEURS

| Élément | Couleur | Usage |
|---------|---------|-------|
| **Fond header** | `#0a0e1a` | Section sombre |
| **Accent principal** | `#FF8C00` | Bordures, stats |
| **Rouge** | `#dc2626` | Timeline, badges |
| **Texte sombre** | `#0a0e1a` | Titres |
| **Texte gris** | `#475569` | Descriptions |
| **Texte clair** | `#94a3b8` | Labels |
| **Fond blanc** | `#ffffff` | Section principale |

---

## 📊 STATS CLÉS

### Configuration dans la base de données

Le composant utilise `performance_metrics` :

```typescript
{
  performance_metrics: {
    matches_played: "50",
    goals: "10",
    assists: "7"
  }
}
```

### Stats Détaillées (Timeline)

Chaque item de timeline peut inclure :

```typescript
{
  achievement: "Amazone Elite - Défenseur central",
  year: "2025 — Présent",
  stats: {
    matches: "35",
    duels: "99%",
    interceptions: "2.3/m"
  }
}
```

---

## 🖼️ PHOTO DU JOUEUR

### Spécifications

```css
width: 140px
height: 180px
border-radius: 12px
border: 2px solid #FF8C00
box-shadow: 0 0 20px rgba(255, 140, 0, 0.4)
object-position: center top
```

### Recommandations

- ✅ Photo portrait (ratio 3:4)
- ✅ Fond neutre ou terrain
- ✅ Maillot du club
- ✅ Haute résolution (min 400x600px)
- ✅ Visage bien visible

---

## 🎬 SECTION VIDÉOS HIGHLIGHTS

### Contenu

```
┌─────────────────────────────┐
│  ▶  VIDÉOS DE HIGHLIGHTS   │
│                             │
│      ┌───────────┐          │
│      │  QR CODE  │          │
│      └───────────┘          │
│                             │
│  REJOIGNEZ MA CHAÎNE        │
│  YOUTUBE POUR LES           │
│  DERNIÈRES HIGHLIGHTS       │
│                             │
│  youtube.com/DabaDiallo...  │
└─────────────────────────────┘
```

### Personnalisation

Modifiez le lien YouTube dans le composant :

```tsx
// Ligne ~380
<a href="https://youtube.com/VOTRE_CHAINE">
  youtube.com/VOTRE_CHAINE
</a>
```

---

## ⚙️ PERSONNALISATION

### Changer les couleurs

```tsx
// Bordure néon orange → bleue
border: '2px solid #3B82F6'
boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'

// Stats boxes
border: '1px solid rgba(59, 130, 246, 0.3)'
```

### Modifier le nombre de stats

```tsx
// Ajouter une 4ème boîte
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
  <StatBox icon={<Trophy />} value="5" label="TITRES" />
</div>
```

### Ajouter des sections

```tsx
// Dans la colonne gauche
<Section title="RÉCOMPENSES INDIVIDUELLES">
  <ul>
    <li>Meilleur défenseur 2025</li>
    <li>Joueur du mois (Mars 2025)</li>
  </ul>
</Section>
```

---

## 📱 RESPONSIVE

Le composant supporte le mode mobile :

```tsx
<CVPreviewFootball cv={cv} isMobile={true} />
```

**Différences :**
- Largeur: 100% au lieu de 794px
- Hauteur: auto au lieu de 1123px
- Grille: 1 colonne au lieu de 2

---

## 🖨️ EXPORT PDF

### Avec Puppeteer (Recommandé)

Le design est optimisé pour Puppeteer :

```tsx
<PuppeteerPDFExport 
  cvId={cvId} 
  cvData={cv}
  serverUrl="http://localhost:3001"
/>
```

### Configuration PDF

```javascript
// pdf-server/server.js
format: 'A4'
width: '210mm'
height: '297mm'
printBackground: true  // Préserve couleurs
```

---

## 🎯 DONNÉES REQUISES

### Minimales

```typescript
{
  full_name: "Daba Diallo",
  sport: "Football",
  position: "Défenseur central",
  club: "Amazone Elite",
  photo_url: "https://...",
  age: 20,
  nationality: "Malienne",
  foot: "Droit",
  email: "diallodaba527@gmail.com",
  phone: "+223 83 78 40 97",
  address: "H2H3+QVP",
  height: 184,
  weight: 80,
  bio: "Profil professionnel...",
  skills: ["Physique", "Leader", "Technique"],
  achievements: ["Titre 1", "Titre 2"]
}
```

### Optionnelles

```typescript
{
  performance_metrics: {
    matches_played: "50",
    goals: "10",
    assists: "7"
  }
}
```

---

## ✅ CHECKLIST DESIGN

- [ ] Photo haute qualité chargée
- [ ] Nom affiché correctement
- [ ] Position et club visibles
- [ ] Grille d'infos alignée (3 colonnes)
- [ ] 3 boîtes de stats avec valeurs
- [ ] Bio dans section profil
- [ ] Caractéristiques physiques complètes
- [ ] Badges style de jeu affichés
- [ ] Timeline avec points rouges
- [ ] Stats détaillées par club
- [ ] Section vidéos avec QR code
- [ ] Footer avec badge FOOTBALL
- [ ] Bordure néon rouge autour du CV

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### ❌ Photo ne s'affiche pas

Vérifiez l'URL :
```tsx
console.log(cv.photo_url);
// Doit être une URL valide Supabase Storage
```

### ❌ Stats vides

Ajoutez des valeurs par défaut :
```tsx
value={stats.matches_played || '50'}
```

### ❌ Timeline vide

Le composant affiche des données par défaut si `achievements` est vide.

### ❌ Couleurs différentes en PDF

Vérifiez `printBackground: true` dans Puppeteer.

---

## 📊 COMPARAISON DES DESIGNS

| Critère | Classique | Football Premium |
|---------|-----------|------------------|
| **Style** | Sobre | FIFA FUT |
| **Fond** | Gris | Dark mode |
| **Accents** | Rouge | Orange/Rouge |
| **Stats** | Simples | Boîtes HD |
| **Timeline** | Basique | Détaillée |
| **Vidéos** | Non | QR Code |
| **Impact** | Professionnel | **Premium** ⭐ |

---

## 🎊 RÉSULTAT FINAL

```
┌──────────────────────────────────────────┐
│  🔥 CV FOOTBALL PREMIUM                  │
│                                          │
│  ✅ Design FIFA Ultimate Team            │
│  ✅ Dark mode avec accents orange        │
│  ✅ Stats clés en boîtes                 │
│  ✅ Timeline professionnelle             │
│  ✅ Section vidéos highlights            │
│  ✅ Layout deux colonnes                 │
│  ✅ Bordure néon rouge                   │
│  ✅ Pixel-perfect pour PDF               │
│                                          │
│  Prêt pour l'export PDF 100% fidèle!     │
└──────────────────────────────────────────┘
```

---

**Version:** 1.0.0  
**Style:** FIFA Ultimate Team Premium  
**Qualité:** Pixel-Perfect pour PDF 🎯
