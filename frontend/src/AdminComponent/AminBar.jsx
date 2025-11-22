import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./AdminBar.css";
import { IoLogOutSharp } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import Axios from "axios"; // AJOUT: Pour les notifications

const AdminBar = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0); // AJOUT: État pour le compteur

  // AJOUT: Récupérer le nombre de notifications
  useEffect(() => {
    fetchNotificationCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = () => {
    Axios.get('http://localhost:3002/admin/pending-users')
      .then(response => {
        setNotificationCount(response.data.length);
      })
      .catch(error => {
        console.error('Erreur récupération notifications:', error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/apropos", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🦷 AdminPage</h2>
        </div>

        <div className="nav-content">
          <ul className="nav-menu nav-menu-left">
            <li><Link to="/admin/home">Accueil</Link></li>
            <li><Link to="/admin/liste">Liste des dentistes</Link></li>
            <li><Link to="/admin/statistique">Statistiques</Link></li>
            <li><Link to="/admin/valide">Validations</Link></li>
          </ul>
          
          <div className="nav-right">
            {/* AJOUT: Lien notifications avec badge */}
            <Link to="/admin/notifications" className="notification-link">
              <IoMdNotifications className="notification-icon" />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </Link>

            <Link to="/admin/profil" className="nav-profile">Profil</Link>
            
            {/* AJOUT: Bouton logout avec confirmation */}
            <button 
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                  handleLogout();
                }
              }} 
              className="logout-btn"
              title="Déconnexion"
            >
              <IoLogOutSharp />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminBar;