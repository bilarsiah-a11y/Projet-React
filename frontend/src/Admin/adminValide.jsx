import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from 'axios';
import '../AdminCss/AdminValide.css';

const AdminValide = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchPendingUsers();
    
    if (location.state?.user) {
      setSelectedUser(location.state.user);
    }
  }, [location]);

 const fetchPendingUsers = async () => {
  try {
    const response = await Axios.get('http://localhost:3002/admin/pending-users');
    console.log('Utilisateurs en attente:', response.data); // Debug
    setPendingUsers(response.data);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    setMessage('Erreur lors de la récupération des inscriptions');
    setTimeout(() => setMessage(''), 3000);
  }
};

const handleValidation = async (action) => {
  if (!selectedUser) return;

  try {
    const response = await Axios.post('http://localhost:3002/admin/validate-user', {
      userId: selectedUser.id,
      action: action,
      adminNotes: adminNotes
    });
    
    setMessage(response.data.message);
    setAdminNotes('');
    setSelectedUser(null);
    await fetchPendingUsers(); 
    
    setTimeout(() => setMessage(''), 3000);
  } catch (error) {
    console.error('Erreur validation:', error);
    setMessage(error.response?.data?.message || 'Erreur lors de la validation');
    setTimeout(() => setMessage(''), 3000);
  }
};

  return (
    <div className="admin-validate">
      <h2>Validation des Inscriptions</h2>
      
      {message && (
        <div className={`message ${message.includes('approuvé') || message.includes('Erreur') ? 'error' : message.includes('accepté') ? 'success' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="validate-container">
        {/* Liste des utilisateurs en attente */}
        <div className="pending-users">
          <div className="pending-header">
            <h3>Inscriptions en attente</h3>
            {pendingUsers.length > 0 && (
              <div className="notification-badge">{pendingUsers.length}</div>
            )}
          </div>
          
          {pendingUsers.length === 0 ? (
            <p className="no-pending">Aucune inscription en attente</p>
          ) : (
            <div className="users-list">
              {pendingUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="user-details">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                    <small>Inscrit le: {new Date(user.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panneau de validation */}
        <div className="validation-panel">
          {selectedUser ? (
            <div className="validation-form">
              <h3>Valider l'inscription</h3>
              
              <div className="user-info-card">
                <h4>Informations de l'utilisateur</h4>
                <p><strong>Nom:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Date d'inscription:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>


         <div className="admin-notes-section">
                <label htmlFor="adminNotes">Notes de l'administrateur :</label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajoutez vos commentaires ou notes concernant cette validation..."
                  rows="4"
                  className="admin-notes-textarea"
                />
              </div>


              <div className="action-buttons">
                <button 
                  className="btn-approve"
                  onClick={() => handleValidation('approve')}
                >
                  ✅ Accepter l'inscription
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => handleValidation('reject')}
                >
                  ❌ Refuser l'inscription
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setSelectedUser(null);
                    setAdminNotes('');
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Sélectionnez un utilisateur pour valider ou refuser son inscription</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminValide;