const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload image de profil
router.post('/upload-profile-image', verifyToken, 
  upload.single('profileImage'), async (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'Aucune image', alertType: 'error' });

  const imageUrl = `http://localhost:3002/uploads/${req.file.filename}`;

  try {
    const SQL = 'UPDATE users SET profileImage = ? WHERE id = ?';
    await db.execute(SQL, [imageUrl, req.user.id]);
    res.send({ profileImage: imageUrl, message: 'Image mise à jour avec succès', alertType: 'success' });
  } catch (err) {
    res.status(500).send({ message: 'Erreur mise à jour', alertType: 'error' });
  }
});

// PROFIL UTILISATEUR - VERSION COMPLÈTEMENT CORRIGÉE
router.post('/Profil', verifyToken, async (req, res) => {
  const userId = req.user.id;
  
  console.log('🔄 Récupération profil pour user ID:', userId);

  try {
    // REQUÊTE SIMPLIFIÉE et GARANTIE
    const SQL = `
      SELECT 
        p.id,
        p.Nom, 
        p.Prenom, 
        p.Date, 
        p.Lieu, 
        p.genre, 
        p.Adresse,
        p.Contact, 
        p.AutreContact, 
        p.NumOrdre, 
        p.Titre, 
        p.Domaine, 
        p.Region,
        u.username, 
        u.email, 
        u.profileImage
      FROM users u
      LEFT JOIN profil p ON u.id = p.users_id
      WHERE u.id = ?
      LIMIT 1
    `;
    
    console.log('📋 Requête SQL:', SQL);
    console.log('🔑 Paramètre user ID:', userId);
    
    const [results] = await db.execute(SQL, [userId]);
    
    console.log('📊 Résultats bruts de la requête:', results);
    
    if (results.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec ID:', userId);
      return res.status(404).json({ message: "Utilisateur non trouvé.", alertType: 'error' });
    }

    const userData = results[0];
    console.log('✅ Données complètes trouvées:', userData);
    
    // Vérifier si un profil existe
    const hasProfil = !!userData.id; // L'id de la table profil
    
    if (hasProfil) {
      console.log('🎯 PROFIL TROUVÉ - ID:', userData.id);
    } else {
      console.log('ℹ️ Utilisateur trouvé mais AUCUN profil associé');
    }
    
    // Retourner TOUJOURS les données
    res.json(userData);
    
  } catch (err) {
    console.error('❌ Erreur récupération profil:', err);
    console.error('❌ Message erreur:', err.message);
    console.error('❌ Code erreur:', err.code);
    res.status(500).json({ 
      message: "Erreur serveur.", 
      details: err.sqlMessage, 
      alertType: 'error' 
    });
  }
});

// ROUTE DEBUG - Pour tester directement
router.get('/profil-debug/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  console.log('🔍 DEBUG - User ID reçu:', userId);
  
  try {
    // Requête utilisateur
    const userSQL = 'SELECT id, username, email, profileImage FROM users WHERE id = ?';
    const [userResults] = await db.execute(userSQL, [userId]);
    console.log('👤 Résultat utilisateur:', userResults);

    // Requête profil
    const profilSQL = 'SELECT * FROM profil WHERE users_id = ?';
    const [profilResults] = await db.execute(profilSQL, [userId]);
    console.log('📄 Résultat profil:', profilResults);

    const response = {
      user: userResults[0] || null,
      profil: profilResults[0] || null,
      combined: {
        ...(userResults[0] || {}),
        ...(profilResults[0] || {})
      },
      message: `Debug pour user ID: ${userId}`
    };
    
    console.log('📦 Réponse debug complète:', response);
    res.json(response);
    
  } catch (err) {
    console.error('❌ Erreur debug:', err);
    res.status(500).json({ 
      error: err.message,
      sqlError: err.sqlMessage 
    });
  }
});

// Liste des dentistes
router.get("/ListeDentistes", async (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.id, p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region, p.Contact, p.AutreContact,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  try {
    const [result] = await db.execute(SQL, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage, alertType: 'error' });
  }
});

router.get("/ListeDentiste2", async (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.id, p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region, p.Contact, p.AutreContact,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  try {
    const [result] = await db.execute(SQL, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage, alertType: 'error' });
  }
});

// Ajouter profil - CORRIGÉ
router.post('/Ajouter', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    nom, prenom, date, lieu, genre, adresse,
    numordre, contact, autreContact, titre, domaine, region
  } = req.body;

  console.log('📝 Données reçues pour ajout:', req.body);

  if (!nom || !prenom || !date || !lieu || !genre || !adresse || !numordre || !contact || !titre || !domaine || !region) {
    return res.status(400).json({ 
      message: "Tous les champs obligatoires doivent être remplis", 
      alertType: 'warning' 
    });
  }

  // Vérifier si un profil existe déjà
  const checkSQL = 'SELECT id FROM profil WHERE users_id = ?';
  
  try {
    const [existingProfile] = await db.execute(checkSQL, [userId]);
    
    if (existingProfile.length > 0) {
      return res.status(400).json({ 
        message: 'Un profil existe déjà pour cet utilisateur', 
        alertType: 'error',
        profilId: existingProfile[0].id
      });
    }

    const insertSQL = `
      INSERT INTO profil (
        users_id, Nom, Prenom, Date, Lieu, genre, Adresse,
        NumOrdre, Contact, AutreContact, Titre, Domaine, Region
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId, nom, prenom, date, lieu, genre, adresse,
      numordre, contact, autreContact, titre, domaine, region
    ];

    console.log('💾 Insertion avec valeurs:', values);

    const [result] = await db.execute(insertSQL, values);
    
    res.json({ 
      message: 'Profil ajouté avec succès', 
      alertType: 'success',
      profilId: result.insertId
    });
  } catch (err) {
    console.error('❌ Erreur ajout profil:', err);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout', 
      details: err.sqlMessage, 
      alertType: 'error' 
    });
  }
});

// Modifier profil - CORRIGÉ
router.put('/Modifier/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const profilId = req.params.id;

  const {
    nom, prenom, date, lieu, genre, adresse,
    numordre, contact, autreContact, titre, domaine, region
  } = req.body;

  console.log('✏️ Modification profil ID:', profilId);
  console.log('📝 Données reçues:', req.body);

  const SQL = `
    UPDATE profil 
    SET Nom = ?, Prenom = ?, Date = ?, Lieu = ?, genre = ?, Adresse = ?,
        NumOrdre = ?, Contact = ?, AutreContact = ?, Titre = ?, Domaine = ?, Region = ?
    WHERE id = ? AND users_id = ?`;

  const values = [
    nom, prenom, date, lieu, genre, adresse,
    numordre, contact, autreContact, titre, domaine, region,
    profilId, userId
  ];

  try {
    const [result] = await db.execute(SQL, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Profil non trouvé ou vous n\'êtes pas autorisé à le modifier', 
        alertType: 'error' 
      });
    }

    res.json({ 
      message: 'Profil mis à jour avec succès', 
      alertType: 'success'
    });
  } catch (err) {
    console.error('❌ Erreur modification profil:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la modification', 
      details: err.sqlMessage, 
      alertType: 'error' 
    });
  }
});

module.exports = router;