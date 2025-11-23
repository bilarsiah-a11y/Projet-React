const express = require('express');
const mysql = require('mysql2');  
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path'); 

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
const JWT_SECRET = 'votre_cle_super_secrete_123';

// Middleware JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token manquant', alertType: 'error' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Token invalide', alertType: 'error' });
    req.user = decoded;
    next();
  });
};

// Connexion a email : Nodemailer
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

// Vérification du transporter
transporter.verify((error, success) => {
  if (error) console.error('❌ Erreur SMTP :', error);
  else console.log('✅ Serveur SMTP prêt');
});

// Fonction pour envoyer des emails de notification 
const sendStatusEmail = async (userEmail, status, adminNotes = '') => {
  try {
    console.log(`📧 Tentative d'envoi d'email à: ${userEmail}, statut: ${status}`);
    
    let subject, html;

    if (status === 'approved') {
      subject = 'Félicitations ! Votre inscription a été approuvée - SourireGuide';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00bcd4;">Bonne nouvelle ! 🎉</h2>
          <p>Votre inscription sur SourireGuide a été <strong style="color: green;">approuvée</strong>.</p>
          <p>Vous pouvez maintenant vous connecter à votre compte et compléter votre profil.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:3000/connexion" 
               style="background: #00bcd4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Se connecter
            </a>
          </div>
          ${adminNotes ? `<p><strong>Note de l'administrateur:</strong> ${adminNotes}</p>` : ''}
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      `;
    } else {
      subject = 'Mise à jour de votre inscription - SourireGuide';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Mise à jour de votre inscription</h2>
          <p>Votre inscription sur SourireGuide a été <strong style="color: red;">refusée</strong>.</p>
          ${adminNotes ? `<p><strong>Raison:</strong> ${adminNotes}</p>` : '<p>Veuillez contacter l\'administration pour plus d\'informations.</p>'}
          <p>Vous pouvez soumettre une nouvelle inscription avec des informations complémentaires.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:3000/inscription" 
               style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Nouvelle inscription
            </a>
          </div>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: '"SourireGuide"',
      to: userEmail,
      subject: subject,
      html: html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès à: ${userEmail}, Message ID: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur détaillée envoi email:', error);
    if (error.response) {
      console.error('🔍 Réponse SMTP:', error.response);
    }
    return false;
  }
};

//--------------------- ROUTES ------------------------

// Upload image de profil
app.post('/upload-profile-image', verifyToken, 
  upload.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'Aucune image', alertType: 'error' });

  const imageUrl = `http://localhost:3002/uploads/${req.file.filename}`;

  const SQL = 'UPDATE users SET profileImage = ? WHERE id = ?';
  db.query(SQL, [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).send({ message: 'Erreur mise à jour', alertType: 'error' });
    res.send({ profileImage: imageUrl, message: 'Image mise à jour avec succès', alertType: 'success' });
  });
});

// Profil utilisateur
app.post('/Profil', verifyToken, (req, res) => {
  const SQL = 'SELECT username, email, profileImage FROM users WHERE id = ?';
  db.query(SQL, [req.user.id], (err, results) => { 
    if (err || results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' }); 
    } 
    res.send(results[0]);
  });
});

// Profil admin
app.post('/AdminProfil', verifyToken, (req, res) => {
  const SQL = 'SELECT username, email, password FROM users WHERE role = "admin" ';
  db.query(SQL, (err, results) => { 
    if (err || results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' }); 
    } 
    res.send(results[0]);
  });
});

// Inscription
app.post('/Inscription', async (req, res) => {
  const { Username, Email, Password } = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).send({ message: 'Tous les champs sont requis', alertType: 'warning' });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  const role = 'dentiste';
  const status = 'pending';

  const SQL = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
  db.query(SQL, [Username, Email, hashedPassword, role, status], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send({ message: 'Utilisateur ou email déjà utilisé', alertType: 'error' });
      }
      return res.status(500).send({ message: 'Erreur serveur', error: err, alertType: 'error' });
    }
    res.send({ 
      message: 'Inscription soumise! En attente de validation par l\'administrateur.',
      status: 'pending',
      alertType: 'success'
    });
  });
});

// Récupérer les utilisateurs en attente
app.get('/admin/pending-users', (req, res) => {
  const SQL = 'SELECT id, username, email, created_at FROM users WHERE status = "pending" AND role = "dentiste"';
  db.query(SQL, (err, results) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).send({ message: 'Erreur serveur', error: err, alertType: 'error' });
    }
    res.send(results);
  });
});

// Route de test pour les emails
app.post('/test-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    const testEmail = await sendStatusEmail(email, 'approved', 'Ceci est un test');
    if (testEmail) {
      res.send({ message: 'Email de test envoyé avec succès', alertType: 'success' });
    } else {
      res.status(500).send({ message: 'Échec envoi email de test', alertType: 'error' });
    }
  } catch (error) {
    console.error('Erreur test email:', error);
    res.status(500).send({ message: 'Erreur test email', error: error.message, alertType: 'error' });
  }
});

// Valider/refuser les inscriptions 
app.post('/admin/validate-user', async (req, res) => {
  const { userId, action, adminNotes } = req.body; 
  
  console.log(`🛠️ Action admin: ${action} pour user: ${userId}`);
  
  if (!userId || !action) {
    return res.status(400).send({ message: 'Données manquantes', alertType: 'error' });
  }
  
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).send({ message: 'Action non valide', alertType: 'error' });
  }
  
  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  
  try {
    const [userResults] = await db.promise().query(
      'SELECT email, username, status FROM users WHERE id = ?',
      [userId]
    );
    
    if (userResults.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' });
    }
    
    const user = userResults[0];
    console.log(`👤 Utilisateur trouvé: ${user.username}, Statut actuel: ${user.status}`);
    
    if (user.status !== 'pending') {
      return res.status(400).send({ 
        message: `Cet utilisateur a déjà été traité (statut: ${user.status})`,
        alertType: 'warning'
      });
    }
    
    const SQL = 'UPDATE users SET status = ?, admin_notes = ? WHERE id = ?';
    const [results] = await db.promise().query(SQL, [newStatus, adminNotes, userId]);
    
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: 'Échec de la mise à jour', alertType: 'error' });
    }
    
    console.log(`✅ Statut mis à jour: ${user.email} -> ${newStatus}`);
    
    const emailSent = await sendStatusEmail(user.email, newStatus, adminNotes);
    
    if (!emailSent) {
      console.warn('⚠️ Email non envoyé mais statut mis à jour');
      return res.send({ 
        message: action === 'approve' ? 'Utilisateur approuvé mais email non envoyé' : 'Utilisateur rejeté mais email non envoyé',
        status: newStatus,
        warning: 'Email non envoyé',
        alertType: 'warning'
      });
    }
    
    res.send({ 
      message: action === 'approve' ? 'Utilisateur approuvé avec succès' : 'Utilisateur rejeté avec succès',
      status: newStatus,
      alertType: 'success'
    });
    
  } catch (err) {
    console.error('❌ Erreur DB validation:', err);
    return res.status(500).send({ message: 'Erreur serveur', error: err.message, alertType: 'error' });
  }
});

// Vérifier le statut d'un utilisateur
app.get('/user-status/:email', (req, res) => {
  const { email } = req.params;
  
  const SQL = 'SELECT status, admin_notes FROM users WHERE email = ?';
  db.query(SQL, [email], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur serveur', error: err, alertType: 'error' });
    }
    
    if (results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' });
    }
    
    res.send(results[0]);
  });
});

// Connexion
app.post('/Connexion', (req, res) => {
  const { Username, Password } = req.body;
  
  console.log(`🔐 Tentative de connexion pour: ${Username}`);
  
  const SQL = 'SELECT * FROM users WHERE username = ?';
  
  db.query(SQL, [Username], async (err, results) => {
    if (err) {
      console.error('❌ Erreur DB connexion:', err);
      return res.status(500).send({ 
        message: 'Erreur serveur',
        alertType: 'error'
      });
    }
    
    if (results.length === 0) {
      console.log('❌ Utilisateur non trouvé:', Username);
      return res.status(401).send({ 
        message: 'Utilisateur non trouvé',
        alertType: 'error'
      });
    }

    const user = results[0];  
    console.log(`👤 Utilisateur trouvé: ${user.username}, Statut: ${user.status}, Role: ${user.role}`);
    
    const match = await bcrypt.compare(Password, user.password);
    
    if (!match) {
      console.log('❌ Mot de passe incorrect pour:', Username);
      return res.status(401).send({ 
        message: 'Mot de passe incorrect',
        alertType: 'error'
      });
    }

    console.log(`📊 Vérification statut: ${user.status}`);
    
    if (user.status === 'pending') {
      console.log('⏳ Connexion bloquée - statut pending:', Username);
      return res.status(403).send({ 
        message: 'Votre inscription est en attente de validation par l\'administrateur. Vous serez notifié par email une fois approuvé.',
        alertType: 'warning'
      });
    }
    
    if (user.status === 'rejected') {
      console.log('🚫 Connexion bloquée - statut rejected:', Username);
      return res.status(403).send({ 
        message: `Votre inscription a été refusée. ${user.admin_notes ? 'Raison: ' + user.admin_notes : 'Veuillez contacter l\'administration pour plus d\'informations.'}`,
        alertType: 'error'
      });
    }

    if (user.status !== 'approved') {
      console.log('🚫 Statut non autorisé:', user.status, 'pour:', Username);
      return res.status(403).send({ 
        message: 'Votre compte n\'est pas autorisé à se connecter. Statut: ' + user.status,
        alertType: 'error'
      });
    }

    console.log('✅ Connexion autorisée pour:', Username);
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        status: user.status
      },
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
        profileImage: user.profileImage || null,
        status: user.status
      },
      alertType: 'success'
    });
  });
});

//  CRUD 
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
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage, alertType: 'error' });
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
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage, alertType: 'error' });
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
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage, alertType: 'error' });
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
    if (err) return res.status(500).send({ message: "Erreur serveur.", details: err.sqlMessage, alertType: 'error' });
    if (!result[0]) return res.status(404).send({ message: "Profil non trouvé.", alertType: 'error' });
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

  db.query(SQL, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Profil déjà existant', alertType: 'error' });
      }
      return res.status(500).json({ message: 'Erreur lors de l\'ajout', details: err.sqlMessage, alertType: 'error' });
    }
    res.json({ message: 'Profil ajouté avec succès', alertType: 'success' });
  });
});

app.put('/Modifier/:id', verifyToken, (req, res) => {
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

  db.query(SQL, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la modification', details: err.sqlMessage, alertType: 'error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profil non trouvé ou vous n\'êtes pas autorisé à le modifier', alertType: 'error' });
    }

    res.json({ message: 'Profil mis à jour avec succès', alertType: 'success' });
  });
});

// Statistiques
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
    res.status(500).json({ error: errorMessage, details: error.message, alertType: 'error' });
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

// Mot de passe oublié
app.post('/mot-passe-oublier', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis', alertType: 'warning' });

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ success: true, message: 'Si cet email existe, un code vous a été envoyé.', alertType: 'info' });
    }

    const user = users[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.promise().query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [code, expires, user.id]
    );

    await transporter.sendMail({
      from: '"SourireGuide" <bilarsiah@gmail.com>',
      to: email,
      subject: 'Code de réinitialisation - SourireGuide',
      html: `<h1 style="font-size:48px; letter-spacing:10px;">${code}</h1><p>Valable 10 minutes.</p>`
    });

    res.json({ success: true, message: 'Code envoyé avec succès !', alertType: 'success' });
  } catch (err) {
    console.error('Erreur envoi code:', err);
    res.status(500).json({ error: 'Erreur serveur', alertType: 'error' });
  }
});

app.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code || code.length !== 6) {
    return res.status(400).json({ error: 'Code invalide ou manquant', alertType: 'warning' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Code incorrect ou expiré', alertType: 'error' });
    }

    res.json({ success: true, message: 'Code validé avec succès !', alertType: 'success' });
  } catch (err) {
    console.error('Erreur vérification code:', err);
    res.status(500).json({ error: 'Erreur serveur', alertType: 'error' });
  }
});

app.post('/confirm-new-password', async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas', alertType: 'warning' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères', alertType: 'warning' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré', alertType: 'error' });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Mot de passe changé avec succès !', alertType: 'success' });
  } catch (err) {
    console.error('Erreur changement mot de passe:', err);
    res.status(500).json({ error: 'Erreur serveur', alertType: 'error' });
  }
});


/// Accueil admin

app.get("/admin/stats", (req, res) => {
    const totalQuery = `SELECT COUNT(*) AS total FROM users WHERE role='dentiste'`;
    const pendingQuery = `SELECT COUNT(*) AS pending FROM users WHERE status='pending' AND role='dentiste'`;
    const verifiedQuery = `SELECT COUNT(*) AS verified FROM users WHERE status='approved' AND role='dentiste'`;
    const regionQuery = `SELECT COUNT(DISTINCT Region) AS regions FROM profile`;

    db.query(totalQuery, (err, totalResult) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(pendingQuery, (err, pendingResult) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(verifiedQuery, (err, verifiedResult) => {
                if (err) return res.status(500).json({ error: err.message });
                db.query(regionQuery, (err, regionResult) => {
                    if (err) return res.status(500).json({ error: err.message });
                    return res.json({
                        totalDentistes: totalResult[0].total,
                        pending: pendingResult[0].pending,
                        verified: verifiedResult[0].verified,
                        regions: regionResult[0].regions,
                        totalRegions: 22,
                    });
                });
            });
        });
    });
});

// ROUTE RECENT
app.get("/admin/recent", (req, res) => {
    const sql = `
        SELECT 
            profile.Nom, 
            profile.Prenom, 
            profile.Region,
            users.created_at
        FROM profile
        INNER JOIN users ON profile.users_id = users.id
        WHERE users.role = 'dentiste'
        ORDER BY users.created_at DESC
        LIMIT 5
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(result);
    });
});

app.listen(3002, () => {
  console.log('Serveur sur http://localhost:3002');
});