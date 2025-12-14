// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { IoPerson, IoLogOut } from "react-icons/io5";

// const AdminProfileDropdown = ({ onItemClick }) => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [adminName, setAdminName] = useState("Admin");
//   const menuRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       axios.post("http://localhost:3002/AdminProfil", {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       .then(res => {
//         if (res.data.username) setAdminName(res.data.username);
//       })
//       .catch(() => {});
//     }
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
//       // Jouer le son avant la déconnexion
//       if (onItemClick) onItemClick();
      
//       localStorage.removeItem("token");
//       navigate("/apropos", { replace: true });
//     }
//   };

//   // Fonction pour gérer les clics avec son
//   const handleButtonClick = () => {
//     // Jouer le son
//     if (onItemClick) onItemClick();
    
//     // Basculer le menu
//     setShowMenu(!showMenu);
//   };

//   // Fonction pour gérer les clics sur les liens du menu
//   const handleMenuLinkClick = (e) => {
//     // Jouer le son
//     if (onItemClick) onItemClick();
    
//     // Fermer le menu
//     setShowMenu(false);
    
//     // Note: La navigation se fera via React Router
//   };

//   return (
//     <div className="Adminprofile-dropdown-wrapper" ref={menuRef}>
//       <button 
//         className="Adminprofile-toggle-btn" 
//         onClick={handleButtonClick}
//         title="Menu administrateur"
//       >
//         <IoPerson className="Adminprofile-icon" />
//         <span className="admin-name">{adminName}</span>
//         <span className="dropdown-arrow">▼</span>
//       </button>

//       {showMenu && (
//         <div className="Adminprofile-menu">
//           <Link 
//             to="/admin/profil" 
//             className="Adminmenu-item" 
//             onClick={handleMenuLinkClick}
//           >
//             <IoPerson /> Mon profil
//           </Link>
//           <button 
//             className="Adminmenu-item logout-item" 
//             onClick={handleLogout}
//           >
//             <IoLogOut /> Se déconnecter
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminProfileDropdown;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoPerson, IoLogOut, IoClose } from "react-icons/io5";

const AdminProfileDropdown = ({ onItemClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.post("http://localhost:3002/AdminProfil", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.username) setAdminName(res.data.username);
      })
      .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      // Fermer la modale si clic en dehors
      if (showLogoutModal && modalRef.current && !modalRef.current.contains(e.target)) {
        setShowLogoutModal(false);
        setShowMenu(false); // Fermer aussi le menu
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutModal]);

  // Gérer l'overflow du body quand la modale est ouverte
  useEffect(() => {
    if (showLogoutModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showLogoutModal]);

  const handleLogoutClick = () => {
    // Jouer le son
    if (onItemClick) onItemClick();
    
    // Ouvrir la modale
    setShowLogoutModal(true);
    setShowMenu(false); // Fermer le menu dropdown
  };

  const confirmLogout = () => {
    // Jouer le son avant la déconnexion
    if (onItemClick) onItemClick();
    
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    navigate("/apropos", { replace: true });
  };

  const cancelLogout = () => {
    // Jouer le son d'annulation si souhaité
    if (onItemClick) onItemClick();
    
    setShowLogoutModal(false);
  };

  const handleButtonClick = () => {
    // Jouer le son
    if (onItemClick) onItemClick();
    
    // Basculer le menu
    setShowMenu(!showMenu);
  };

  const handleMenuLinkClick = (e) => {
    // Jouer le son
    if (onItemClick) onItemClick();
    
    // Fermer le menu
    setShowMenu(false);
  };

  return (
    <>
      <div className="Adminprofile-dropdown-wrapper" ref={menuRef}>
        <button 
          className="Adminprofile-toggle-btn" 
          onClick={handleButtonClick}
          title="Menu administrateur"
        >
          <IoPerson className="Adminprofile-icon" />
          <span className="admin-name">{adminName}</span>
          <span className="dropdown-arrow">▼</span>
        </button>

        {showMenu && (
          <div className="Adminprofile-menu">
            <Link 
              to="/admin/profil" 
              className="Adminmenu-item" 
              onClick={handleMenuLinkClick}
            >
              <IoPerson /> Mon profil
            </Link>
            <button 
              className="Adminmenu-item logout-item" 
              onClick={handleLogoutClick}
            >
              <IoLogOut /> Se déconnecter
            </button>
          </div>
        )}
      </div>

      {/* Modal de déconnexion */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal" ref={modalRef}>
            <div className="logout-modal-body">
              <p>Voulez-vous vraiment vous déconnecter ?</p>
              <p className="modal-subtext">Vous devrez vous reconnecter pour accéder au panneau d'administration.</p>
            </div>
            <div className="logout-modal-footer">
              <button className="logout-modal-btn cancel" onClick={cancelLogout}>
                Annuler
              </button>
              <button className="logout-modal-btn confirm" onClick={confirmLogout}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProfileDropdown;