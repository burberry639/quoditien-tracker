# 🎮 RPG Tracker - Guide d'utilisation

## 📦 Installation

1. Télécharge les 3 fichiers :
   - `index.html`
   - `style.css`
   - `app.js`

2. Mets-les dans le même dossier

3. Double-clique sur `index.html` pour ouvrir dans ton navigateur

## ✨ Fonctionnalités

### 📋 Page Quotidien
- Suivi de toutes tes habitudes
- Streaks (séries)
- Progression quotidienne en %
- **✨ Explosion de particules** lors du clic sur une habitude

### 📊 Page Stats
- Système de rang (F → INCONNU)
- Stats RPG (Force, Discipline, Spiritualité, etc.)
- Radar chart visuel
- Power Level
- **🌈 Effets de particules selon ton rang** :
  - Rangs F-D : Effet subtil bleu
  - Rangs C-A : Effet cyan/bleu moyen
  - Rangs S-SSR+ : Effet intense multicolore
  - Rangs UR+ : Effet légendaire avec particules dorées
  - Rangs X-INCONNU : Effet épique arc-en-ciel animé
- **✨ Effets spéciaux sur les stats** :
  - Stats 50-79% : Effet de brillance moyen
  - Stats 80%+ : Effet de brillance intense avec particules
  - Power Level 400+ : Aura pulsante multicolore
- **🎨 Traînée de curseur** automatique pour rangs UR+ et au-dessus

### 🎯 Page Quêtes
- 5 quêtes quotidiennes
- Timer de renouvellement
- Bonus à gagner

### 🏆 Page Classement
- Leaderboard Firebase en temps réel
- Compare-toi avec tes amis
- Voir les rangs de tous

## 🎨 Système d'effets visuels

### Particules de rang
Les particules apparaissent automatiquement autour de ton badge de rang :
- Plus ton rang est élevé, plus les effets sont impressionnants
- Les particules se régénèrent toutes les 5 secondes
- Couleurs adaptées à chaque niveau de rang

### Effets de stats
- Les barres de stats brillent selon leur niveau
- Effet de particules pour les stats élevées
- Animation d'aura pour le Power Level élevé

### Traînée de curseur (Premium)
- Activée automatiquement pour les rangs UR+ et supérieurs
- Particules qui suivent ton curseur
- Effet visuel premium pour les joueurs d'élite

## 🔧 Corrections effectuées

✅ Erreur de référence circulaire corrigée
✅ Navigation par onglets ajoutée
✅ Doublons de code supprimés
✅ Initialisation corrigée
✅ Structure HTML nettoyée
✅ Bouton réinitialiser supprimé (reset automatique)
✅ **Système de particules selon le rang ajouté**
✅ **Effets spéciaux sur les stats ajoutés**

## 🚀 Déploiement

Pour héberger en ligne :
- **Vercel** : `npx vercel`
- **Netlify** : Drag & drop sur netlify.com
- **GitHub Pages** : Push sur GitHub → Settings → Pages

## 🎯 Progression des effets

### Rangs Débutants (F-E-D)
- Effet minimal : petite brillance
- 3 particules bleues claires

### Rangs Intermédiaires (C-B-A)
- Effet moyen : brillance animée
- 8 particules cyan/bleu
- Léger pulse lumineux

### Rangs Avancés (S-SSS-SR-SSR)
- Effet intense : brillance forte
- 12 particules multicolores
- Pulse lumineux marqué

### Rangs Légendaires (UR-LR-MR)
- Effet légendaire : brillance éclatante
- 20 particules dorées/roses/cyan
- Pulse lumineux intense
- Rotation animée

### Rangs Divins (X-XX-XXX-EX-DX-INHUMAIN-DIVIN-INCONNU)
- Effet épique : brillance arc-en-ciel
- 20+ particules multicolores changeantes
- Pulse lumineux + rotation + changement de couleur
- **Traînée de curseur activée**
- Effet d'aura permanent

Enjoy ton aventure ! 🎮⚔️✨
