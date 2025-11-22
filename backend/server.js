// const express = require('express');
// const mysql = require('mysql2');  
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path'); 
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const app = express();

// app.use(express.json());
// app.use(cors());
// app.use('/uploads', express.static('uploads'));   
// const db = mysql.createConnection({
//   user: 'root',
//   host: 'localhost',
//   password: '',
//   database: 'dentiste'
// });

// //verserment du de imae dans le fichier   MULTER
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });
// const JWT_SECRET = 'votre_cle_super_secrete_123';

// //  JWT affectation du donne
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith('Bearer ')) {
//     return res.status(401).send({ message: 'Token manquant' });
//   }

//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).send({ message: 'Token invalide' });
//     req.user = decoded;
//     next();
//   });
// };

// // ---------- Nodemailer (Gmail avec mot de passe d'application) ----------
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, 
//   auth: {
//     user: 'bilarsiah@gmail.com',
//     pass: 'bhri qmhg kolv ekyj' 
//   },
//   tls: { rejectUnauthorized: false } 
// });


// // Vérification que le transporter marche au démarrage
// transporter.verify((error, success) => {
//   if (error) console.error('❌ Erreur SMTP :', error);
//   else console.log('✅ Serveur SMTP prêt');
// });


// app.listen(3002, () => {
//   console.log('Serveur sur http://localhost:3002');
// });

// //---------------------INSCRIPTION------------------------

// //chargement de l'image das un fichier
// app.post('/upload-profile-image', verifyToken, 
//   upload.single('profileImage'), (req, res) => {
//   if (!req.file) return res.status(400).send({ message: 'Aucune image' });

//   const imageUrl = `http://localhost:3002/uploads/${req.file.filename}`;

//   const SQL = 'UPDATE users SET profileImage = ? WHERE id = ?';
//   db.query(SQL, [imageUrl, req.user.id], (err) => {
//     if (err) return res.status(500).send({ message: 'Erreur mise à jour' });
//     res.send({ profileImage: imageUrl });
//   });
// });


// // profil affic
// app.post('/Profil', verifyToken, (req, res) => {
//    const SQL = 'SELECT username, email, profileImage FROM users WHERE id = ?';
//     db.query(SQL, [req.user.id], 
//   (err, results) => { if (err || results.length === 0) {
//      return res.status(404)
//      .send({ message: 'Utilisateur non trouvé' }); } 
//      res.send(results[0]) })
// });

// app.post('/AdminProfil', verifyToken, (req, res) => {
//    const SQL = 'SELECT username, email,password  FROM users WHERE role = "admin" ';
//     db.query(SQL, [req.user.admin], 
//   (err, results) => { if (err || results.length === 0) {
//      return res.status(404)
//      .send({ message: 'Utilisateur non trouvé' }); } 
//      res.send(results[0]) })
// });

// // inscription
// app.post('/Inscription', async (req, res) => {
//   const { Username, Email, Password } = req.body;

//   if (!Username || !Email || !Password) {
//     return res.status(400).send({ message: 'Tous les champs sont requis' });
//   }

//   const hashedPassword = await bcrypt.hash(Password, 10);
//   const role = 'dentiste';
//   const status = 'pending'; // Nouveau statut

//   const SQL = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
//   db.query(SQL, [Username, Email, hashedPassword, role, status], (err, results) => {
//     if (err) {
//       if (err.code === 'ER_DUP_ENTRY') {
//         return res.status(400).send({ message: 'Utilisateur ou email déjà utilisé' });
//       }
//       return res.status(500).send({ message: 'Erreur serveur', error: err });
//     }
//     res.send({ 
//       message: 'Inscription soumise! En attente de validation par l\'administrateur.',
//       status: 'pending'
//     });
//   });
// });


// app.get('/admin/pending-users', (req, res) => {
//   const SQL = 'SELECT id, username, email, created_at FROM users WHERE status = "pending" AND role = "dentiste"';
//   db.query(SQL, (err, results) => {
//     if (err) {
//       console.error('Erreur DB:', err);
//       return res.status(500).send({ message: 'Erreur serveur', error: err });
//     }
//     res.send(results);
//   });
// });

// // Nouvelle route pour valider/refuser les inscriptions
// app.post('/admin/validate-user', (req, res) => {
//   const { userId, action, adminNotes } = req.body; 
  
//   // Validation des données
//   if (!userId || !action) {
//     return res.status(400).send({ message: 'Données manquantes' });
//   }
  
//   if (!['approve', 'reject'].includes(action)) {
//     return res.status(400).send({ message: 'Action non valide' });
//   }
  
//   const newStatus = action === 'approve' ? 'approved' : 'rejected';
  
//   const SQL = 'UPDATE users SET status = ?, admin_notes = ? WHERE id = ? AND status = "pending"';
//   db.query(SQL, [newStatus, adminNotes, userId], (err, results) => {
//     if (err) {
//       console.error('Erreur DB validation:', err);
//       return res.status(500).send({ message: 'Erreur serveur', error: err });
//     }
    
//     if (results.affectedRows === 0) {
//       return res.status(404).send({ message: 'Utilisateur non trouvé ou déjà traité' });
//     }
    
//     res.send({ 
//       message: action === 'approve' ? 'Utilisateur approuvé avec succès' : 'Utilisateur rejeté',
//       status: newStatus
//     });
//   });
// });

// // Route pour vérifier le statut de dentiste!
// app.get('/user-status/:email', (req, res) => {
//   const { email } = req.params;
  
//   const SQL = 'SELECT status, admin_notes FROM users WHERE email = ?';
//   db.query(SQL, [email], (err, results) => {
//     if (err) {
//       return res.status(500).send({ message: 'Erreur serveur', error: err });
//     }
    
//     if (results.length === 0) {
//       return res.status(404).send({ message: 'Utilisateur non trouvé' });
//     }
    
//     res.send(results[0]);
//   });
// });


// // connexiom
// app.post('/Connexion', (req, res) => {
//   const { Username, Password } = req.body;
//   const SQL = 'SELECT * FROM users WHERE username = ?';
  
//   db.query(SQL, [Username], async (err, results) => {
//     if (err) return res.status(500).send({ message: 'Erreur serveur' });
//     if (results.length === 0) return res.status(401).send({ message: 'Utilisateur non trouvé' });

//     const user = results[0];  
//     const match = await bcrypt.compare(Password, user.password);
    
//     if (!match) return res.status(401).send({ message: 'Mot de passe incorrect' });

//     // VÉRIFICATION DU STATUT
//     if (user.status === 'pending') {
//       return res.status(403).send({ 
//         message: 'Votre inscription est en attente de validation par l\'administrateur. Vous serez notifié par email une fois approuvé.' 
//       });
//     }
    
//     if (user.status === 'rejected') {
//       return res.status(403).send({ 
//         message: `Votre inscription a été refusée. ${user.admin_notes ? 'Raison: ' + user.admin_notes : ''}` 
//       });
//     }

//     // Seulement les utilisateurs "approved" peuvent se connecter
//     const token = jwt.sign(
//       { id: user.id, username: user.username, email: user.email },
//       JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.send({
//       message: 'Connexion réussie',
//       token,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         profileImage: user.profileImage || null,
//         status: user.status
//       }
//     });
//   });
// });
 
// //-----------------------CRUD--------------------------------------------

// // affichage cod
// app.get("/ListeDentistes", (req, res) => {
//   const { region } = req.query;

//   let SQL = `
//     SELECT 
//       p.Nom, p.Prenom, p.genre, p.Adresse, 
//       p.NumOrdre, p.Titre, p.Domaine, p.Region,
//       u.email, u.profileImage
//     FROM profil p
//     INNER JOIN users u ON p.users_id = u.id
//   `;

//   const params = [];

//   if (region && region.trim() !== "") {
//     SQL += " WHERE p.Region = ?";
//     params.push(region);
//   }

//   db.query(SQL, params, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
//     }
//     res.json(result);
//   });
// });

// app.get("/ListeDentiste2", (req, res) => {
//   const { region } = req.query;

//   let SQL = `
//     SELECT 
//       p.Nom, p.Prenom, p.genre, p.Adresse, 
//       p.NumOrdre, p.Titre, p.Domaine, p.Region,
//       u.email, u.profileImage
//     FROM profil p
//     INNER JOIN users u ON p.users_id = u.id
//   `;

//   const params = [];

//   if (region && region.trim() !== "") {
//     SQL += " WHERE p.Region = ?";
//     params.push(region);
//   }

//   db.query(SQL, params, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
//     }
//     res.json(result);
//   });
// });

// app.get("/AdminListe", (req, res) => {
//   const { region } = req.query;

//   let SQL = `
//     SELECT 
//       p.Nom, p.Prenom, p.genre, p.Adresse, 
//       p.NumOrdre, p.Titre, p.Domaine, p.Region,
//       u.email, u.profileImage
//     FROM profil p
//     INNER JOIN users u ON p.users_id = u.id
//   `;

//   const params = [];

//   if (region && region.trim() !== "") {
//     SQL += " WHERE p.Region = ?";
//     params.push(region);
//   }

//   db.query(SQL, params, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
//     }
//     res.json(result);
//   });
// });

// app.post('/Profil', verifyToken, (req, res) => {
//   const SQL = `
//     SELECT 
//       u.username, u.email, u.profileImage,
//       p.Nom, p.Prenom, p.Date, p.Lieu, p.genre, p.Adresse,
//       p.Contact, p.AutreContact, p.NumOrdre, p.Titre, p.Domaine, p.Region
//     FROM users u
//     INNER JOIN profil p ON u.id = p.users_id
//     WHERE u.id = ?;
//   `;
//   db.query(SQL, [req.user.id], (err, result) => {
//     if (err) return res.status(500).send({ message: "Erreur serveur.", details: err.sqlMessage });
//     if (!result[0]) return res.status(404).send({ message: "Profil non trouvé." });

//     // renvoie un seul objet
//     res.json(result[0]);
//   });
// });


// app.post('/Ajouter', verifyToken, (req, res) => {
//   const userId = req.user.id;
//   const {
//     Nom, Prenom, Date, Lieu, genre, Adresse,
//     NumOrdre, Contact, AutreContact, Titre, Domaine, Region
//   } = req.body;

//   if (!Nom || !Prenom || !Date || !Lieu || !genre || !Adresse || !NumOrdre || !Contact || !AutreContact  || !Titre || !Domaine || !Region) {
//     return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
//   }

//   const SQL = `
//     INSERT INTO profil (
//       users_id, Nom, Prenom, Date, Lieu, genre, Adresse,
//       NumOrdre, Contact, AutreContact, Titre, Domaine, Region
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const values = [
//     userId, Nom, Prenom, Date, Lieu, genre, Adresse,
//     NumOrdre, Contact, AutreContact, Titre, Domaine, Region
//   ];

//   db.query(SQL, values, (err, result) => {
//     if (err) {
//       if (err.code === 'ER_DUP_ENTRY') {
//         return res.status(400).json({ message: 'Profil déjà existant' });
//       }
//       return res.status(500).json({ message: 'Erreur lors de l\'ajout', details: err.sqlMessage });
//     }
//     res.json({ message: 'Profil ajouté avec succès' });
//   });
// });

// app.put('/Modifier/:id', verifyToken, (req, res) => {  // j’ai ajouté verifyToken, tu l’utiliseras sûrement
//   const userId = req.user.id; // si tu veux vérifier que c’est son propre profil

//   const {
//     Nom, Prenom, Date, Lieu, genre, Adresse,
//     NumOrdre, Contact, AutreContact, Titre, Domaine, Region, profileImage
//   } = req.body;

//   const profilId = req.params.id;

//   const SQL = `
//     UPDATE profil 
//     SET Nom = ?, Prenom = ?, Date = ?, Lieu = ?, genre = ?, Adresse = ?,
//         NumOrdre = ?, Contact = ?, AutreContact = ?, Titre = ?, Domaine = ?, Region = ?, profileImage = ?
//     WHERE id = ? AND users_id = ?`;  // sécurité : on modifie seulement son propre profil

//   const values = [
//     Nom, Prenom, Date, Lieu, genre, Adresse,
//     NumOrdre, Contact, AutreContact, Titre, Domaine, Region, profileImage,
//     profilId, userId
//   ];

//   db.query(SQL, values, (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Erreur lors de la modification', details: err.sqlMessage });
//     }

//     // result.affectedRows === 0 → aucun profil mis à jour
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Profil non trouvé ou vous n\'êtes pas autorisé à le modifier' });
//     }

//     res.json({ message: 'Profil mis à jour avec succès' });
//   });
// });
// // ========== Statistiques

// const StatsService = {
//   getStatsByField: (db, field) => {
//     return new Promise((resolve, reject) => {
//       const SQL = `SELECT ${field}, COUNT(*) as count FROM profil GROUP BY ${field}`;
//       db.query(SQL, (err, results) => {
//         if (err) reject(err);
//         else resolve(results);
//       });
//     });
//   },

//   getTotalCount: (db) => {
//     return new Promise((resolve, reject) => {
//       const SQL = "SELECT COUNT(*) as total FROM profil";
//       db.query(SQL, (err, results) => {
//         if (err) reject(err);
//         else resolve(results[0]);
//       });
//     });
//   }
// };

// const handleStats = async (res, operation, errorMessage) => {
//   try {
//     const results = await operation;
//     res.json(results);
//   } catch (error) {
//     console.error(errorMessage, error);
//     res.status(500).json({ error: errorMessage, details: error.message });
//   }
// };

// app.get("/Statistiques/region", async (req, res) => {
//   await handleStats(
//     res,
//     StatsService.getStatsByField(db, 'Region'),
//     "Erreur statistiques régions"
//   );
// });

// app.get("/Statistiques/titre", async (req, res) => {
//   await handleStats(
//     res,
//     StatsService.getStatsByField(db, 'Titre'),
//     "Erreur statistiques titres"
//   );
// });

// app.get("/Statistiques/domaine", async (req, res) => {
//   await handleStats(
//     res,
//     StatsService.getStatsByField(db, 'Domaine'),
//     "Erreur statistiques domaines"
//   );
// });

// app.get("/Statistiques/total", async (req, res) => {
//   await handleStats(
//     res,
//     StatsService.getTotalCount(db),
//     "Erreur statistiques total"
//   );
// });

// // --------- Mot de passe oublié  ---------
// app.post('/mot-passe-oublier', async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ error: 'Email requis' });

//   try {
//     const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
//     if (users.length === 0) {
//       return res.json({ success: true, message: 'Si cet email existe, un code vous a été envoyé.' });
//     }

//     const user = users[0];
//     const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
//     const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // ON STOCKE LE CODE EN CLAIR (PAS DE BCRYPT !)
//     await db.promise().query(
//       'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
//       [code, expires, user.id]
//     );

//     await transporter.sendMail({
//       from: '"SourireGuide" <bilarsiah@gmail.com>',
//       to: email,
//       subject: 'Code de réinitialisation - SourireGuide',
//       html: `<h1 style="font-size:48px; letter-spacing:10px;">${code}</h1><p>Valable 10 minutes.</p>`
//     });

//     res.json({ success: true, message: 'Code envoyé avec succès !' });
//   } catch (err) {
//     console.error('Erreur envoi code:', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });

// app.post('/verify-reset-code', async (req, res) => {
//   const { email, code } = req.body;

//   if (!email || !code || code.length !== 6) {
//     return res.status(400).json({ error: 'Code invalide ou manquant' });
//   }

//   try {
//     const [users] = await db.promise().query(
//       'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
//       [email, code] // comparaison directe en clair
//     );

//     if (users.length === 0) {
//       return res.status(400).json({ error: 'Code incorrect ou expiré' });
//     }

//     res.json({ success: true, message: 'Code validé avec succès !' });
//   } catch (err) {
//     console.error('Erreur vérification code:', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });

// app.post('/confirm-new-password', async (req, res) => {
//   const { email, code, newPassword, confirmPassword } = req.body;

//   if (newPassword !== confirmPassword) {
//     return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
//   }
//   if (newPassword.length < 6) {
//     return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
//   }

//   try {
//     const [users] = await db.promise().query(
//       'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
//       [email, code]
//     );

//     if (users.length === 0) {
//       return res.status(400).json({ error: 'Code invalide ou expiré' });
//     }

//     const user = users[0];
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await db.promise().query(
//       'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
//       [hashedPassword, user.id]
//     );

//     res.json({ success: true, message: 'Mot de passe changé avec succès !' });
//   } catch (err) {
//     console.error('Erreur changement mot de passe:', err);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });




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
    return res.status(401).send({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Token invalide' });
    req.user = decoded;
    next();
  });
};

// Configuration Nodemailer
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
    let subject, html;

    if (status === 'approved') {
      subject = 'Félicitations ! Votre inscription a été approuvée - SourireGuide';
      html = `
        <h2>Bonne nouvelle ! 🎉</h2>
        <p>Votre inscription sur SourireGuide a été <strong>approuvée</strong>.</p>
        <p>Vous pouvez maintenant vous connecter à votre compte et compléter votre profil.</p>
        <a href="http://localhost:3000/connexion" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Se connecter
        </a>
        ${adminNotes ? `<p><strong>Note de l'administrateur:</strong> ${adminNotes}</p>` : ''}
      `;
    } else {
      subject = 'Mise à jour de votre inscription - SourireGuide';
      html = `
        <h2>Mise à jour de votre inscription</h2>
        <p>Votre inscription sur SourireGuide a été <strong>refusée</strong>.</p>
        ${adminNotes ? `<p><strong>Raison:</strong> ${adminNotes}</p>` : '<p>Veuillez contacter l\'administration pour plus d\'informations.</p>'}
        <p>Vous pouvez soumettre une nouvelle inscription avec des informations complémentaires.</p>
        <a href="http://localhost:3000/inscription" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Nouvelle inscription
        </a>
      `;
    }

    await transporter.sendMail({
      from: '"SourireGuide" <bilarsiah@gmail.com>',
      to: userEmail,
      subject: subject,
      html: html
    });

    console.log(`Email de statut envoyé à: ${userEmail}`);
  } catch (error) {
    console.error('Erreur envoi email:', error);
  }
};

//--------------------- ROUTES ------------------------

// Upload image de profil
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

// Profil utilisateur
app.post('/Profil', verifyToken, (req, res) => {
   const SQL = 'SELECT username, email, profileImage FROM users WHERE id = ?';
    db.query(SQL, [req.user.id], 
  (err, results) => { 
    if (err || results.length === 0) {
     return res.status(404).send({ message: 'Utilisateur non trouvé' }); 
    } 
    res.send(results[0]) 
  });
});

// Profil admin
app.post('/AdminProfil', verifyToken, (req, res) => {
   const SQL = 'SELECT username, email, password FROM users WHERE role = "admin" ';
    db.query(SQL, [req.user.admin], 
  (err, results) => { 
    if (err || results.length === 0) {
     return res.status(404).send({ message: 'Utilisateur non trouvé' }); 
    } 
    res.send(results[0]) 
  });
});

// Inscription
app.post('/Inscription', async (req, res) => {
  const { Username, Email, Password } = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).send({ message: 'Tous les champs sont requis' });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  const role = 'dentiste';
  const status = 'pending';

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

// Récupérer les utilisateurs en attente
app.get('/admin/pending-users', (req, res) => {
  const SQL = 'SELECT id, username, email, created_at FROM users WHERE status = "pending" AND role = "dentiste"';
  db.query(SQL, (err, results) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).send({ message: 'Erreur serveur', error: err });
    }
    res.send(results);
  });
});

// Valider/refuser les inscriptions
app.post('/admin/validate-user', async (req, res) => {
  const { userId, action, adminNotes } = req.body; 
  
  if (!userId || !action) {
    return res.status(400).send({ message: 'Données manquantes' });
  }
  
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).send({ message: 'Action non valide' });
  }
  
  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  
  try {
    // Récupérer l'email de l'utilisateur
    const [userResults] = await db.promise().query(
      'SELECT email FROM users WHERE id = ? AND status = "pending"',
      [userId]
    );
    
    if (userResults.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé ou déjà traité' });
    }
    
    const userEmail = userResults[0].email;
    
    // Mettre à jour le statut
    const SQL = 'UPDATE users SET status = ?, admin_notes = ? WHERE id = ? AND status = "pending"';
    const [results] = await db.promise().query(SQL, [newStatus, adminNotes, userId]);
    
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé ou déjà traité' });
    }
    
    // Envoyer l'email de notification
    await sendStatusEmail(userEmail, newStatus, adminNotes);
    
    res.send({ 
      message: action === 'approve' ? 'Utilisateur approuvé avec succès' : 'Utilisateur rejeté',
      status: newStatus
    });
  } catch (err) {
    console.error('Erreur DB validation:', err);
    return res.status(500).send({ message: 'Erreur serveur', error: err });
  }
});

// Vérifier le statut d'un utilisateur
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

// Connexion - CORRIGÉE avec vérification du statut
app.post('/Connexion', (req, res) => {
  const { Username, Password } = req.body;
  const SQL = 'SELECT * FROM users WHERE username = ?';
  
  db.query(SQL, [Username], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(401).send({ message: 'Utilisateur non trouvé' });

    const user = results[0];  
    const match = await bcrypt.compare(Password, user.password);
    
    if (!match) return res.status(401).send({ message: 'Mot de passe incorrect' });

    // VÉRIFICATION DU STATUT - CORRECTION
    if (user.status === 'pending') {
      return res.status(403).send({ 
        message: 'Votre inscription est en attente de validation par l\'administrateur. Vous serez notifié par email une fois approuvé.' 
      });
    }
    
    if (user.status === 'rejected') {
      return res.status(403).send({ 
        message: `Votre inscription a été refusée. ${user.admin_notes ? 'Raison: ' + user.admin_notes : ''}` 
      });
    }

    // Seulement les utilisateurs "approved" peuvent se connecter
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
        profileImage: user.profileImage || null,
        status: user.status
      }
    });
  });
});

// Routes CRUD existantes...
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
      return res.status(500).json({ message: 'Erreur lors de la modification', details: err.sqlMessage });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profil non trouvé ou vous n\'êtes pas autorisé à le modifier' });
    }

    res.json({ message: 'Profil mis à jour avec succès' });
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

// Mot de passe oublié
app.post('/mot-passe-oublier', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ success: true, message: 'Si cet email existe, un code vous a été envoyé.' });
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

    res.json({ success: true, message: 'Code envoyé avec succès !' });
  } catch (err) {
    console.error('Erreur envoi code:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code || code.length !== 6) {
    return res.status(400).json({ error: 'Code invalide ou manquant' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Code incorrect ou expiré' });
    }

    res.json({ success: true, message: 'Code validé avec succès !' });
  } catch (err) {
    console.error('Erreur vérification code:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/confirm-new-password', async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Mot de passe changé avec succès !' });
  } catch (err) {
    console.error('Erreur changement mot de passe:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(3002, () => {
  console.log('Serveur sur http://localhost:3002');
});