import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoPerson, IoLogOut } from "react-icons/io5";

const ProfileDropdown = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [dentistName, setDentistName] = useState("Dentiste");
  const menuRef = useRef(null);
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

  // Fermer au clic dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("voulez vous vraiment deconnecter ?")) {
      localStorage.clear();
      navigate("/apropos");
    }
  };

  return (
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
  );
};

export default ProfileDropdown;