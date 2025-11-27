const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const { sendStatusEmail, transporter } = require('./email');

const router = express.Router();

// Inscription
router.post('/Inscription', async (req, res) => {
  const { Username, Email, Password } = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).send({ message: 'Tous les champs sont requis', alertType: 'warning' });
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const role = 'dentiste';
    const status = 'pending';

    const SQL = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
    const [results] = await db.execute(SQL, [Username, Email, hashedPassword, role, status]);
    
    res.send({ 
      message: 'Inscription soumise! En attente de validation par l\'administrateur.',
      status: 'pending',
      alertType: 'success'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).send({ message: 'Utilisateur ou email déjà utilisé', alertType: 'error' });
    }
    return res.status(500).send({ message: 'Erreur serveur', error: err, alertType: 'error' });
  }
});

// Connexion
router.post('/Connexion', async (req, res) => {
  const { Username, Password } = req.body;
  
  console.log(`🔐 Tentative de connexion pour: ${Username}`);
  
  try {
    const SQL = 'SELECT * FROM users WHERE username = ?';
    const [results] = await db.execute(SQL, [Username]);
    
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
  } catch (err) {
    console.error('❌ Erreur DB connexion:', err);
    return res.status(500).send({ 
      message: 'Erreur serveur',
      alertType: 'error'
    });
  }
});

// Mot de passe oublié
router.post('/mot-passe-oublier', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis', alertType: 'warning' });

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ success: true, message: 'Si cet email existe, un code vous a été envoyé.', alertType: 'info' });
    }

    const user = users[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
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

router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code || code.length !== 6) {
    return res.status(400).json({ error: 'Code invalide ou manquant', alertType: 'warning' });
  }

  try {
    const [users] = await db.execute(
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

router.post('/confirm-new-password', async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas', alertType: 'warning' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères', alertType: 'warning' });
  }

  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Code invalide ou expiré', alertType: 'error' });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Mot de passe changé avec succès !', alertType: 'success' });
  } catch (err) {
    console.error('Erreur changement mot de passe:', err);
    res.status(500).json({ error: 'Erreur serveur', alertType: 'error' });
  }
});

// Profil utilisateur
router.post('/Profil', verifyToken, async (req, res) => {
  try {
    const SQL = 'SELECT username, email, profileImage FROM users WHERE id = ?';
    const [results] = await db.execute(SQL, [req.user.id]);
    
    if (results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' }); 
    } 
    res.send(results[0]);
  } catch (err) {
    res.status(500).send({ message: 'Erreur serveur', alertType: 'error' });
  }
});

module.exports = router;