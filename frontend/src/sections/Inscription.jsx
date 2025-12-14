
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaUserShield } from "react-icons/fa";
// import { BsFillShieldLockFill } from "react-icons/bs";
// import { MdOutlineMail } from "react-icons/md";
// import Axios from 'axios';
// import "../sectionsCss/Inscription.css"
// import logo2 from '../image/logo2.jpg';
// import logo3 from '../image/logo3.png';
// import { FaEye, FaEyeSlash } from "react-icons/fa";

// const Inscription = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [message, setMessage] = useState('');
//   const [messageType, setMessageType] = useState('');
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let interval;
//     if (message.includes('attente') && email) {
//       interval = setInterval(() => {
//         checkUserStatus();
//       }, 5000);
//     }
//     return () => clearInterval(interval);
//   }, [message, email]);

//   const checkUserStatus = () => {
//     Axios.get(`http://localhost:3002/user-status/${email}`)
//       .then(response => {
//         const { status, admin_notes } = response.data;
        
//         if (status === 'approved') {
//           setMessage('Félicitations! Votre inscription a été approuvée. Redirection...');
//           setMessageType('success');
//           setTimeout(() => {
//             navigate('/connexion', { state: { username, password } });
//           }, 3000);
//         } else if (status === 'rejected') {
//           setMessage(`Inscription refusée: ${admin_notes || 'Raison non spécifiée'}`);
//           setMessageType('error');
//         }
//       })
//       .catch(error => {
//         console.error('Erreur vérification statut:', error);
//       });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!username || !email || !password) {
//       setMessage('Veuillez remplir tous les champs');
//       setMessageType('error');
//       return;
//     }

//     Axios.post('http://localhost:3002/Inscription', {
//       Username: username,
//       Email: email,
//       Password: password,
//     })
//       .then((response) => {
//         setMessage(response.data.message);
//         setMessageType('warning');
//         setTimeout(() => {
//           checkUserStatus();
//         }, 3000);
//       })
//       .catch((error) => {
//         console.error('Erreur:', error);
//         if (error.response) {
//           setMessage(error.response.data?.message || 'Erreur lors de la création du compte');
//         } else if (error.request) {
//           setMessage('Erreur de connexion au serveur');
//         } else {
//           setMessage('Erreur inattendue');
//         }
//         setMessageType('error');
//       });
//   };

//   const getMessageClass = () => {
//     switch (messageType) {
//       case 'success': return 'message success';
//       case 'error': return 'message error';
//       case 'warning': return 'message warning';
//       default: return 'message';
//     }
//   };

//   return (
//     <div className="loginPage flex">
//       {isTransitioning && <div className="page-transition"></div>}
      
//    <div className="container flex">
//   <div className="img">
//     <img src={logo2} alt="Cabinet dentaire"/>
//     <div className="FooterDiv flex">
//       <p className="text">J'ai déjà un compte ?</p>
//       <Link to="/connexion"  className="connect-link"
//       onClick={() => setIsTransitioning(true)}>
//         Se connecter
//       </Link>
//     </div>
//   </div>
// </div>
//       <div className="formDiv flex">
//         <div className="headerDiv">
         
//           <h1>Inscription</h1>
//         </div>
        
//         {message && (
//           <div className={getMessageClass()}>
//             {message}
//           </div>
//         )}

//         <form className="form grid" onSubmit={handleSubmit}>
//           <div className="inputDiv">
//             <label htmlFor="username">Nom d'utilisateur</label>
//             <div className="input-wrapper">
//               <FaUserShield className="icon" />
//               <input
//                 type="text"
//                 id="username"
//                 placeholder="Entrer votre nom d'utilisateur"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="inputDiv">
//             <label htmlFor="email">Email</label>
//             <div className="input-wrapper">
//               <MdOutlineMail className="icon" />
//               <input
//                 type="email"
//                 id="email"
//                 placeholder="Entrer votre Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="inputDiv">
//             <label htmlFor="password">Mot de passe</label>
//             <div className="input-wrapper">
//               <BsFillShieldLockFill className="icon" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 placeholder="Entrer votre mot de passe"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </button>
//             </div>
//           </div>

//           <button className="btn flex" type="submit">
//             <span>S'inscrire</span>
//           </button>
//         </form>
//       </div>
//     </div>
//   );;
// };

// export default Inscription;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import Axios from 'axios';
import "../sectionsCss/Inscription.css"
import logo2 from '../image/logo2.jpg';
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Importez votre son (même fichier que dans les autres composants)
import clickSound from '../sounds/Video Project.m4a';

const Inscription = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Référence pour l'élément audio
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  // Initialiser l'audio au montage du composant
  useEffect(() => {
    try {
      audioRef.current = new Audio(clickSound);
      audioRef.current.volume = 0.3; // Volume à 30%
      audioRef.current.preload = 'auto';
      
      // Précharger l'audio
      audioRef.current.load();
      
      // Marquer l'audio comme prêt après chargement
      const handleCanPlay = () => {
        setAudioReady(true);
        console.log("Audio prêt à être joué (Inscription)");
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

  // Fonction wrapper pour gérer les clics avec son
  const handleClickWithSound = (callback) => {
    return (e) => {
      playClickSound();
      if (callback) callback(e);
    };
  };

  useEffect(() => {
    let interval;
    if (message.includes('attente') && email) {
      interval = setInterval(() => {
        checkUserStatus();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [message, email]);

  const checkUserStatus = () => {
    Axios.get(`http://localhost:3002/user-status/${email}`)
      .then(response => {
        const { status, admin_notes } = response.data;
        
        if (status === 'approved') {
          setMessage('Félicitations! Votre inscription a été approuvée. Redirection...');
          setMessageType('success');
          setTimeout(() => {
            // Jouer le son avant la redirection
            playClickSound();
            setTimeout(() => {
              navigate('/connexion', { state: { username, password } });
            }, 100);
          }, 3000);
        } else if (status === 'rejected') {
          setMessage(`Inscription refusée: ${admin_notes || 'Raison non spécifiée'}`);
          setMessageType('error');
          playClickSound(); // Son pour notification
        }
      })
      .catch(error => {
        console.error('Erreur vérification statut:', error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Jouer le son lors de la soumission
    playClickSound();
    
    if (!username || !email || !password) {
      setMessage('Veuillez remplir tous les champs');
      setMessageType('error');
      return;
    }

    Axios.post('http://localhost:3002/Inscription', {
      Username: username,
      Email: email,
      Password: password,
    })
      .then((response) => {
        setMessage(response.data.message);
        setMessageType('warning');
        setTimeout(() => {
          checkUserStatus();
        }, 3000);
      })
      .catch((error) => {
        console.error('Erreur:', error);
        playClickSound(); // Son pour erreur
        if (error.response) {
          setMessage(error.response.data?.message || 'Erreur lors de la création du compte');
        } else if (error.request) {
          setMessage('Erreur de connexion au serveur');
        } else {
          setMessage('Erreur inattendue');
        }
        setMessageType('error');
      });
  };

  const getMessageClass = () => {
    switch (messageType) {
      case 'success': return 'message success';
      case 'error': return 'message error';
      case 'warning': return 'message warning';
      default: return 'message';
    }
  };

  // Fonction pour basculer l'affichage du mot de passe avec son
  const togglePasswordVisibility = () => {
    playClickSound();
    setShowPassword(!showPassword);
  };

  return (
    <div className="loginPage flex">
      {isTransitioning && <div className="page-transition"></div>}
      
      <div className="container flex">
        <div className="img">
          <img src={logo2} alt="Cabinet dentaire"/>
          <div className="FooterDiv flex">
            <p className="text">J'ai déjà un compte ?</p>
            <Link 
              to="/connexion"  
              className="connect-link"
              onClick={handleClickWithSound(() => setIsTransitioning(true))}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
      
      <div className="formDiv flex">
        <div className="headerDiv">
          <h1>Inscription</h1>
        </div>
        
        {message && (
          <div className={getMessageClass()}>
            {message}
          </div>
        )}

        <form className="form grid" onSubmit={handleSubmit}>
          <div className="inputDiv">
            <label htmlFor="username">Nom d'utilisateur</label>
            <div className="input-wrapper">
              <FaUserShield className="icon" />
              <input
                type="text"
                id="username"
                placeholder="Entrer votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inputDiv">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <MdOutlineMail className="icon" />
              <input
                type="email"
                id="email"
                placeholder="Entrer votre Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inputDiv">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrapper">
              <BsFillShieldLockFill className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Entrer votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            className="btn flex" 
            type="submit"
            onClick={playClickSound}
          >
            <span>S'inscrire</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Inscription;
