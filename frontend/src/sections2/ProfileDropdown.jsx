// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { IoPerson, IoLogOut } from "react-icons/io5";

// const ProfileDropdown = () => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [dentistName, setDentistName] = useState("Dentiste");
//   const menuRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     axios
//       .post(
//         "http://localhost:3002/Profil",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       )
//       .then((res) => {
//         const name =
//           res.data.username ||
//           `${res.data.Prenom || ""} ${res.data.Nom || ""}`.trim();
//         setDentistName(name || "Dentiste");
//       })
//       .catch(() => setDentistName("Dentiste"));
//   }, []);

//   // Fermer au clic dehors
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
//     if (window.confirm("voulez vous vraiment deconnecter ?")) {
//       localStorage.clear();
//       navigate("/apropos");
//     }
//   };

//   return (
//     <div className="Adminprofile-dropdown-wrapper" ref={menuRef}>
//       <button
//         className="Adminprofile-toggle-btn"
//         onClick={() => setShowMenu(!showMenu)}
//          data-tooltip={dentistName} 
//       >
//         <IoPerson className="Adminprofile-icon" />
//         <span className="admin-name">{dentistName}</span>
//         <span className="dropdown-arrow">▼</span>
       
//       </button>

//       {showMenu && (
//         <div className="Adminprofile-menu">
//           <Link
//             to="/profil"
//             className="Adminmenu-item"
//             onClick={() => setShowMenu(false)}
//           >
//             <IoPerson /> Mon profil
//           </Link>
//           <button className="Adminmenu-item logout-item" onClick={handleLogout}>
//             <IoLogOut /> Se déconnecter
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfileDropdown;



import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoPerson, IoLogOut, IoClose } from "react-icons/io5";

const ProfileDropdown = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dentistName, setDentistName] = useState("Dentiste");
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .post(
        "http://localhost:3002/Profil",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const name =
          res.data.username ||
          `${res.data.Prenom || ""} ${res.data.Nom || ""}`.trim();
        setDentistName(name || "Dentiste");
      })
      .catch(() => setDentistName("Dentiste"));
  }, []);

  // Fermer le menu au clic dehors
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

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowMenu(false); // Fermer le menu dropdown
  };

  const confirmLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    navigate("/apropos");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="Adminprofile-dropdown-wrapper" ref={menuRef}>
        <button
          className="Adminprofile-toggle-btn"
          onClick={() => setShowMenu(!showMenu)}
          data-tooltip={dentistName}
        >
          <IoPerson className="Adminprofile-icon" />
          <span className="admin-name">{dentistName}</span>
          <span className="dropdown-arrow">▼</span>
        </button>

        {showMenu && (
          <div className="Adminprofile-menu">
            <Link
              to="/profil"
              className="Adminmenu-item"
              onClick={() => setShowMenu(false)}
            >
              <IoPerson /> Mon profil
            </Link>
            <button className="Adminmenu-item logout-item" onClick={handleLogout}>
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

export default ProfileDropdown;