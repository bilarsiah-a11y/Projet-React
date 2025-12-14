// import React from 'react'
// import { Link } from 'react-router-dom'
// import './Navbar.css' 
// import { FaHome, FaTooth, FaChartBar } from "react-icons/fa";

// const Navbar = () => {
//   return (
//     <nav className="navbar">
//       <div className="nav-container">

        
//         <div className="nav-logo">
//              <h2>🦷SourireGuide</h2>
//         </div>
      

//        <ul className="nav-menu">
//           <li><Link to="/apropos"><FaHome size={22} /></Link></li>
//           <li><Link to="/listedentistes"><FaTooth size={22} /></Link></li>
//           <li><Link to="/statistiques"><FaChartBar size={22} /></Link></li>
//         </ul>

//         <div className="nav-auth">
//           <Link to="/inscription" className="auth-btn">S'inscrire</Link>
//           <span className="auth-sep">/</span>
//           <Link to="/connexion" className="auth-btn">Se connecter</Link>
//         </div>

//       </div>
//     </nav>
//   )
// }

// export default Navbar


import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css' 
import { FaHome, FaTooth, FaChartBar } from "react-icons/fa";

// Importez votre son (vérifiez le chemin)
import clickSound from '../sounds/Video Project.m4a';

const Navbar = () => {
  // Référence pour l'élément audio
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  
  // Initialiser l'audio au montage du composant
  useEffect(() => {
    try {
      audioRef.current = new Audio(clickSound);
      audioRef.current.volume = 0.3;
      audioRef.current.preload = 'auto';
      
      // Précharger l'audio
      audioRef.current.load();
      
      // Marquer l'audio comme prêt après chargement
      const handleCanPlay = () => {
        setAudioReady(true);
        console.log("Audio prêt à être joué");
      };
      
      audioRef.current.addEventListener('canplaythrough', handleCanPlay);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
        }
      };
    } catch (error) {
      console.error("Erreur lors du chargement du son:", error);
    }
  }, []);
  
  // Fonction pour jouer le son
  const playClickSound = () => {
    try {
      if (audioRef.current && audioReady) {
        // Réinitialiser et jouer
        audioRef.current.currentTime = 0;
        
        // Jouer avec gestion des erreurs
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Erreur de lecture audio:", error);
            // Tentative alternative pour certains navigateurs
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Tentative échouée:", e));
              }
            }, 100);
          });
        }
      } else {
        console.log("Audio non prêt ou non disponible");
      }
    } catch (error) {
      console.error("Erreur dans playClickSound:", error);
    }
  };
  
  // Fonction pour clic sur les liens (avec son)
  const handleLinkClick = (e) => {
    playClickSound();
    // La navigation React Router se fera automatiquement
  };
  
  // Test du son au clic sur le logo
  const handleLogoClick = (e) => {
    e.preventDefault();
    playClickSound();
    
    
    setTimeout(() => {
      window.location.href = '/';
    }, 36);
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* Logo avec son */}
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <h2>🦷SourireGuide</h2>
        </div>

        {/* Menu avec sons sur chaque lien */}
        <ul className="nav-menu">
          <li>
            <Link 
              to="/apropos" 
              onClick={handleLinkClick}
              className="nav-link-with-sound"
            >
              <FaHome size={22} />
            </Link>
          </li>
          <li>
            <Link 
              to="/listedentistes" 
              onClick={handleLinkClick}
              className="nav-link-with-sound"
            >
              <FaTooth size={22} />
            </Link>
          </li>
          <li>
            <Link 
              to="/statistiques" 
              onClick={handleLinkClick}
              className="nav-link-with-sound"
            >
              <FaChartBar size={22} />
            </Link>
          </li>
        </ul>

        {/* Boutons d'authentification avec sons */}
        <div className="nav-auth">
          <Link 
            to="/inscription" 
            className="auth-btn"
            onClick={handleLinkClick}
          >
            S'inscrire
          </Link>
          <span className="auth-sep">/</span>
          <Link 
            to="/connexion" 
            className="auth-btn"
            onClick={handleLinkClick}
          >
            Se connecter
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar