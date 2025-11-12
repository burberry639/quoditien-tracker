const express = require('express');
const path = require('path');
const app = express();

// Port fourni par Render ou 3000 en local
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static('public'));

// Servir le favicon depuis la racine
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.ico'));
});

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
