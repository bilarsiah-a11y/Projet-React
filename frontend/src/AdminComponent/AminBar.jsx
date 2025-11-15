import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./AdminBar.css";
import { IoLogOutSharp } from "react-icons/io5";

const AdminBar = () => {
  const navigate = useNavigate();

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
            <Link to="/admin/profil" className="nav-profile">Profil</Link>
           <a href=""></a>
            <a onClick={handleLogout} className="logout-btn">
              <IoLogOutSharp />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminBar;