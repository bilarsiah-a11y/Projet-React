// ...existing code...
import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🦷  SourireGuide</h2>
        </div>

        <ul className="nav-menu">
          <li><Link to="/apropos">Accueil </Link></li>
          <li><Link to="/listedentistes">Trouver un dentiste</Link></li>
          <li><Link to="/statistiques">Statistiques nationales</Link></li>
          <li><Link to="/connexion">Se connecter</Link></li>
          <li><Link to="/inscription">S'inscrire</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar