// src/components/AdminProfileDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoPerson, IoLogOut } from "react-icons/io5";

const AdminProfileDropdown = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const menuRef = useRef(null);
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Vous-voulez vraiment déconnecter ?")) {
      localStorage.removeItem("token");
      navigate("/apropos", { replace: true });
    }
  };

  return (
    <div className="Adminprofile-dropdown-wrapper" ref={menuRef}>
      <button className="Adminprofile-toggle-btn" onClick={() => setShowMenu(!showMenu)}>
        <IoPerson className="Adminprofile-icon" />
        <span className="admin-name">{adminName}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {showMenu && (
        <div className="Adminprofile-menu">
          <Link to="/admin/profil" className="Adminmenu-item" onClick={() => setShowMenu(false)}>
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

export default AdminProfileDropdown;