import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import '../AdminCss/AdminNoctification.css';

const AdminNotification = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingUsers();
    
    const interval = setInterval(fetchPendingUsers, 10000); // 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await Axios.get('http://localhost:3002/admin/pending-users');
      setPendingUsers(response.data);
      setNotificationCount(response.data.length);
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
    }
  };

  const handleQuickValidate = (user) => {
    navigate('/admin/validate', { state: { user } });
  };

  return (
    <div className="admin-notification">
      <div className="notification-header">
        <h2>Notifications Administrateur</h2>
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
      </div>

      <div className="notification-content">
        {pendingUsers.length === 0 ? (
          <div className="no-notifications">
            <p>Aucune inscription en attente de validation</p>
          </div>
        ) : (
          <div className="pending-list">
            <div className="list-header">
              <h3>Inscriptions en attente</h3>
              <div className="notification-count-badge">{pendingUsers.length}</div>
            </div>
            
            {pendingUsers.map(user => (
              <div key={user.id} className="pending-user-card">
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                  <small>Inscrit le: {new Date(user.created_at).toLocaleDateString()}</small>
                </div>
                <button 
                  className="btn-validate"
                  onClick={() => handleQuickValidate(user)}
                >
                  Valider
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* <div className="admin-actions">
          <Link to="/admin/validate">
            <button className="btn-primary">Page de Validation Complète</button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default AdminNotification;