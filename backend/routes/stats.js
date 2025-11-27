const express = require('express');
const db = require('../config/database');

const router = express.Router();

const StatsService = {
  getStatsByField: async (field) => {
    const SQL = `SELECT ${field}, COUNT(*) as count FROM profil GROUP BY ${field}`;
    const [results] = await db.execute(SQL);
    return results;
  },

  getTotalCount: async () => {
    const SQL = "SELECT COUNT(*) as total FROM profil";
    const [results] = await db.execute(SQL);
    return results[0];
  }
};

const handleStats = async (res, operation, errorMessage) => {
  try {
    const results = await operation;
    res.json(results);
  } catch (error) {
    console.error(errorMessage, error);
    res.status(500).json({ error: errorMessage, details: error.message, alertType: 'error' });
  }
};

// Statistiques par région
router.get("/Statistiques/region", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField('Region'),
    "Erreur statistiques régions"
  );
});

// Statistiques par titre
router.get("/Statistiques/titre", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField('Titre'),
    "Erreur statistiques titres"
  );
});

// Statistiques par domaine
router.get("/Statistiques/domaine", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField('Domaine'),
    "Erreur statistiques domaines"
  );
});

// Statistiques total
router.get("/Statistiques/total", async (req, res) => {
  await handleStats(
    res,
    StatsService.getTotalCount(),
    "Erreur statistiques total"
  );
});

// Statistiques par titre et région
router.get('/Statistiques/titre-region', async (req, res) => {
  try {
    const SQL = `
      SELECT Titre, Region, COUNT(*) as count 
      FROM profil 
      GROUP BY Titre, Region 
      ORDER BY Region, count DESC
    `;
    
    const [results] = await db.execute(SQL);
    res.json(results);
  } catch (error) {
    console.error('Erreur statistiques titre-région:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques titre-région', alertType: 'error' });
  }
});

// Statistiques par domaine et région
router.get('/Statistiques/domaine-region', async (req, res) => {
  try {
    const SQL = `
      SELECT Domaine, Region, COUNT(*) as count 
      FROM profil 
      GROUP BY Domaine, Region 
      ORDER BY Region, count DESC
    `;
    
    const [results] = await db.execute(SQL);
    res.json(results);
  } catch (error) {
    console.error('Erreur statistiques domaine-région:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques domaine-région', alertType: 'error' });
  }
});

module.exports = router;