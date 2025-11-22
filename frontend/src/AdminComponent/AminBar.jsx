// src/components/AdminBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminBar.css";
import { IoMdNotifications } from "react-icons/io";
import Axios from "axios";
import AdminProfileDropdown from "../Admin/AdminProfileDropdown"; 

const AdminBar = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
const fetchNotifications = async () => {
  try {
    const res = await Axios.get('http://localhost:3002/admin/pending-users');
    console.log('Notifications reçues:', res.data); // Debug
    setPendingUsers(res.data);
    setNotificationCount(res.data.length);
  } catch (err) {
    console.error('Erreur notifications:', err);
    setNotificationCount(0);
    setPendingUsers([]);
  }
};
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToValidation = (user) => {
    setShowDropdown(false);
    navigate("/admin/valide", { state: { user } });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>AdminPage</h2>
        </div>

        <div className="nav-content">
          <ul className="nav-menu nav-menu-left">
            <li><Link to="/admin/home">Accueil</Link></li>
            <li><Link to="/admin/liste">Liste des dentistes</Link></li>
            <li><Link to="/admin/statistique">Statistiques</Link></li>
            <li><Link to="/admin/valide">Validations</Link></li>
          </ul>

          <div className="nav-right">
            {/* === CLOCHE NOTIFICATIONS === */}
            <div className="notification-wrapper" ref={dropdownRef}>
              <button
                className="notification-bell-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <IoMdNotifications className="notification-icon" />
                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <span>{notificationCount} en attente</span>
                  </div>

                  {notificationCount === 0 ? (
                    <div className="no-notifications">Aucune inscription en attente</div>
                  ) : (
                    <>
                      <div className="dropdown-list">
                        {pendingUsers.map(user => (
                          <div key={user.id} className="notif-item" onClick={() => goToValidation(user)}>
                            <div className="notif-avatar">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="notif-text">
                              <strong>{user.username}</strong> s'est inscrit(e)
                              <small>
                                {new Date(user.created_at).toLocaleDateString()} à{" "}
                                {new Date(user.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="dropdown-footer">
                        <button onClick={() => { setShowDropdown(false); navigate("/admin/valide"); }}>
                          Voir toutes les validations
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* === NOUVEAU MENU PROFIL AVEC NOM === */}
            <AdminProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminBar;