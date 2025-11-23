// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../sections2Css/Apropos2.css";

// const Apropos2 = () => {
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const display = (value) => (value ? value : "—");

//   useEffect(() => {
//     const fetchProfile = async () => {
//       setLoading(true);
//       try {
//         // Remarque : j'ai remplacé Axios par axios (minuscule)
//         const res = await axios.get(`http://localhost:3002/ListeDentiste2`);
//         // Supposons que vous voulez le premier dentiste ou adapter selon votre API
//         if (res.data && res.data.length > 0) {
//           setProfile(res.data[0]);
//         }
//       } catch (err) {
//         console.error("Erreur lors du chargement du profil:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProfile();
//   }, []); // N'oubliez pas le tableau de dépendances vide

//   // Première lettre du Titre ou "D" par défaut - seulement si profile existe
//   const initialeTitre = profile && profile.Titre ? profile.Titre.trim()[0].toUpperCase() : "D";

//   // Afficher un loading pendant le chargement
//   if (loading) {
//     return (
//       <div className="dentiste-accueil">
//         <div className="dentiste-main-content">
//           <div className="loading">Chargement du profil...</div>
//         </div>
//       </div>
//     );
//   }

//   // Si pas de profil après chargement
//   if (!profile) {
//     return (
//       <div className="dentiste-accueil">
//         <div className="dentiste-main-content">
//           <div className="error">Erreur lors du chargement du profil</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dentiste-accueil">
//       <div className="dentiste-main-content">

//         {/* === Profil Header avec Flex === */}
//         <header className="profil-header">
//           <div className="profil-identite">
//             <div className="avatar-dentiste">
//               {initialeTitre}
//             </div>
//             <div className="identite-info">
//               <h1>
//                 {display(profile.Titre)} {display(profile.Prenom)} {display(profile.Nom)}
//               </h1>
//               <p className="specialite">
//                 {display(profile.Domaine)} • {display(profile.Region)}
//               </p>
//               <div className="contact-info">
//                 <p><span>📍</span> Adresse: {display(profile.Adresse)}</p>
//                 <p><span>📞</span> Téléphone: {display(profile.Contact)}</p>
//                 {profile.AutreContact && <p><span>📱</span> Téléphone secondaire: {display(profile.AutreContact)}</p>}
//                 <p><span>🆔</span> N° Ordre: {display(profile.NumOrdre)}</p>
//               </div>
//             </div>
//           </div>

//           <div className="profil-actions">
//             <Link to="/profil" className="btn-modifier">
//               Modifier mon profil
//             </Link>
//           </div>
//         </header>

//         {/* === Section Bienvenue avec Flex === */}
//         <section className="bienvenue-section">
//           <div className="bienvenue-content">
//             <h2>Bienvenue sur ton espace dentiste !</h2>
//             <p>
//               Ton profil est bien activé. Tu peux maintenant le compléter et le rendre encore plus beau pour tes futurs patients
//             </p>
//             <Link to="/profil" className="btn-completer">
//               Compléter mon profil
//             </Link>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// };

// export default Apropos2;


import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../sections2Css/Apropos2.css";

const Apropos2 = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const display = (value) => (value ? value : "—");

  useEffect(() => {
    
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error("Aucun token trouvé");
          setLoading(false);
          return;
        }

      
        const res = await axios.post(
          "http://localhost:3002/Profil",
          {},
          { 
            headers: { 
              Authorization: `Bearer ${token}` 
            } 
          }
        );

        console.log("Données du profil reçues:", res.data);

        if (res.data) {
          setProfile(res.data);
        } else {
          console.error("Aucune donnée de profil reçue");
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
      
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/connexion');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

 
  const getInitial = () => {
    if (profile && profile.Titre) {
      return profile.Titre.trim()[0].toUpperCase();
    }
    if (profile && profile.Prenom) {
      return profile.Prenom.trim()[0].toUpperCase();
    }
    if (user && user.username) {
      return user.username[0].toUpperCase();
    }
    return "D";
  };

  const initiale = getInitial();

  
  if (loading) {
    return (
      <div className="dentiste-accueil">
        <div className="dentiste-main-content">
          <div className="loading">Chargement de votre profil...</div>
        </div>
      </div>
    );
  }

  // Si pas de profil après chargement mais utilisateur connecté
  if (!profile && user) {
    return (
      <div className="dentiste-accueil">
        <div className="dentiste-main-content">
          <header className="profil-header">
            <div className="profil-identite">
              <div className="avatar-dentiste">
                {user.username ? user.username[0].toUpperCase() : "D"}
              </div>
              <div className="identite-info">
                <h1>Bienvenue, {display(user.username)} !</h1>
                <p className="specialite">
                  Votre espace dentiste personnel
                </p>
                <div className="contact-info">
                  <p><span>📧</span> Email: {display(user.email)}</p>
                  <p><span>🆔</span> N° Ordre: —</p>
                </div>
              </div>
            </div>

            <div className="profil-actions">
              <Link to="/profil" className="btn-modifier">
                Modifier mon profil
              </Link>
            </div>
          </header>

          <section className="bienvenue-section">
            <div className="bienvenue-content">
              <h2>Bienvenue sur votre espace dentiste !</h2>
              <p>
                Votre profil de base est créé. Complétez-le maintenant pour le rendre visible 
                aux patients et bénéficier de toutes les fonctionnalités.
              </p>
              <Link to="/profil" className="btn-completer">
                Compléter mon profil
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Si aucun utilisateur connecté
  if (!user) {
    return (
      <div className="dentiste-accueil">
        <div className="dentiste-main-content">
          <div className="error-section">
            <h2>Accès non autorisé</h2>
            <p>Veuillez vous connecter pour accéder à cette page.</p>
            <Link to="/connexion" className="btn-completer">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dentiste-accueil">
      <div className="dentiste-main-content">

        {/* === Profil Header avec Flex === */}
        <header className="profil-header">
          <div className="profil-identite">
            <div className="avatar-dentiste">
              {initiale}
            </div>
            <div className="identite-info">
              <h1>
                {display(profile.Titre)} {display(profile.Prenom)} {display(profile.Nom)}
              </h1>
              <p className="specialite">
                {display(profile.Domaine)} {profile.Domaine && profile.Region ? '•' : ''} {display(profile.Region)}
              </p>
              <div className="contact-info">
                <p><span>📍</span> : {display(profile.Adresse)}</p>
                <p><span>📞</span>  {display(profile.Contact)}</p>
                {profile.AutreContact && <p><span>📱</span> Téléphone secondaire: {display(profile.AutreContact)}</p>}
                <p><span>🆔</span>  {display(profile.NumOrdre)}</p>
                <p><span>📧</span>Email: {display(user.email)}</p>
              </div>
            </div>
          </div>

          <div className="profil-actions">
            <Link to="/profil" className="btn-modifier">
              Modifier mon profil
            </Link>
          </div>
        </header>

        {/* === Section Bienvenue avec Flex === */}
        <section className="bienvenue-section">
          <div className="bienvenue-content">
            <h2>Bienvenue sur votre espace dentiste, {display(profile.Prenom || user.username)} !</h2>
            <p>
              {(!profile.Adresse || !profile.Contact || !profile.NumOrdre) ? 
                "Votre profil est bien activé. Complétez-le maintenant pour le rendre visible à vos futurs patients." : 
                "Votre profil est complet et visible par vos patients. Vous pouvez continuer à l'enrichir."}
            </p>
            <div className="action-buttons">
              <Link to="/profil" className="btn-completer">
                {(!profile.Adresse || !profile.Contact || !profile.NumOrdre) ? "Compléter mon profil" : "Modifier mon profil"}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Apropos2;