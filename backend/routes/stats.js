const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Test de connexion et vérification des données
router.get('/test-connection', async (req, res) => {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Vérifier la connexion à la base de données
    const [rows] = await db.execute('SELECT 1 as connection_test');
    console.log('✅ Connexion MySQL établie');
    
    // Vérifier si la table existe
    const [tables] = await db.execute(
      `SELECT TABLE_NAME, TABLE_ROWS 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'profil'`
    );
    
    let tableExists = false;
    let tableName = 'profil';
    let totalRecords = 0;
    let sampleData = [];
    let tableStructure = [];
    
    if (tables.length > 0) {
      tableExists = true;
      tableName = tables[0].TABLE_NAME;
      
      // Compter le nombre d'enregistrements
      try {
        const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM profil`);
        totalRecords = countResult[0].total || 0;
        
        // Récupérer quelques données d'exemple
        if (totalRecords > 0) {
          const [sample] = await db.execute(
            `SELECT Titre, Domaine, Region, COUNT(*) as count
             FROM profil 
             WHERE Titre IS NOT NULL 
             GROUP BY Titre, Domaine, Region
             LIMIT 5`
          );
          sampleData = sample;
        }
      } catch (countError) {
        console.warn('⚠️ Impossible de compter les enregistrements:', countError.message);
      }

      // Vérifier la structure de la table
      try {
        const [structure] = await db.execute(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'profil' 
           ORDER BY ORDINAL_POSITION`
        );
        tableStructure = structure;
      } catch (structureError) {
        console.warn('⚠️ Impossible de récupérer la structure:', structureError.message);
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: rows.length > 0,
        tableExists: tableExists,
        tableName: tableName,
        totalRecords: totalRecords,
        sampleData: sampleData,
        tableStructure: tableStructure,
        columns: tableStructure.map(col => col.COLUMN_NAME)
      }
    });
  } catch (error) {
    console.error('❌ Erreur test-connection:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      suggestion: 'Vérifiez la connexion à la base de données MySQL'
    });
  }
});

// Statistique par titre, domaine et région
router.get('/stats-titre-domaine-region', async (req, res) => {
  try {
    console.log('📊 Requête stats-titre-domaine-region en cours...');
    
    const query = `
      SELECT 
        COALESCE(Titre, 'Non spécifié') as Titre,
        COALESCE(Domaine, 'Non spécifié') as Domaine,
        COALESCE(Region, 'Non spécifié') as Region,
        COUNT(*) as count
      FROM profil
      GROUP BY Titre, Domaine, Region
      ORDER BY Titre, Domaine, Region
    `;
    
    const [results] = await db.execute(query);
    
    console.log(`✅ ${results.length} résultats trouvés`);
    
    // Préparer la réponse
    const response = {
      success: true,
      count: results.length,
      data: results,
      summary: {
        total: results.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0),
        uniqueTitles: [...new Set(results.map(item => item.Titre))].length,
        uniqueDomaines: [...new Set(results.map(item => item.Domaine))].length,
        uniqueRegions: [...new Set(results.map(item => item.Region))].length
      }
    };
    
    if (results.length === 0) {
      response.message = 'Aucune donnée trouvée dans la table';
      response.alertType = 'warning';
    } else {
      response.message = 'Statistiques récupérées avec succès';
      response.alertType = 'success';
    }
    
    res.json(response);
  } catch (error) {
    console.error('❌ Erreur stats-titre-domaine-region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques', 
      error: error.message,
      alertType: 'error',
      suggestion: 'Vérifiez les noms des colonnes dans la table profil'
    });
  }
});

// Statistique par titre et région
router.get('/stats-titre-region', async (req, res) => {
  try {
    console.log('📊 Requête stats-titre-region en cours...');
    
    const query = `
      SELECT 
        COALESCE(Titre, 'Non spécifié') as Titre,
        COALESCE(Region, 'Non spécifié') as Region,
        COUNT(*) as count
      FROM profil
      GROUP BY Titre, Region
      ORDER BY Titre, Region
    `;
    
    const [results] = await db.execute(query);
    
    console.log(`✅ ${results.length} résultats trouvés`);
    
    // Calculer les totaux pour les résumés
    const total = results.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
    const uniqueTitles = [...new Set(results.map(item => item.Titre))].length;
    const uniqueRegions = [...new Set(results.map(item => item.Region))].length;
    
    res.json({ 
      success: true, 
      message: 'Statistiques récupérées avec succès',
      alertType: 'success',
      count: results.length,
      summary: {
        total: total,
        uniqueTitles: uniqueTitles,
        uniqueRegions: uniqueRegions
      },
      data: results
    });
  } catch (error) {
    console.error('❌ Erreur stats-titre-region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message,
      alertType: 'error'
    });
  }
});

// Statistique par domaine et région
router.get('/stats-domaine-region', async (req, res) => {
  try {
    console.log('📊 Requête stats-domaine-region en cours...');
    
    const query = `
      SELECT 
        COALESCE(Domaine, 'Non spécifié') as Domaine,
        COALESCE(Region, 'Non spécifié') as Region,
        COUNT(*) as count
      FROM profil
      GROUP BY Domaine, Region
      ORDER BY Domaine, Region
    `;
    
    const [results] = await db.execute(query);
    
    console.log(`✅ ${results.length} résultats trouvés`);
    
    res.json({ 
      success: true, 
      message: 'Statistiques récupérées avec succès',
      alertType: 'success',
      count: results.length,
      summary: {
        total: results.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0),
        uniqueDomaines: [...new Set(results.map(item => item.Domaine))].length,
        uniqueRegions: [...new Set(results.map(item => item.Region))].length
      },
      data: results
    });
  } catch (error) {
    console.error('❌ Erreur stats-domaine-region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message,
      alertType: 'error'
    });
  }
});


// Statistique par titre seul
router.get('/stats-titre', async (req, res) => {
  try {
    console.log('📊 Requête stats-titre en cours...');
    
    const query = `
      SELECT 
        COALESCE(Titre, 'Non spécifié') as Titre,
        COUNT(*) as count
      FROM profil
      GROUP BY Titre
      ORDER BY count DESC
    `;
    
    const [results] = await db.execute(query);
    console.log(`✅ ${results.length} résultats trouvés`);
    
    res.json({ 
      success: true, 
      message: 'Statistiques récupérées avec succès',
      alertType: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('❌ Erreur stats-titre:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message,
      alertType: 'error'
    });
  }
});

// Statistique par domaine seul
router.get('/stats-domaine', async (req, res) => {
  try {
    console.log('📊 Requête stats-domaine en cours...');
    
    const query = `
      SELECT 
        COALESCE(Domaine, 'Non spécifié') as Domaine,
        COUNT(*) as count
      FROM profil
      GROUP BY Domaine
      ORDER BY count DESC
    `;
    
    const [results] = await db.execute(query);
    console.log(`✅ ${results.length} résultats trouvés`);
    
    res.json({ 
      success: true, 
      message: 'Statistiques récupérées avec succès',
      alertType: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('❌ Erreur stats-domaine:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message,
      alertType: 'error'
    });
  }
});

// Statistique par région seule
router.get('/stats-region', async (req, res) => {
  try {
    console.log('📊 Requête stats-region en cours...');
    
    const query = `
      SELECT 
        COALESCE(Region, 'Non spécifié') as Region,
        COUNT(*) as count
      FROM profil
      GROUP BY Region
      ORDER BY count DESC
    `;
    
    const [results] = await db.execute(query);
    console.log(`✅ ${results.length} résultats trouvés`);
    
    res.json({ 
      success: true, 
      message: 'Statistiques récupérées avec succès',
      alertType: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('❌ Erreur stats-region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message,
      alertType: 'error'
    });
  }
});

// Route pour obtenir toutes les données brutes (pour debug)
router.get('/all-data', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, Nom, Prenom, Titre, Domaine, Region, Date, genre, Adresse, NumOrdre, Contact, AutreContact, Lieu, users_id
      FROM profil
      ORDER BY id DESC
      LIMIT 100
    `;
    
    const [results] = await db.execute(query);
    
    res.json({ 
      success: true, 
      message: 'Données récupérées avec succès',
      alertType: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Erreur all-data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message,
      alertType: 'error'
    });
  }
});

// Route pour vérifier les valeurs uniques des colonnes
router.get('/check-values', async (req, res) => {
  try {
    const [titreValues] = await db.execute(
      `SELECT DISTINCT Titre, COUNT(*) as count 
       FROM profil 
       WHERE Titre IS NOT NULL 
       GROUP BY Titre
       ORDER BY Titre`
    );
    
    const [domaineValues] = await db.execute(
      `SELECT DISTINCT Domaine, COUNT(*) as count 
       FROM profil 
       WHERE Domaine IS NOT NULL 
       GROUP BY Domaine
       ORDER BY Domaine`
    );
    
    const [regionValues] = await db.execute(
      `SELECT DISTINCT Region, COUNT(*) as count 
       FROM profil 
       WHERE Region IS NOT NULL 
       GROUP BY Region
       ORDER BY Region`
    );

    const [genreValues] = await db.execute(
      `SELECT DISTINCT genre, COUNT(*) as count 
       FROM profil 
       WHERE genre IS NOT NULL 
       GROUP BY genre
       ORDER BY genre`
    );

    res.json({
      success: true,
      message: 'Valeurs uniques récupérées avec succès',
      alertType: 'success',
      data: {
        titre: titreValues,
        domaine: domaineValues,
        region: regionValues,
        genre: genreValues
      }
    });
  } catch (error) {
    console.error('Erreur check-values:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message,
      alertType: 'error'
    });
  }
});

// Route protégée pour ajouter un profil
router.post('/ajouter', verifyToken, async (req, res) => {
  const {
    Nom,
    Prenom,
    Date,
    genre,
    Adresse,
    NumOrdre,
    Contact,
    AutreContact,
    Titre,
    Domaine,
    Lieu,
    Region
  } = req.body;

  try {
    const SQL = `
      INSERT INTO profil 
      (Nom, Prenom, Date, genre, Adresse, NumOrdre, Contact, AutreContact, Titre, Domaine, Lieu, Region, users_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [results] = await db.execute(SQL, [
      Nom,
      Prenom,
      Date,
      genre,
      Adresse,
      NumOrdre,
      Contact,
      AutreContact,
      Titre,
      Domaine,
      Lieu,
      Region,
      req.user.id
    ]);
    
    res.json({
      success: true,
      message: 'Profil ajouté avec succès',
      alertType: 'success',
      id: results.insertId
    });
  } catch (err) {
    console.error('Erreur ajout profil:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: err.message,
      alertType: 'error'
    });
  }
});

// Route pour récupérer les totaux généraux
router.get('/totals', async (req, res) => {
  try {
    const [totalCount] = await db.execute('SELECT COUNT(*) as total FROM profil');
    const [titreCount] = await db.execute('SELECT COUNT(DISTINCT Titre) as count FROM profil WHERE Titre IS NOT NULL');
    const [domaineCount] = await db.execute('SELECT COUNT(DISTINCT Domaine) as count FROM profil WHERE Domaine IS NOT NULL');
    const [regionCount] = await db.execute('SELECT COUNT(DISTINCT Region) as count FROM profil WHERE Region IS NOT NULL');
    
    res.json({
      success: true,
      data: {
        total: totalCount[0].total,
        uniqueTitles: titreCount[0].count,
        uniqueDomaines: domaineCount[0].count,
        uniqueRegions: regionCount[0].count
      }
    });
  } catch (error) {
    console.error('Erreur totals:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// Route pour récupérer le profil par user_id
router.get('/profil-by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT * FROM profil 
      WHERE users_id = ?
      LIMIT 1
    `;
    
    const [results] = await db.execute(query, [userId]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profil non trouvé',
        alertType: 'warning' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Profil récupéré avec succès',
      alertType: 'success',
      data: results[0]
    });
  } catch (error) {
    console.error('Erreur profil-by-user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message,
      alertType: 'error'
    });
  }
});


// Statistiques générales admin
router.get('/admin/stats', (req, res) => {
  const sql = `
      SELECT 
          (SELECT COUNT(*) FROM users) AS totalUsers,
          (SELECT COUNT(*) FROM formations) AS totalFormations,
          (SELECT COUNT(*) FROM avis) AS totalAvis
  `;
  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur stats admin" });
    res.json(rows[0]);
  });
});

// Derniers inscrits
router.get('/admin/recent', (req, res) => {
  const sql = `
      SELECT nom, prenom, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
  `;
  connection.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur chargement recents" });
    res.json(rows);
  });
});



module.exports = router;