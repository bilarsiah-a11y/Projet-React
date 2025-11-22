// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import Axios from 'axios';
// import logo from "../image/logo.png";
// import { FaUserShield, FaEnvelope } from "react-icons/fa";
// import { BsFillShieldLockFill } from "react-icons/bs";
// import { AiOutlineSwapRight, AiOutlineArrowLeft } from "react-icons/ai";
// import "../sectionsCss/Connexion.css";

// const Connexion = () => {
//   const navigate = useNavigate();

//   // =================== États Connexion ===================
//   const [loginusername, setLoginUsername] = useState('');
//   const [loginpassword, setLoginPassword] = useState('');

//   // =================== États Reset Password ===================
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const [step, setStep] = useState(1); // 1 = email, 2 = code OTP, 3 = nouveaux mdp
//   const [email, setEmail] = useState('');
//   const [code, setCode] = useState(['', '', '', '', '', '']); // 6 cases
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const inputRefs = useRef([]);
//   const fullCode = code.join('');

//   // Focus automatique sur la première case OTP
//   useEffect(() => {
//     if (step === 2 && inputRefs.current[0]) {
//       inputRefs.current[0].focus();
//     }
//   }, [step]);

//   // Gestion des 6 cases OTP
//   const handleCodeChange = (index, value) => {
//     if (!/^\d*$/.test(value)) return;
//     const newCode = [...code];
//     newCode[index] = value.slice(-1);
//     setCode(newCode);
//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleCodeKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && !code[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   // =================== Connexion classique ===================
//   const loginUser = async (e) => {
//   e.preventDefault();
//   try {
//     const res = await Axios.post('http://localhost:3002/Connexion', {
//       Username: loginusername,
//       Password: loginpassword,
//     });
//     const { token, user } = res.data;
//     if (token && user) {
//       localStorage.setItem('token', token);
//       localStorage.setItem('role', user.role);
//       localStorage.setItem('user', JSON.stringify(user));
//       alert('Connexion réussie 👌');
//       if (user.role === "admin") {
//         navigate('/admin/home');
//       } else {
//         navigate('/profil');
//       }
//     } else {
//       alert(res.data.message || 'Identifiants incorrects');
//     }
//   } catch (err) {
//     // Message d'erreur plus spécifique
//     const errorMessage = err.response?.data?.message || 'Erreur de connexion';
//     alert(errorMessage);
    
//     // Redirection vers l'inscription si le compte est refusé
//     if (errorMessage.includes('refusée')) {
//       setTimeout(() => {
//         navigate('/inscription');
//       }, 3000);
//     }
//   }
// };

//   // =================== Étape 1 : Envoi code ===================
//   const handleSendCode = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');
//     try {
//       const res = await Axios.post("http://localhost:3002/mot-passe-oublier", { email });
//       if (res.data.success) {
//         setMessage("Code envoyé avec succès ! Vérifie tes mails 📧");
//         setTimeout(() => {
//           setStep(2);
//           setMessage('');
//         }, 2200);
//       }
//     } catch (err) {
//       setMessage(err.response?.data?.error || "Erreur serveur");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Étape 2 → Vérification du code
//   const verifyCode = async (e) => {
//     e.preventDefault();
//     if (fullCode.length !== 6) return setMessage("Entre les 6 chiffres");

//     try {
//       const res = await Axios.post("http://localhost:3002/verify-reset-code", {
//         email,
//         code: fullCode
//       });

//       if (res.data.success) {
//         setMessage("Code validé ! Passe au nouveau mot de passe");
//         setTimeout(() => {
//           setStep(3);
//           setMessage('');
//         }, 1500);
//       }
//     } catch (err) {
//       setMessage(err.response?.data?.error || "Code incorrect ou expiré");
//     }
//   };

//   // Étape 3 → Confirmation nouveau mot de passe
//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmPassword) return setMessage("Les mots de passe ne correspondent pas");
//     if (newPassword.length < 6) return setMessage("Minimum 6 caractères");

//     try {
//       const res = await Axios.post("http://localhost:3002/confirm-new-password", {
//         email,
//         code: fullCode,
//         newPassword,
//         confirmPassword
//       });

//       if (res.data.success) {
//         setMessage("Mot de passe changé avec succès !");
//         setTimeout(() => {
//           resetForm();
//           setIsForgotPassword(false);
//         }, 2000);
//       }
//     } catch (err) {
//       setMessage(err.response?.data?.error || "Erreur lors du changement");
//     }
//   };

//   // Fonction pour reset le formulaire
//   const resetForm = () => {
//     setIsForgotPassword(false);
//     setStep(1);
//     setEmail('');
//     setCode(['', '', '', '', '', '']);
//     setNewPassword('');
//     setConfirmPassword('');
//     setMessage('');
//   };


//   // =================== RENDU ===================
//   return (
//     <div className="login-section">
//       <div className="login-container">
//         <img src={logo} alt="Logo" className="login-logo" />

//         {/* =================== CONNEXION CLASSIQUE =================== */}
//         {!isForgotPassword ? (
//           <>
//             <h1>Veuillez-vous connecter</h1>
//             <form className="auth-form" onSubmit={loginUser}>
//               <div className="form-group">
//                 <label>Nom d'utilisateur :</label>
//                 <div className="input-container">
//                   <FaUserShield className="icon2" />
//                   <input type="text" value={loginusername} onChange={(e) => setLoginUsername(e.target.value)} required placeholder="Entrez votre nom d'utilisateur" />
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label>Mot de passe :</label>
//                 <div className="input-container">
//                   <BsFillShieldLockFill className="icon2" />
//                   <input type="password" value={loginpassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="Entrez votre mot de passe" />
//                 </div>
//               </div>
//               <button type="submit" className="btn1">
//                 Se connecter <AiOutlineSwapRight className="icon3" />
//               </button>
//               <div className="forgot-link">
//                 <p onClick={() => setIsForgotPassword(true)} style={{ cursor: "pointer", color: "#4f46e5", fontWeight: "500" }}>
//                   Mot de passe oublié ?
//                 </p>
//               </div>
//               <div className="form-footer">
//                 <p>Je n'ai pas de compte ? <Link to="/inscription">S'inscrire</Link></p>
//               </div>
//             </form>
//           </>
//         ) : (
//           <>
//             <h1>Mot de passe oublié ?</h1>

//             {/* ÉTAPE 1 : EMAIL */}
//             {step === 1 && (
//               <form onSubmit={handleSendCode} className="auth-form">
//                 <p>Entre ton email, on t’envoie un code de validation.</p>
//                 <div className="form-group">
//                   <div className="input-container">
//                     <FaEnvelope className="icon2" />
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       placeholder="ton@email.com"
//                       disabled={loading}
//                     />
//                   </div>
//                 </div>
//                 <button type="submit" disabled={loading} className="btn1">
//                   {loading ? "Envoi en cours..." : "Envoyer le code"}
//                 </button>
//                 <button className="back-btn" onClick={() => { setIsForgotPassword(false); setStep(1); setMessage(''); setCode(['', '', '', '', '', '']); }}>
//                   <AiOutlineArrowLeft /> Retour à la connexion
//                 </button>
//               </form>

//             )}

//             {/* ÉTAPE 2 : 6 CASES OTP */}
//             {step === 2 && (
//               <form onSubmit={verifyCode} className="auth-form">
//                 <p>Entre le code à 6 chiffres envoyé à <strong>{email}</strong></p>
//                 <div className="otp-container">
//                   {code.map((digit, index) => (
//                     <input
//                       key={index}
//                       type="text"
//                       maxLength="1"
//                       value={digit}
//                       onChange={(e) => handleCodeChange(index, e.target.value)}
//                       onKeyDown={(e) => handleCodeKeyDown(index, e)}
//                       ref={(el) => (inputRefs.current[index] = el)}
//                       className="otp-input"
//                     />
//                   ))}
//                 </div>
//                 <button type="submit" disabled={loading || fullCode.length !== 6} className="btn1">
//                   {loading ? "Vérification..." : "Vérifier le code"}
//                 </button>
//                 <button type="button" className="btn-cancel" onClick={() => setStep(1)}>
//                   Changer d'email
//                 </button>
//               </form>
//             )}

//             {/* ÉTAPE 3 : NOUVEAUX MOTS DE PASSE */}
//             {step === 3 && (
//               <form onSubmit={handleResetPassword} className="auth-form">
//                 <p>Crée ton nouveau mot de passe sécurisé</p>

//                 <div className="form-group">
//                   <label>Nouveau mot de passe :</label>
//                   <div className="input-container">
//                     <BsFillShieldLockFill className="icon2" />
//                     <input
//                       type="password"
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       placeholder="Nouveau mot de passe"
//                       required
//                       disabled={loading}
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label>Confirmer le mot de passe :</label>
//                   <div className="input-container">
//                     <BsFillShieldLockFill className="icon2" />
//                     <input
//                       type="password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       placeholder="Confirmer le mot de passe"
//                       required
//                       disabled={loading}
//                     />
//                   </div>
//                 </div>

//                 <button type="submit" disabled={loading} className="btn1">
//                   {loading ? "Enregistrement..." : "Confirmer le changement"}
//                 </button>

//                 <button type="button" className="btn-cancel" onClick={() => setStep(2)}>
//                   Retour au code
//                 </button>
//               </form>
//             )}

//             {/* Messages */}
//             {message && (
//               <div className={`message ${message.includes('succès') || message.includes('envoyé') || message.includes('validé') ? 'success' : 'error'}`}>
//                 {message}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Connexion;


import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import logo from "../image/logo.png";
import { FaUserShield, FaEnvelope } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight, AiOutlineArrowLeft } from "react-icons/ai";
import "../sectionsCss/Connexion.css";

const Connexion = () => {
  const navigate = useNavigate();

  // États Connexion
  const [loginusername, setLoginUsername] = useState('');
  const [loginpassword, setLoginPassword] = useState('');

  // États Reset Password
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const fullCode = code.join('');

  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Connexion classique - CORRIGÉE
  const loginUser = async (e) => {
    e.preventDefault();
    
    if (!loginusername || !loginpassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('🔍 Tentative de connexion pour:', loginusername);
      
      const res = await Axios.post('http://localhost:3002/Connexion', {
        Username: loginusername,
        Password: loginpassword,
      });
      
      const { token, user } = res.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));
        
        alert('Connexion réussie 👌');
        
        if (user.role === "admin") {
          navigate('/admin/home');
        } else {
          navigate('/profil');
        }
      } else {
        alert(res.data.message || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error('❌ Erreur connexion:', err.response?.data);
      
      // Gestion spécifique des erreurs
      if (err.response?.status === 403) {
        const errorMessage = err.response.data.message;
        alert(errorMessage);
        
        // Redirection si refusé
        if (errorMessage.includes('refusée')) {
          setTimeout(() => {
            navigate('/inscription');
          }, 3000);
        }
      } else if (err.response?.status === 401) {
        alert('Nom d\'utilisateur ou mot de passe incorrect');
      } else {
        alert(err.response?.data?.message || 'Erreur de connexion au serveur');
      }
    }
  };

  // Étape 1 : Envoi code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await Axios.post("http://localhost:3002/mot-passe-oublier", { email });
      if (res.data.success) {
        setMessage("Code envoyé avec succès ! Vérifie tes mails 📧");
        setTimeout(() => {
          setStep(2);
          setMessage('');
        }, 2200);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérification du code
  const verifyCode = async (e) => {
    e.preventDefault();
    if (fullCode.length !== 6) return setMessage("Entre les 6 chiffres");

    try {
      const res = await Axios.post("http://localhost:3002/verify-reset-code", {
        email,
        code: fullCode
      });

      if (res.data.success) {
        setMessage("Code validé ! Passe au nouveau mot de passe");
        setTimeout(() => {
          setStep(3);
          setMessage('');
        }, 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Code incorrect ou expiré");
    }
  };

  // Étape 3 : Confirmation nouveau mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setMessage("Les mots de passe ne correspondent pas");
    if (newPassword.length < 6) return setMessage("Minimum 6 caractères");

    try {
      const res = await Axios.post("http://localhost:3002/confirm-new-password", {
        email,
        code: fullCode,
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        setMessage("Mot de passe changé avec succès !");
        setTimeout(() => {
          resetForm();
          setIsForgotPassword(false);
        }, 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur lors du changement");
    }
  };

  // Fonction pour reset le formulaire
  const resetForm = () => {
    setIsForgotPassword(false);
    setStep(1);
    setEmail('');
    setCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
  };

  return (
    <div className="login-section">
      <div className="login-container">
        <img src={logo} alt="Logo" className="login-logo" />

        {!isForgotPassword ? (
          <>
            <h1>Veuillez-vous connecter</h1>
            <form className="auth-form" onSubmit={loginUser}>
              <div className="form-group">
                <label>Nom d'utilisateur :</label>
                <div className="input-container">
                  <FaUserShield className="icon2" />
                  <input 
                    type="text" 
                    value={loginusername} 
                    onChange={(e) => setLoginUsername(e.target.value)} 
                    required 
                    placeholder="Entrez votre nom d'utilisateur" 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mot de passe :</label>
                <div className="input-container">
                  <BsFillShieldLockFill className="icon2" />
                  <input 
                    type="password" 
                    value={loginpassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    required 
                    placeholder="Entrez votre mot de passe" 
                  />
                </div>
              </div>
              <button type="submit" className="btn1">
                Se connecter <AiOutlineSwapRight className="icon3" />
              </button>
              <div className="forgot-link">
                <p onClick={() => setIsForgotPassword(true)} style={{ cursor: "pointer", color: "#4f46e5", fontWeight: "500" }}>
                  Mot de passe oublié ?
                </p>
              </div>
              <div className="form-footer">
                <p>Je n'ai pas de compte ? <Link to="/inscription">S'inscrire</Link></p>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1>Mot de passe oublié ?</h1>

            {step === 1 && (
              <form onSubmit={handleSendCode} className="auth-form">
                <p>Entre ton email, on t'envoie un code de validation.</p>
                <div className="form-group">
                  <div className="input-container">
                    <FaEnvelope className="icon2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="ton@email.com"
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn1">
                  {loading ? "Envoi en cours..." : "Envoyer le code"}
                </button>
                <button 
                  type="button"
                  className="back-btn" 
                  onClick={() => { 
                    setIsForgotPassword(false); 
                    setStep(1); 
                   
                  setMessage(''); setCode(['', '', '', '', '', '']); }}>
                  <AiOutlineArrowLeft /> Retour à la connexion
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={verifyCode} className="auth-form">
                <p>Entre le code à 6 chiffres envoyé à <strong>{email}</strong></p>
                <div className="otp-container">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="otp-input"
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading || fullCode.length !== 6} className="btn1">
                  {loading ? "Vérification..." : "Vérifier le code"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setStep(1)}>
                  Changer d'email
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="auth-form">
                <p>Crée ton nouveau mot de passe sécurisé</p>

                <div className="form-group">
                  <label>Nouveau mot de passe :</label>
                  <div className="input-container">
                    <BsFillShieldLockFill className="icon2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe :</label>
                  <div className="input-container">
                    <BsFillShieldLockFill className="icon2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn1">
                  {loading ? "Enregistrement..." : "Confirmer le changement"}
                </button>

                <button type="button" className="btn-cancel" onClick={() => setStep(2)}>
                  Retour au code
                </button>
              </form>
            )}

            {message && (
              <div className={`message ${message.includes('succès') || message.includes('envoyé') || message.includes('validé') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            </>
         )}
       </div>
    </div>
  ); };

 export default Connexion;