const express = require('express');
const cors = require('cors');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const crudRoutes = require('./routes/crud');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes SANS /api
app.use(authRoutes);
app.use(adminRoutes);
app.use(crudRoutes);
app.use(statsRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API SourireGuide fonctionnelle' });
});

// Démarrage du serveur
app.listen(3002, () => {
  console.log('Serveur connecter sur http://localhost:3002');
});