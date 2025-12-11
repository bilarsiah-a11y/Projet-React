import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css' 
import { FaHome, FaTooth, FaChartBar } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">

        
        <div className="nav-logo">
             <h2>🦷SourireGuide</h2>
        </div>
      

       <ul className="nav-menu">
          <li><Link to="/apropos"><FaHome size={22} /></Link></li>
          <li><Link to="/listedentistes"><FaTooth size={22} /></Link></li>
          <li><Link to="/statistiques"><FaChartBar size={22} /></Link></li>
        </ul>

        <div className="nav-auth">
          <Link to="/inscription" className="auth-btn">S'inscrire</Link>
          <span className="auth-sep">/</span>
          <Link to="/connexion" className="auth-btn">Se connecter</Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
