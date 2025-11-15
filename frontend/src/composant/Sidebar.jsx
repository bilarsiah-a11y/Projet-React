// ...existing code...
import React from 'react'
import { Link } from 'react-router-dom'
import './sidebar.css'

const Sidebar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🦷 SourireGuide</h2>
        </div>

        <ul className="nav-menu">
          <li><Link to="/apropos2">À propos</Link></li>
          <li><Link to="/listedentiste2">Liste des dentistes</Link></li>
          <li><Link to="/statistiques2">Statistiques</Link></li>
          <li><Link to="/profil">Mon profil</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Sidebar
