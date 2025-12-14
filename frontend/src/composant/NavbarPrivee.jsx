// import React from 'react';
// import { Link } from 'react-router-dom';
// import './sidebar.css';
// import ProfileDropdown from '../sections2/ProfileDropdown'; 
// import { 
//   FaTachometerAlt, 
//   FaUserMd, 
//   FaChartBar, 

// } from "react-icons/fa";

// const NavbarPrivee = () => {
//   return (
//      <nav className="navbar">
//       <div className="nav-container">

//          <div>
//           <h2>🦷SourireGuide</h2>
//         </div>

//          <ul className="nav-menu">
//           <li><Link to="/apropos2" title="Dashboard"><FaTachometerAlt size={22} /></Link></li>
//           <li><Link to="/listedentiste2" title="Dentistes"><FaUserMd size={22} /></Link></li>
//           <li><Link to="/statistiques2" title="Statistiques"><FaChartBar size={22} /></Link></li>
//         </ul>
//         <ProfileDropdown />
//       </div>
//     </nav>
//   );
// };
// export default NavbarPrivee;


import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import ProfileDropdown from '../sections2/ProfileDropdown'; 
import { 
  FaTachometerAlt, 
  FaUserMd, 
  FaChartBar, 
} from "react-icons/fa";

// Importez votre son (vérifiez le chemin)
import clickSound from '../sounds/Video Project.m4a';

const Sidebar = () => {
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

  // Fonction pour clic sur ProfileDropdown
  const handleProfileClick = (e) => {
    playClickSound();
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* Logo avec son */}
        <div 
          className="nav-logo" 
          onClick={handleLogoClick} 
          style={{ cursor: 'pointer' }}
          title="Accueil"
        >
          <h2>🦷SourireGuide</h2>
        </div>

        {/* Menu avec sons sur chaque lien */}
        <ul className="nav-menu">
          <li>
            <Link 
              to="/apropos2" 
              onClick={handleLinkClick}
              className="nav-link-with-sound"
              title="Dashboard"
            >
              <FaTachometerAlt size={22} />
            </Link>
          </li>
          <li>
            <Link 
              to="/listedentiste2" 
              onClick={handleLinkClick}
              className="nav-link-with-sound"
              title="Dentistes"
            >
              <FaUserMd size={22} />
            </Link>
          </li>
          <li>
            <Link 
              to="/statistiques2" 
              onClick={handleLinkClick}
              className="nav-link-with-sound"
              title="Statistiques"
            >
              <FaChartBar size={22} />
            </Link>
          </li>
        </ul>
        
        {/* ProfileDropdown avec son */}
        <div onClick={handleProfileClick}>
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;