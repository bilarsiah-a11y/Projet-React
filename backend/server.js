const express = require('express');
const mysql = require('mysql2');  
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));   
const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'dentiste'
});

//verserment du de imae dans le fichier   MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const JWT_SECRET = 'votre_cle_super_secrete_123';

//  JWT affectation du donne
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Token invalide' });
    req.user = decoded;
    next();
  });
};

// ---------- Nodemailer (Gmail avec mot de passe d'application) ----------
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: 'bilarsiah@gmail.com',
    pass: 'bhri qmhg kolv ekyj' 
  },
  tls: { rejectUnauthorized: false } 
});


// Vérification que le transporter marche au démarrage
transporter.verify((error, success) => {
  if (error) console.error('❌ Erreur SMTP :', error);
  else console.log('✅ Serveur SMTP prêt');
});


app.listen(3002, () => {
  console.log('Serveur sur http://localhost:3002');
});

//---------------------INSCRIPTION------------------------

//chargement de l'image das un fichier
app.post('/upload-profile-image', verifyToken, 
  upload.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'Aucune image' });

  const imageUrl = `http://localhost:3002/uploads/${req.file.filename}`;

  const SQL = 'UPDATE users SET profileImage = ? WHERE id = ?';
  db.query(SQL, [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).send({ message: 'Erreur mise à jour' });
    res.send({ profileImage: imageUrl });
  });
});


// profil affic
app.post('/Profil', verifyToken, (req, res) => {
   const SQL = 'SELECT username, email, profileImage FROM users WHERE id = ?';
    db.query(SQL, [req.user.id], 
  (err, results) => { if (err || results.length === 0) {
     return res.status(404)
     .send({ message: 'Utilisateur non trouvé' }); } 
     res.send(results[0]) })
});

app.post('/AdminProfil', verifyToken, (req, res) => {
   const SQL = 'SELECT username, email,password  FROM users WHERE role = "admin" ';
    db.query(SQL, [req.user.admin], 
  (err, results) => { if (err || results.length === 0) {
     return res.status(404)
     .send({ message: 'Utilisateur non trouvé' }); } 
     res.send(results[0]) })
});

// inscription
app.post('/Inscription', async (req, res) => {
  const { Username, Email, Password } = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).send({ message: 'Tous les champs sont requis' });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  const role = 'dentiste';
  const status = 'pending'; // Nouveau statut

  const SQL = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
  db.query(SQL, [Username, Email, hashedPassword, role, status], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send({ message: 'Utilisateur ou email déjà utilisé' });
      }
      return res.status(500).send({ message: 'Erreur serveur', error: err });
    }
    res.send({ 
      message: 'Inscription soumise! En attente de validation par l\'administrateur.',
      status: 'pending'
    });
  });
});

// Nouvelle route pour récupérer les inscriptions en attente
app.get('/admin/pending-users', (req, res) => {
  const SQL = 'SELECT id, username, email, created_at FROM users WHERE status = "pending"';
  db.query(SQL, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur serveur', error: err });
    }
    res.send(results);
  });
});

// Nouvelle route pour valider/refuser les inscriptions
app.post('/admin/validate-user', (req, res) => {
  const { userId, action, adminNotes } = req.body; 
  
  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  
  const SQL = 'UPDATE users SET status = ?, admin_notes = ? WHERE id = ?';
  db.query(SQL, [newStatus, adminNotes, userId], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur serveur', error: err });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé' });
    }
    
    res.send({ 
      message: action === 'approve' ? 'Utilisateur approuvé' : 'Utilisateur rejeté',
      status: newStatus
    });
  });
});

// Route pour vérifier le statut de dentiste!
app.get('/user-status/:email', (req, res) => {
  const { email } = req.params;
  
  const SQL = 'SELECT status, admin_notes FROM users WHERE email = ?';
  db.query(SQL, [email], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur serveur', error: err });
    }
    
    if (results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé' });
    }
    
    res.send(results[0]);
  });
});

// connexiom
app.post('/Connexion', (req, res) => {
  const { Username, Password } = req.body;
  const SQL = 'SELECT * FROM users WHERE username = ?';
  
  db.query(SQL, [Username], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(401).send({ message: 'Utilisateur non trouvé' });

    const user = results[0];  
    const match = await bcrypt.compare(Password, user.password);
    
    if (!match) return res.status(401).send({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.send({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null
      }
    });
  });
});

             
//-----------------------CRUD--------------------------------------------


// affichage cod

app.get("/ListeDentistes", (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  db.query(SQL, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
    }
    res.json(result);
  });
});

app.get("/ListeDentiste2", (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  db.query(SQL, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
    }
    res.json(result);
  });
});

app.get("/AdminListe", (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  db.query(SQL, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
    }
    res.json(result);
  });
});

app.post('/Profil', verifyToken, (req, res) => {
  const SQL = `
    SELECT 
      u.username, u.email, u.profileImage,
      p.Nom, p.Prenom, p.Date, p.Lieu, p.genre, p.Adresse,
      p.Contact, p.AutreContact, p.NumOrdre, p.Titre, p.Domaine, p.Region
    FROM users u
    INNER JOIN profil p ON u.id = p.users_id
    WHERE u.id = ?;
  `;
  db.query(SQL, [req.user.id], (err, result) => {
    if (err) return res.status(500).send({ message: "Erreur serveur.", details: err.sqlMessage });
    if (!result[0]) return res.status(404).send({ message: "Profil non trouvé." });

    // renvoie un seul objet
    res.json(result[0]);
  });
});


app.post('/Ajouter', verifyToken, (req, res) => {
  const userId = req.user.id;
  const {
    Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region
  } = req.body;

  if (!Nom || !Prenom || !Date || !Lieu || !genre || !Adresse || !NumOrdre || !Contact || !AutreContact  || !Titre || !Domaine || !Region) {
    return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
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

  db.query(SQL, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Profil déjà existant' });
      }
      return res.status(500).json({ message: 'Erreur lors de l\'ajout', details: err.sqlMessage });
    }
    res.json({ message: 'Profil ajouté avec succès' });
  });
});

app.put('/Modifier/:id', (req, res) => {
  const  Values = {
    nom, prenom, date, lieu, genre,adresse, numordre,
    contact, autreContact, titre, domaine, region
  } = req.body;
  const SQL = `
    UPDATE  profil SET Nom=? ,Prenom=?, Date=?
     Lieu=? , genre=? ,Adresse=? , NumOrdre=?, Contact=?, AutreContact=?, 
           Titre=?, Domaine=?, Region=?, profileImage=?  WHERE id =? `;
    
const id = req.params.id; 
         db.query(SQL, [...Values,id], (err, result) => {
    if (err) 
      return res.status(500).json({ message: 'Erreur de lecture', 
     details: err.sqlMessage });
    if (result.length === 0) 
       return res.status(404).json({ message: 'Profil non trouvé' });
    res.json(result[0]); 
  });
});

// ========== Statistiques

const StatsService = {
  getStatsByField: (db, field) => {
    return new Promise((resolve, reject) => {
      const SQL = `SELECT ${field}, COUNT(*) as count FROM profil GROUP BY ${field}`;
      db.query(SQL, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  getTotalCount: (db) => {
    return new Promise((resolve, reject) => {
      const SQL = "SELECT COUNT(*) as total FROM profil";
      db.query(SQL, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
};

const handleStats = async (res, operation, errorMessage) => {
  try {
    const results = await operation;
    res.json(results);
  } catch (error) {
    console.error(errorMessage, error);
    res.status(500).json({ error: errorMessage, details: error.message });
  }
};

app.get("/Statistiques/region", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField(db, 'Region'),
    "Erreur statistiques régions"
  );
});

app.get("/Statistiques/titre", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField(db, 'Titre'),
    "Erreur statistiques titres"
  );
});

app.get("/Statistiques/domaine", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField(db, 'Domaine'),
    "Erreur statistiques domaines"
  );
});

app.get("/Statistiques/total", async (req, res) => {
  await handleStats(
    res,
    StatsService.getTotalCount(db),
    "Erreur statistiques total"
  );
});

// --------- Mot de passe oublié  ---------

// Route : Demande de réinitialisation (envoie le code par email)
app.post('/mot-passe-oublier', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // On ne dit PAS si l'email existe ou non (sécurité)
      return res.json({ success: true, message: 'Si cet email existe, un code vous a été envoyé.' });
    }

    const user = users[0];

    // Générer code 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.promise().query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [hashedCode, expires, user.id]
    );

    // Envoi email
    const mailOptions = {
      from: '"SourireGuide"',
      to: email,
      subject: 'Code de réinitialisation - SourireGuide',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Voici votre code de validation :</p>
          <h1 style="font-size: 48px; letter-spacing: 10px; background: #f0f0f0; padding: 20px; display: inline-block; border-radius: 10px;">
            ${code}
          </h1>
          <p>Ce code expire dans <strong>10 minutes</strong>.</p>
          <p>Si vous n'avez pas demandé cela, ignorez cet email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Code envoyé avec succès !' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route : Vérifier le code + changer le mot de passe
app.post('/reset-password-with-code', async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND reset_token_expiry > NOW()',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Code expiré ou invalide' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(code, user.reset_token);
    if (!isValid) {
      return res.status(400).json({ error: 'Code incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Mot de passe changé avec succès !' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});