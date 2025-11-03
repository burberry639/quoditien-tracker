# Application de Suivi Quotidien 📋

Application web pour suivre vos habitudes quotidiennes (sommeil, sport, alimentation, hygiène, prières, etc.)

## 🚀 Déploiement sur Render

### Étape 1 : Préparer votre code

1. Créez un compte sur [GitHub](https://github.com) si vous n'en avez pas
2. Créez un nouveau repository (dépôt) sur GitHub
3. Uploadez tous les fichiers de ce dossier dans votre repository

### Étape 2 : Déployer sur Render

1. Allez sur [Render.com](https://render.com) et créez un compte
2. Cliquez sur **"New +"** puis **"Web Service"**
3. Connectez votre repository GitHub
4. Configurez votre service :
   - **Name** : `suivi-quotidien` (ou le nom que vous voulez)
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : `Free`

5. Cliquez sur **"Create Web Service"**

### Étape 3 : Accéder à votre application

Une fois déployée, Render vous donnera une URL du type :
`https://suivi-quotidien.onrender.com`

Votre application sera accessible sur cette URL ! 🎉

## 📝 Alternative : Déploiement rapide

Si vous ne voulez pas utiliser GitHub, vous pouvez aussi :

1. Compresser ce dossier en fichier ZIP
2. Sur Render, utiliser l'option "Deploy from local Git"
3. Suivre les mêmes étapes de configuration

## ⚠️ Note importante

Avec le plan gratuit de Render :
- L'application peut se mettre en veille après 15 minutes d'inactivité
- Il faudra attendre quelques secondes au premier chargement
- Parfait pour un usage personnel !

## 📱 Utilisation

Une fois déployée, vous pouvez :
- Accéder à l'application depuis n'importe quel appareil
- Ajouter l'URL à vos favoris
- Sur mobile, ajouter un raccourci sur l'écran d'accueil

Bon courage dans le suivi de vos habitudes ! 💪
