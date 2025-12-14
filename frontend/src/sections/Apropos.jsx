
// import React from "react";
// import { Link } from "react-router-dom";
// import "../sectionsCss/Apropos.css";


// const Apropos = () => {
//   return (
//     <div className="accueil-court">

//       {/* HERO TOUT-EN-UN */}
//       <section className="hero">
//         <div className="container">

//           <h3>
//             Trouvez votre dentiste<br />
//             dans <span className="red">toutes les régions</span> de Madagascar
//           </h3>

//           <p className="slogan">
//             Un beau sourire, partout à Mada
//           </p>

//           <div className="actions">
//             <Link to="/listedentistes" className=" primary">
//               Voir les dentistes
//             </Link>
//             <Link to="/connexion" className="secondary">
//               Espace dentiste
//             </Link>
//           </div>

//           {/* Mini liste des régions – juste pour montrer la couverture */}
//           <div className="regions-mini">
//             <p>Présent dans les 22 régions :</p>
//             <div className="tags">
//               {["Analamanga", "Antsinanana", "Diana", "Boeny", "Atsimo Andrefana", "Haute Matsiatra", "Vakinankaratra", "Androy", "Anosy", "Menabe", "Sofia", "Alaotra Mangoro", "+ 10 autres"].map((r, i) => (
//                 <span key={i} className="tag">{r}</span>
//               ))}
//             </div>
//           </div>

//           {/* Pour les dentistes */}
//           <div className="dentist-cta">
//             <p>Vous êtes dentiste ?</p>
//             <Link to="/inscription" className="link">
//               → Créer gratuitement votre profil
//             </Link>
//           </div>

//         </div>
//       </section>

//     </div>
//   );
// };

// export default Apropos;

import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../sectionsCss/Apropos.css";

// Importez votre son (assurez-vous que le chemin est correct)
import clickSound from '../sounds/Video Project.m4a';

const Apropos = () => {
  // Référence pour l'élément audio
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  // Initialiser l'audio au montage du composant
  useEffect(() => {
    try {
      audioRef.current = new Audio(clickSound);
      audioRef.current.volume = 0.3; // Volume réduit à 30%
      audioRef.current.preload = 'auto';
      
      // Précharger l'audio
      audioRef.current.load();
      
      // Marquer l'audio comme prêt après chargement
      const handleCanPlay = () => {
        setAudioReady(true);
        console.log("Audio prêt à être joué (Apropos)");
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

  // Liste des régions
  const regions = [
    "Analamanga", "Antsinanana", "Diana", "Boeny", 
    "Atsimo Andrefana", "Haute Matsiatra", "Vakinankaratra", 
    "Androy", "Anosy", "Menabe", "Sofia", "Alaotra Mangoro", "+ 10 autres"
  ];

  return (
    <div className="accueil-court">
      {/* HERO TOUT-EN-UN */}
      <section className="hero">
        <div className="container">
          <h3>
            Trouvez votre dentiste<br />
            dans <span className="red">toutes les régions</span> de Madagascar
          </h3>

          <p className="slogan">
            Un beau sourire, partout à Mada
          </p>

          <div className="actions">
            <Link 
              to="/listedentistes" 
              className="primary"
              onClick={playClickSound}
            >
              Voir les dentistes
            </Link>
            <Link 
              to="/connexion" 
              className="secondary"
              onClick={playClickSound}
            >
              Espace dentiste
            </Link>
          </div>

          {/* Mini liste des régions – juste pour montrer la couverture */}
          <div className="regions-mini">
            <p>Présent dans les 22 régions :</p>
            <div className="tags">
              {regions.map((region, index) => (
                <span key={index} className="tag">{region}</span>
              ))}
            </div>
          </div>

          {/* Pour les dentistes */}
          <div className="dentist-cta">
            <p>Vous êtes dentiste ?</p>
            <Link 
              to="/inscription" 
              className="link"
              onClick={playClickSound}
            >
              → Créer gratuitement votre profil
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Apropos;