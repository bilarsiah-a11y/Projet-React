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

// Profil utilisateur
router.post('/Profil', verifyToken, async (req, res) => {
  const SQL = `
    SELECT 
      u.username, u.email, u.profileImage,
      p.Nom, p.Prenom, p.Date, p.Lieu, p.genre, p.Adresse,
      p.Contact, p.AutreContact, p.NumOrdre, p.Titre, p.Domaine, p.Region
    FROM users u
    INNER JOIN profil p ON u.id = p.users_id
    WHERE u.id = ?;
  `;
  
  try {
    const [result] = await db.execute(SQL, [req.user.id]);
    if (result.length === 0) return res.status(404).send({ message: "Profil non trouvé.", alertType: 'error' });
    res.json(result[0]);
  } catch (err) {
    res.status(500).send({ message: "Erreur serveur.", details: err.sqlMessage, alertType: 'error' });
  }
});

// Liste des dentistes
router.get("/ListeDentistes", async (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
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
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,p.Contact,p.AutreContact,
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

// Ajouter profil
router.post('/Ajouter', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region
  } = req.body;

  if (!Nom || !Prenom || !Date || !Lieu || !genre || !Adresse || !NumOrdre || !Contact || !AutreContact  || !Titre || !Domaine || !Region) {
    return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis", alertType: 'warning' });
  }

  const SQL = `
    INSERT INTO profil (
      users_id, Nom, Prenom, Date, Lieu, genre, Adresse,
      NumOrdre, Contact, AutreContact, Titre, Domaine, Region
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId, Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region
  ];

  try {
    await db.execute(SQL, values);
    res.json({ message: 'Profil ajouté avec succès', alertType: 'success' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Profil déjà existant', alertType: 'error' });
    }
    res.status(500).json({ message: 'Erreur lors de l\'ajout', details: err.sqlMessage, alertType: 'error' });
  }
});

// Modifier profil
router.put('/Modifier/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region, profileImage
  } = req.body;

  const profilId = req.params.id;

  const SQL = `
    UPDATE profil 
    SET Nom = ?, Prenom = ?, Date = ?, Lieu = ?, genre = ?, Adresse = ?,
        NumOrdre = ?, Contact = ?, AutreContact = ?, Titre = ?, Domaine = ?, Region = ?, profileImage = ?
    WHERE id = ? AND users_id = ?`;

  const values = [
    Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region, profileImage,
    profilId, userId
  ];

  try {
    const [result] = await db.execute(SQL, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profil non trouvé ou vous n\'êtes pas autorisé à le modifier', alertType: 'error' });
    }

    res.json({ message: 'Profil mis à jour avec succès', alertType: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification', details: err.sqlMessage, alertType: 'error' });
  }
});

module.exports = router;