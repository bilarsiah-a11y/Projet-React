import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminBar.css";
import { IoMdNotifications } from "react-icons/io";
import Axios from "axios";
import AdminProfileDropdown from "../Admin/AdminProfileDropdown"; 
import { FaTachometerAlt, FaTooth, FaChartBar, FaClock } from "react-icons/fa";

// Importez votre son
import clickSound from '../sounds/Video Project.m4a';

const AdminBar = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Référence pour l'élément audio
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  
  // Initialiser l'audio au montage du composant
  useEffect(() => {
    try {
      audioRef.current = new Audio(clickSound);
      audioRef.current.volume = 0.3;
      audioRef.current.preload = 'auto';
      
      // Précharger l'audio
      audioRef.current.load();
      
      // Marquer l'audio comme prêt après chargement
      const handleCanPlay = () => {
        setAudioReady(true);
        console.log("Audio prêt à être joué");
      };
      
      audioRef.current.addEventListener('canplaythrough', handleCanPlay);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
        }
      };
    } catch (error) {
      console.error("Erreur lors du chargement du son:", error);
    }
  }, []);
  
  // Fonction pour jouer le son
  const playClickSound = () => {
    try {
      if (audioRef.current && audioReady) {
        // Réinitialiser et jouer
        audioRef.current.currentTime = 0;
        
        // Jouer avec gestion des erreurs
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Erreur de lecture audio:", error);
            // Tentative alternative pour certains navigateurs
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Tentative échouée:", e));
              }
            }, 100);
          });
        }
      } else {
        console.log("Audio non prêt ou non disponible");
      }
    } catch (error) {
      console.error("Erreur dans playClickSound:", error);
    }
  };
  
  // Fonction pour clic sur les liens (avec son)
  const handleLinkClick = (e) => {
    playClickSound();
  };
  
  // Test du son au clic sur le logo
  const handleLogoClick = (e) => {
    e.preventDefault();
    playClickSound();
    
    setTimeout(() => {
      window.location.href = '/';
    }, 36);
  };
  
  const fetchNotifications = async () => {
    try {
      const res = await Axios.get('http://localhost:3002/admin/pending-users');
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
    playClickSound(); // Son pour la validation
    setShowDropdown(false);
    navigate("/admin/valide", { state: { user } });
  };

  // Fonction pour navigation avec son
  const handleNavigateWithSound = (path) => {
    playClickSound();
    navigate(path);
  };

  // Fonction pour toggle notifications avec son
  const handleNotificationToggle = () => {
    playClickSound();
    setShowDropdown(!showDropdown);
  };

  // Fonction pour "Voir toutes les validations"
  const handleViewAllValidations = () => {
    playClickSound();
    setShowDropdown(false);
    navigate("/admin/valide");
  };

  return (
    <nav className="Adminbar">
      <div className="Adminnav-container">
        {/* Logo avec son */}
        <div 
          className="Adminnav-logo" 
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          <h2> PageAdmin</h2>
        </div>

        {/* Section centrale - Icôtons avec sons */}
        <div className="Adminnav-content">
          <ul className="Adminnav-menu">
            <li>
              <button 
                className="Adminnav-icon-btn" 
                onClick={() => handleNavigateWithSound("/admin/home")}
                title="Tableau de bord"
              >
                <FaTachometerAlt size={20} />
              </button>
            </li>
            <li>
              <button 
                className="Adminnav-icon-btn" 
                onClick={() => handleNavigateWithSound("/admin/liste")}
                title="Dentistes"
              >
                <FaTooth size={20} />
              </button>
            </li>
            <li>
              <button 
                className="Adminnav-icon-btn" 
                onClick={() => handleNavigateWithSound("/admin/valide")}
                title="Validations"
              >
                <FaClock size={20} />
              </button>
            </li>
          </ul>

          {/* Section droite - Notifications & Profil */}
          <div className="Adminnav-right">
            {/* Notifications */}
            <div className="Adminnotification-wrapper" ref={dropdownRef}>
              <button
                className="Adminnotification-bell-btn"
                onClick={handleNotificationToggle}
                title="Notifications"
              >
                <IoMdNotifications className="Adminnotification-icon" />
                {notificationCount > 0 && (
                  <span className="Adminnotification-badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="Adminnotification-dropdown">
                  <div className="Admindropdown-header">
                    <h>Notifications</h>
                    <span>{notificationCount} en attente</span>
                  </div>

                  {notificationCount === 0 ? (
                    <div className="Adminno-notifications">Aucune inscription en attente</div>
                  ) : (
                    <>
                      <div className="Admindropdown-list">
                        {pendingUsers.map(user => (
                          <div 
                            key={user.id} 
                            className="Adminnotif-item" 
                            onClick={() => goToValidation(user)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="Adminnotif-avatar">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="Adminnotif-text">
                              <strong>{user.username}</strong> s'est inscrit(e)
                              <small>
                                {new Date(user.created_at).toLocaleDateString()} à{" "}
                                {new Date(user.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="Admindropdown-footer">
                        <button onClick={handleViewAllValidations}>
                          Voir toutes les validations
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profil avec son */}
            <AdminProfileDropdown onItemClick={playClickSound} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminBar;