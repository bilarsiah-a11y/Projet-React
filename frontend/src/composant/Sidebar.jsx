// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import ProfileDropdown from '../sections2/ProfileDropdown'; 

const Sidebar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>SourireGuide</h2>
        </div>

        <ul className="nav-menu">
          <li><Link to="/apropos2">Tableau de bord</Link></li>
          <li><Link to="/listedentiste2">Annuair </Link></li>
          <li><Link to="/statistiques2">Statistiques</Link></li>
        </ul>
        <ProfileDropdown />
      </div>
    </nav>
  );
};

export default Sidebar;