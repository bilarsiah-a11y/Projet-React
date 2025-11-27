import React from 'react';
import './AdminStats.css';

const AdminStats = ({ adminStats, recentUsers }) => {
  const {
    totalDentistes = 0,
    pending = 0,
    verified = 0,
    regions = 0,
    totalRegions = 22
  } = adminStats;

  // Fonctions pour les actions rapides
  const handlePendingRegistrations = () => {
    // Rediriger vers la page des inscriptions en attente
    window.location.href = '/admin/valide';
  };

  const handleGenerateReport = () => {
    // Générer un rapport PDF ou Excel
    console.log('Génération du rapport...');
    alert('Rapport généré avec succès!');
  };

  const handleManageUsers = () => {
    // Rediriger vers la gestion des utilisateurs
    window.location.href = '/admin/liste';
  };

  const handleSendNotification = () => {
    // Ouvrir un modal pour envoyer des notifications
    console.log('Envoi de notification...');
    alert('Fonctionnalité d\'envoi de notification');
  };

  return (
    <div className="admin-stats-section">
      <h3 className="admin-stats-title">Statistiques Administratives</h3>
      
      <div className="admin-stats-grid">
        {/* Carte de synthèse */}
        <div className="admin-summary-card">
          <h4>Synthèse de la Plateforme</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Taux de couverture régionale</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(regions / totalRegions) * 100}%` }}
                />
              </div>
              <span className="summary-value">{regions}/{totalRegions} régions</span>
              <span className="summary-percentage">
                {Math.round((regions / totalRegions) * 100)}%
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Taux de vérification</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${totalDentistes > 0 ? (verified / totalDentistes) * 100 : 0}%` }}
                />
              </div>
              <span className="summary-value">
                {verified}/{totalDentistes} dentistes vérifiés
              </span>
              <span className="summary-percentage">
                {totalDentistes > 0 ? Math.round((verified / totalDentistes) * 100) : 0}%
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">En attente de validation</span>
              <div className="pending-section">
                <span className={`pending-value ${pending > 0 ? 'has-pending' : ''}`}>
                  {pending} inscription(s)
                </span>
                {pending > 0 && (
                  <button 
                    className="action-pending-btn"
                    onClick={handlePendingRegistrations}
                  >
                    Voir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Utilisateurs récents */}
        <div className="recent-users-card">
          <h4>Dernières Inscriptions</h4>
          <div className="recent-users-list">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={index} className="recent-user-item">
                  <div className="user-avatar">
                    {user.Nom?.charAt(0)}{user.Prenom?.charAt(0)}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      {user.Prenom} {user.Nom}
                    </span>
                    <span className="user-region">{user.Region}</span>
                  </div>
                  <span className="user-date">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-recent-users">
                <p>✅ Aucune nouvelle inscription</p>
                <small>Toutes les inscriptions sont traitées</small>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="quick-actions-card">
          <h4>Actions Rapides</h4>
          <div className="actions-list">
            <button 
              className="action-btn primary" 
              onClick={handlePendingRegistrations}
            >
              📋 Voir les inscriptions en attente
            </button>
            
            <button 
              className="action-btn secondary" 
              onClick={handleManageUsers}
            >
              👥 Gérer les utilisateurs
            </button>
            <button 
              className="action-btn secondary" 
              onClick={handleSendNotification}
            >
              📧 Envoyer notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;