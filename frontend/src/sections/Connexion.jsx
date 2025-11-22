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

  // =================== États Connexion ===================
  const [loginusername, setLoginUsername] = useState('');
  const [loginpassword, setLoginPassword] = useState('');

  // =================== États Reset Password ===================
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = code OTP, 3 = nouveaux mdp
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 cases
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const fullCode = code.join('');

  // Focus automatique sur la première case OTP
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Gestion des 6 cases OTP
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

  // =================== Connexion classique ===================
  const loginUser = async (e) => {
    e.preventDefault();
    try {
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
      alert(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  // =================== Étape 1 : Envoi code ===================
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

  // =================== Étape 2 : Vérification code ===================
  const verifyCode = async (e) => {
    e.preventDefault();
    if (fullCode.length !== 6) return setMessage("Entre les 6 chiffres");
    setLoading(true);
    setMessage('');
    try {
      const res = await Axios.post("http://localhost:3002/reset-password-with-code", {
        email,
        code: fullCode,
        newPassword: "temp123456",
        confirmPassword: "temp123456"
      });
      if (res.data.success) {
        setMessage("Code validé ! 🎉");
        setTimeout(() => {
          setStep(3);
          setMessage('');
        }, 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  // =================== Étape 3 : Nouveau mot de passe ===================
const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (newPassword !== confirmPassword) {
      return setMessage("Les mots de passe ne correspondent pas");
    }
    if (newPassword.length < 6) {
      return setMessage("Le mot de passe doit contenir au moins 6 caractères");
    }

    setLoading(true);
    setMessage('');

    try {
      console.log("Envoi des données à l'API:", {
        email: email,
        code: fullCode,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });

      // Appel API avec gestion d'erreur améliorée
      const res = await Axios.post("http://localhost:3002/reset-password-with-code", {
        email: email,
        code: fullCode,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      }, {
        timeout: 10000, // Timeout de 10 secondes
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Réponse API complète:", res);
      console.log("Données de réponse:", res.data);

      // Vérification du succès
      if (res.data.success === true || res.data.message?.includes("succès")) {
        setMessage("✅ Mot de passe changé avec succès !");
        
        // Redirection automatique après succès
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        // Si l'API retourne success: false mais sans erreur spécifique
        setMessage(res.data.message || "Erreur lors du changement de mot de passe");
      }

    } catch (err) {
      console.error("Erreur détaillée:", err);
      console.error("Réponse d'erreur:", err.response);
      
      // Gestion détaillée des erreurs
      if (err.response) {
        // Erreur avec réponse du serveur (400, 500, etc.)
        const errorData = err.response.data;
        console.error("Données d'erreur:", errorData);
        
        if (err.response.status === 400) {
          // Bad Request - données invalides
          setMessage(errorData.error || errorData.message || "Données invalides. Vérifiez le code et réessayez.");
        } else if (err.response.status === 404) {
          // Not Found
          setMessage("Code expiré ou invalide. Veuillez demander un nouveau code.");
        } else if (err.response.status === 500) {
          // Internal Server Error
          setMessage("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          // Autre erreur HTTP
          setMessage(errorData.error || errorData.message || `Erreur ${err.response.status}`);
        }
      } else if (err.request) {
        // Erreur de réseau (pas de réponse)
        setMessage("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
      } else {
        // Erreur inattendue
        setMessage("Une erreur inattendue s'est produite : " + err.message);
      }
    } finally {
      setLoading(false);
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


  // =================== RENDU ===================
  return (
    <div className="login-section">
      <div className="login-container">
        <img src={logo} alt="Logo" className="login-logo" />

        {/* =================== CONNEXION CLASSIQUE =================== */}
        {!isForgotPassword ? (
          <>
            <h1>Veuillez-vous connecter</h1>
            <form className="auth-form" onSubmit={loginUser}>
              <div className="form-group">
                <label>Nom d'utilisateur :</label>
                <div className="input-container">
                  <FaUserShield className="icon2" />
                  <input type="text" value={loginusername} onChange={(e) => setLoginUsername(e.target.value)} required placeholder="Entrez votre nom d'utilisateur" />
                </div>
              </div>
              <div className="form-group">
                <label>Mot de passe :</label>
                <div className="input-container">
                  <BsFillShieldLockFill className="icon2" />
                  <input type="password" value={loginpassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="Entrez votre mot de passe" />
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
            <button className="back-btn" onClick={() => { setIsForgotPassword(false); setStep(1); setMessage(''); setCode(['', '', '', '', '', '']); }}>
              <AiOutlineArrowLeft /> Retour à la connexion
            </button>
            <h1>Mot de passe oublié ?</h1>

            {/* ÉTAPE 1 : EMAIL */}
            {step === 1 && (
              <form onSubmit={handleSendCode} className="auth-form">
                <p>Entre ton email, on t’envoie un code de validation.</p>
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
              </form>
            )}

            {/* ÉTAPE 2 : 6 CASES OTP */}
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

            {/* ÉTAPE 3 : NOUVEAUX MOTS DE PASSE */}
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

            {/* Messages */}
            {message && (
              <div className={`message ${message.includes('succès') || message.includes('envoyé') || message.includes('validé') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Connexion;


