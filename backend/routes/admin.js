const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const { sendStatusEmail } = require('./email');

const router = express.Router();

// Middleware d'authentification (identique à verifyToken)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, 'votre_cle_secrete', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Supprimer dentiste - VERSION CORRIGÉE
router.delete("/admin/delete/:profilId/:userId", async (req, res) => {
  const { profilId, userId } = req.params;

  if (!profilId) {
    return res.status(400).json({ error: "profilId manquant" });
  }
  
  const actualUserId = userId === 'null' ? null : userId;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    await connection.execute("DELETE FROM profil WHERE id = ?", [profilId]);
    
    if (actualUserId) {
      await connection.execute("DELETE FROM users WHERE id = ?", [actualUserId]);
    }

    await connection.commit();
    res.json({ message: "Dentiste supprimé avec succès" });
  } catch (err) {
    await connection.rollback();
    console.error("Erreur suppression:", err);
    res.status(500).json({ error: "Impossible de supprimer" });
  } finally {
    connection.release();
  }
});

router.get("/AdminListe", async (req, res) => {
  const { region } = req.query;

  if (!region) {
    return res.status(400).json({ error: "Région manquante" });
  }

  try {
    const connection = await db.getConnection();

    const [rows] = await connection.query(`
      SELECT 
        profil.id              AS profilId,
        users.id               AS userId,
        profil.Nom,
        profil.Prenom,
        profil.genre,
        profil.Adresse,
        profil.NumOrdre,
        profil.Contact,
        profil.AutreContact,
        profil.Titre,
        profil.Domaine,
        profil.Lieu,
        profil.Region,
        users.profileImage
      FROM profil
      LEFT JOIN users ON profil.users_id = users.id
      WHERE profil.Region = ?
      ORDER BY profil.Nom ASC, profil.Prenom ASC
    `, [region]);

    connection.release();

    console.log(`AdminListe → ${rows.length} dentistes trouvés pour la région "${region}"`);
    res.json(rows);

  } catch (err) {
    console.error("Erreur AdminListe:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer les utilisateurs en attente
router.get('/admin/pending-users', async (req, res) => {
  try {
    const SQL = 'SELECT id, username, email, created_at FROM users WHERE status = "pending" AND role = "dentiste"';
    const [results] = await db.execute(SQL);
    res.send(results);
  } catch (err) {
    console.error('Erreur DB:', err);
    res.status(500).send({ message: 'Erreur serveur', error: err, alertType: 'error' });
  }
});

// Valider/refuser les inscriptions
router.post('/admin/validate-user', async (req, res) => {
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
    const [userResults] = await db.execute(
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
    const [results] = await db.execute(SQL, [newStatus, adminNotes, userId]);
    
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
router.get('/user-status/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const SQL = 'SELECT status, admin_notes FROM users WHERE email = ?';
    const [results] = await db.execute(SQL, [email]);
    
    if (results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' });
    }
    
    res.send(results[0]);
  } catch (err) {
    res.status(500).send({ message: 'Erreur serveur', error: err, alertType: 'error' });
  }
});

// Route de test pour les emails
router.post('/test-email', async (req, res) => {
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

// Profil admin - CORRIGÉ
router.post('/AdminProfil', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté
    const SQL = 'SELECT id, username, email, password, profileImage FROM users WHERE id = ?';
    const [results] = await db.execute(SQL, [userId]);
    
    if (results.length === 0) {
      return res.status(404).send({ message: 'Utilisateur non trouvé', alertType: 'error' }); 
    } 
    res.send(results[0]);
  } catch (err) {
    console.error('Erreur profil admin:', err);
    res.status(500).send({ message: 'Erreur serveur', alertType: 'error' });
  }
});

// Statistiques admin
router.get("/admin/stats", async (req, res) => {
  try {
    const [totalResult] = await db.execute("SELECT COUNT(*) AS total FROM users WHERE role='dentiste'");
    const [pendingResult] = await db.execute("SELECT COUNT(*) AS pending FROM users WHERE status='pending' AND role='dentiste'");
    const [verifiedResult] = await db.execute("SELECT COUNT(*) AS verified FROM users WHERE status='approved' AND role='dentiste'");
    const [regionResult] = await db.execute("SELECT COUNT(DISTINCT Region) AS regions FROM profil");

    res.json({
      totalDentistes: totalResult[0].total,
      pending: pendingResult[0].pending,
      verified: verifiedResult[0].verified,
      regions: regionResult[0].regions,
      totalRegions: 22,
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message 
    });
  }
});

router.get("/admin/recent", async (req, res) => {
  try {
    const sql = `
        SELECT 
            p.Nom, 
            p.Prenom, 
            p.Region,
            u.created_at
        FROM profil p
        INNER JOIN users u ON p.users_id = u.id
        WHERE u.role = 'dentiste'
        ORDER BY u.created_at DESC
        LIMIT 5
    `;
    const [result] = await db.execute(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour mettre à jour le profil admin - CORRIGÉE
router.put('/admin/update-profile', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    const { username, email, currentPassword, newPassword } = req.body;

    console.log('📥 Données reçues:', { userId, username, email, hasNewPassword: !!newPassword });

    // Vérifier que l'utilisateur existe
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    // Vérifier l'email unique (sauf pour l'utilisateur actuel)
    if (email && email !== user.email) {
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
    }

    // Vérifier le nom d'utilisateur unique (sauf pour l'utilisateur actuel)
    if (username && username !== user.username) {
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );

      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }

    // Si changement de mot de passe
    if (newPassword) {
      if (!currentPassword) {
        await connection.rollback();
        return res.status(400).json({ error: 'L\'ancien mot de passe est requis' });
      }

      // Vérifier l'ancien mot de passe
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        await connection.rollback();
        return res.status(400).json({ error: 'L\'ancien mot de passe est incorrect' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      console.log('✅ Mot de passe mis à jour');
    }

    // Mettre à jour les autres informations
    const updateFields = [];
    const updateValues = [];

    if (username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length > 0) {
      updateValues.push(userId);
      
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      console.log('🛠️ Query:', updateQuery, updateValues);
      
      await connection.execute(updateQuery, updateValues);
      console.log('✅ Informations mises à jour');
    }

    await connection.commit();

    console.log('✅ Profil mis à jour avec succès');

    res.json({ 
      message: 'Profil mis à jour avec succès',
      user: {
        id: userId,
        username: username || user.username,
        email: email || user.email
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  } finally {
    connection.release();
  }
});

module.exports = router;