import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from 'axios';
import '../AdminCss/AdminValide.css';

const AdminValide = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchPendingUsers();
    
    if (location.state?.user) {
      setSelectedUser(location.state.user);
    }
  }, [location]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await Axios.get('http://localhost:3002/admin/pending-users');
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      showMessage('Erreur lors de la récupération des inscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleValidation = async (action) => {
    if (!selectedUser) return;

    setActionInProgress(true);
    try {
      const response = await Axios.post('http://localhost:3002/admin/validate-user', {
        userId: selectedUser.id,
        action: action,
        adminNotes: adminNotes.trim()
      });
      
      showMessage(response.data.message, action === 'approve' ? 'success' : 'warning');
      setAdminNotes('');
      setSelectedUser(null);
      await fetchPendingUsers();
    } catch (error) {
      console.error('Erreur validation:', error);
      showMessage(error.response?.data?.message || 'Erreur lors de la validation', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="admin-validate">
    
        <div className="header-content">
          <h>Validation des Inscriptions</h>
          <div className="header-subtitle">
            <span>Gestion des nouvelles inscriptions dentistes</span>
          </div>
        </div>
      

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          <div className="alert-content">
            {message.type === 'success' && <span className="alert-icon">✓</span>}
            {message.type === 'error' && <span className="alert-icon">✗</span>}
            {message.type === 'warning' && <span className="alert-icon">⚠</span>}
            {message.type === 'info' && <span className="alert-icon">ℹ</span>}
            <span>{message.text}</span>
          </div>
          <button 
            className="alert-close"
            onClick={() => setMessage({ text: '', type: '' })}
          >
            ×
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">En attente</span>
            <span className="stat-value">{pendingUsers.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-label">Aujourd'hui</span>
            <span className="stat-value">
              {pendingUsers.filter(user => {
                const today = new Date().toDateString();
                const userDate = new Date(user.created_at).toDateString();
                return today === userDate;
              }).length}
            </span>
          </div>
        </div>
      </div>

      <div className="validate-container">
        {/* Liste des utilisateurs en attente */}
        <div className="pending-users">
          <div className="pending-header">
            <h3><span className="header-icon">📋</span> Inscriptions en attente</h3>
            {pendingUsers.length > 0 && (
              <div className="notification-badge">{pendingUsers.length}</div>
            )}
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement des inscriptions...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h4>Aucune inscription en attente</h4>
              <p>Toutes les inscriptions ont été traitées</p>
            </div>
          ) : (
            <div className="users-list">
              {pendingUsers.map(user => {
                const isToday = new Date(user.created_at).toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={user.id} 
                    className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-main">
                        <strong className="username">{user.username}</strong>
                        {isToday && <span className="new-badge">Nouveau</span>}
                      </div>
                      <span className="user-email">
                        <i className="email-icon">✉</i>
                        {user.email}
                      </span>
                      <div className="user-meta">
                        <span className="registration-date">
                          <i className="calendar-icon">📅</i>
                          {new Date(user.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="user-arrow">
                      <i className="arrow-icon">→</i>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panneau de validation */}
        <div className="validation-panel">
          {selectedUser ? (
            <div className="validation-form">
              <div className="panel-header">
                <h3><span className="header-icon">✅</span> Validation de l'inscription</h3>
                <button 
                  className="btn-close-panel"
                  onClick={() => {
                    setSelectedUser(null);
                    setAdminNotes('');
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="user-info-card">
                <div className="user-card-header">
                  <div className="user-card-avatar">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-card-title">
                    <h4>{selectedUser.username}</h4>
                    <span className="user-role">Utilisateur en attente</span>
                  </div>
                </div>
                
                <div className="user-info-grid">
                  <div className="info-item">
                    <i className="info-icon">👤</i>
                    <div>
                      <span className="info-label">Nom d'utilisateur</span>
                      <span className="info-value">{selectedUser.username}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="info-icon">✉</i>
                    <div>
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedUser.email}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="info-icon">📅</i>
                    <div>
                      <span className="info-label">Date d'inscription</span>
                      <span className="info-value">
                        {new Date(selectedUser.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-notes-section">
                <label htmlFor="adminNotes">
                  <i className="notes-icon">📝</i>
                  Notes de l'administrateur
                </label>
                <div className="notes-help">
                  Ces notes seront enregistrées avec la décision
                </div>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ex: Documents vérifiés, profil complet, spécialité validée..."
                  rows="4"
                  className="admin-notes-textarea"
                  maxLength="500"
                />
                <div className="notes-counter">
                  {adminNotes.length}/500 caractères
                </div>
              </div>

              <div className="decision-section">
                <h4><i className="decision-icon">⚖️</i> Décision</h4>
                <p className="decision-help">
                  Choisissez l'action à effectuer pour cet utilisateur
                </p>
                <div className="action-buttons">
                  <button 
                    className="btn-approve"
                    onClick={() => handleValidation('approve')}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? (
                      <>
                        <span className="action-spinner"></span>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <i className="action-icon">✓</i>
                        Accepter l'inscription
                      </>
                    )}
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleValidation('reject')}
                    disabled={actionInProgress}
                  >
                    <i className="action-icon">✗</i>
                    Refuser l'inscription
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="selection-illustration">
                <i className="illustration-icon">👆</i>
              </div>
              <h4>Sélectionnez une inscription</h4>
              <p>
                Cliquez sur un utilisateur dans la liste pour voir les détails 
                et prendre une décision
              </p>
              {pendingUsers.length > 0 && (
                <div className="selection-tip">
                  <i className="tip-icon">💡</i>
                  <span>
                    <strong>{pendingUsers.length} inscription(s)</strong> en attente de validation
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminValide;