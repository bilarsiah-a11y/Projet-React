const nodemailer = require('nodemailer');

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

const sendStatusEmail = async (userEmail, status, adminNotes = '') =>
   {
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

module.exports = { transporter, sendStatusEmail };