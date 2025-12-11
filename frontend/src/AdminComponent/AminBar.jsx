// src/components/AdminBar.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "./AdminBar.css";
// import { IoMdNotifications } from "react-icons/io";
// import Axios from "axios";
// import AdminProfileDropdown from "../Admin/AdminProfileDropdown"; 
// import { FaTachometerAlt, FaTooth, FaChartBar, FaClock } from "react-icons/fa";

// const AdminBar = () => {
//   const navigate = useNavigate();
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [pendingUsers, setPendingUsers] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef(null);
  
// const fetchNotifications = async () => {
//   try {
//     const res = await Axios.get('http://localhost:3002/admin/pending-users');
//     console.log('Notifications reçues:', res.data); // Debug
//     setPendingUsers(res.data);
//     setNotificationCount(res.data.length);
//   } catch (err) {
//     console.error('Erreur notifications:', err);
//     setNotificationCount(0);
//     setPendingUsers([]);
//   }
// };
//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 15000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const goToValidation = (user) => {
//     setShowDropdown(false);
//     navigate("/admin/valide", { state: { user } });
//   };

//   return (
//     <nav className="Adminbar">
//       <div className="Adminnav-container">
//         <div className="Adminnav-logo">
//           <h2>AdminPage</h2>
//         </div>

//         <div className="Adminnav-content">
//          <ul className="Adminnav-menu nav-menu-left">
//   <li> <Link to="/admin/home"> <FaTachometerAlt  size={22}/>  </Link> </li>
//   <li> <Link to="/admin/liste"><FaTooth size={22} /> </Link></li>
//   {/* <li> <Link to="/admin/statistique"> <FaChartBar size={22}/> </Link></li> */}
//  <li><Link to="/admin/valide"> <FaClock size={22} /></Link></li>
// </ul>

//           <div className="Adminnav-right">
//             {/* === CLOCHE NOTIFICATIONS === */}
//             <div className="Adminnotification-wrapper" ref={dropdownRef}>
//               <button
//                 className="Adminnotification-bell-btn"
//                 onClick={() => setShowDropdown(!showDropdown)}
//               >
//                 <IoMdNotifications className="Adminnotification-icon" />
//                 {notificationCount > 0 && (
//                   <span className="Adminnotification-badge">
//                     {notificationCount > 99 ? "99+" : notificationCount}
//                   </span>
//                 )}
//               </button>

//               {showDropdown && (
//                 <div className="Adminnotification-dropdown">
//                   <div className="Admindropdown-header">
//                     <h>Notifications</h>
//                     <span>{notificationCount} en attente</span>
//                   </div>

//                   {notificationCount === 0 ? (
//                     <div className="Adminno-notifications">Aucune inscription en attente</div>
//                   ) : (
//                     <>
//                       <div className="Admindropdown-list">
//                         {pendingUsers.map(user => (
//                           <div key={user.id} className="Adminnotif-item" onClick={() => goToValidation(user)}>
//                             <div className="Adminnotif-avatar">
//                               {user.username.charAt(0).toUpperCase()}
//                             </div>
//                             <div className="Adminnotif-text">
//                               <strong>{user.username}</strong> s'est inscrit(e)
//                               <small>
//                                 {new Date(user.created_at).toLocaleDateString()} à{" "}
//                                 {new Date(user.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                               </small>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="Admindropdown-footer">
//                         <button onClick={() => { setShowDropdown(false); navigate("/admin/valide"); }}>
//                           Voir toutes les validations
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* === NOUVEAU MENU PROFIL AVEC NOM === */}
//             <AdminProfileDropdown />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default AdminBar;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminBar.css";
import { IoMdNotifications } from "react-icons/io";
import Axios from "axios";
import AdminProfileDropdown from "../Admin/AdminProfileDropdown"; 
import { FaTachometerAlt, FaTooth, FaChartBar, FaClock } from "react-icons/fa";

const AdminBar = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
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
    setShowDropdown(false);
    navigate("/admin/valide", { state: { user } });
  };

  return (
    <nav className="Adminbar">
      <div className="Adminnav-container">
        {/* Logo minimaliste */}
        <div className="Adminnav-logo">
          <h2> PageAdmin</h2>
        </div>

        {/* Section centrale - Icôtons uniquement */}
        <div className="Adminnav-content">
          <ul className="Adminnav-menu">
            <li>
              <button 
                className="Adminnav-icon-btn" 
                onClick={() => navigate("/admin/home")}
                title="Tableau de bord"
              >
                <FaTachometerAlt size={20} />
              </button>
            </li>
            <li>
              <button 
                className="Adminnav-icon-btn" 
                onClick={() => navigate("/admin/liste")}
                title="Dentistes"
              >
                <FaTooth size={20} />
              </button>
            </li>
            <li>
              <button 
                className="Adminnav-icon-btn" 
                onClick={() => navigate("/admin/valide")}
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
                onClick={() => setShowDropdown(!showDropdown)}
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
                          <div key={user.id} className="Adminnotif-item" onClick={() => goToValidation(user)}>
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
                        <button onClick={() => { setShowDropdown(false); navigate("/admin/valide"); }}>
                          Voir toutes les validations
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profil */}
            <AdminProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminBar;