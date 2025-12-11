import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { FaUserShield, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight, AiOutlineArrowLeft } from "react-icons/ai";
import "../sectionsCss/Connexion.css";
import logo2 from '../image/logo2.jpg';

const Connexion = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // États Connexion
  const [loginusername, setLoginUsername] = useState('');
  const [loginpassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // États Reset Password
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // État pour les alertes
  const [alert, setAlert] = useState(null);

  // État pour la force du mot de passe
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });

  const inputRefs = useRef([]);
  const fullCode = code.join('');

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('8 caractères minimum');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('une majuscule');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('une minuscule');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('un chiffre');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('un caractère spécial');

    return {
      score,
      feedback: feedback.length > 0 ? `Doit contenir ${feedback.join(', ')}` : 'Mot de passe fort'
    };
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

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
    
    // Ajouter la classe filled pour le style
    if (value) {
      inputRefs.current[index]?.classList.add('filled');
    } else {
      inputRefs.current[index]?.classList.remove('filled');
    }
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    
    if (!loginusername || !loginpassword) {
      showAlert('Veuillez remplir tous les champs', 'warning');
      return;
    }

    try {
      console.log('🔍 Tentative de connexion pour:', loginusername);
      
      const res = await Axios.post('http://localhost:3002/Connexion', {
        Username: loginusername,
        Password: loginpassword,
      });
      
      const { token, user, alertType } = res.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));
        
        showAlert('Connexion réussie 👌', 'success');
        
        setTimeout(() => {
          if (user.role === "admin") {
            navigate('/admin/home');
          } else {
            navigate('/apropos2');
          }
        }, 1000);
      } else {
        showAlert(res.data.message || 'Identifiants incorrects', 'error');
      }
    } catch (err) {
      console.error('❌ Erreur connexion:', err.response?.data);
      
      if (err.response?.data?.alertType) {
        showAlert(err.response.data.message, err.response.data.alertType);
      } else if (err.response?.status === 403) {
        const errorMessage = err.response.data.message;
        showAlert(errorMessage, 'warning');
        
        if (errorMessage.includes('refusée')) {
          setTimeout(() => {
            navigate('/inscription');
          }, 3000);
        }
      } else if (err.response?.status === 401) {
        showAlert('Nom d\'utilisateur ou mot de passe incorrect', 'error');
      } else {
        showAlert(err.response?.data?.message || 'Erreur de connexion au serveur', 'error');
      }
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await Axios.post("http://localhost:3002/mot-passe-oublier", { email });
      if (res.data.success) {
        showAlert("Code envoyé avec succès ! Vérifie tes mails 📧", "success");
        setTimeout(() => {
          setStep(2);
          setMessage('');
        }, 2200);
      }
    } catch (err) {
      showAlert(err.response?.data?.error || "Erreur serveur", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    if (fullCode.length !== 6) {
      showAlert("Entre les 6 chiffres", "warning");
      return;
    }

    try {
      const res = await Axios.post("http://localhost:3002/verify-reset-code", {
        email,
        code: fullCode
      });

      if (res.data.success) {
        showAlert("Code validé ! Passe au nouveau mot de passe", "success");
        setTimeout(() => {
          setStep(3);
          setMessage('');
        }, 1500);
      }
    } catch (err) {
      showAlert(err.response?.data?.error || "Code incorrect ou expiré", "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showAlert("Les mots de passe ne correspondent pas", "warning");
      return;
    }
    
    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 3) {
      showAlert("Le mot de passe n'est pas assez fort", "warning");
      return;
    }

    try {
      const res = await Axios.post("http://localhost:3002/confirm-new-password", {
        email,
        code: fullCode,
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        showAlert("Mot de passe changé avec succès !", "success");
        setTimeout(() => {
          resetForm();
          setIsForgotPassword(false);
        }, 2000);
      }
    } catch (err) {
      showAlert(err.response?.data?.error || "Erreur lors du changement", "error");
    }
  };

  const resetForm = () => {
    setIsForgotPassword(false);
    setStep(1);
    setEmail('');
    setCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setPasswordStrength({ score: 0, feedback: '' });
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordStrength(evaluatePasswordStrength(value));
  };

  return (
    <div className="login-section">
      {isTransitioning && <div className="page-transition"></div>}
      
      {/* Alerte globale */}
      {alert && (
        <div className={`global-alert alert-${alert.type}`}>
          <div className="alert-content">
            <span className="alert-message">{alert.message}</span>
            <button 
              className="alert-close"
              onClick={() => setAlert(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

           <div className="logoimg">
            <img src={logo2} alt="Logo" className="login-logo" />
            <div className="form-footer">
                <p className="text1" >Je n'ai pas de compte ? <Link 
                  to="/inscription"  className="connect-link1"
                  onClick={() => setIsTransitioning(true)}
                >
                  S'inscrire
                </Link></p>
              </div>
           </div>

      <div className="login-container">
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
                <div className="input-container password-container">
                  <BsFillShieldLockFill className="icon2" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={loginpassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    required 
                    placeholder="Entrez votre mot de passe" 
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn1">
                Se connecter <AiOutlineSwapRight className="icon3" />
              </button>
              <div className="forgot-link">
                <p onClick={() => setIsForgotPassword(true)} style={{ cursor: "pointer", color: "#2563eb", fontWeight: "500" }}>
                  Mot de passe oublié ?
                </p>
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
                    setMessage(''); 
                    setCode(['', '', '', '', '', '']); 
                  }}
                >
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
                      className={`otp-input ${digit ? 'filled' : ''}`}
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
                  <div className="input-container password-container">
                    <BsFillShieldLockFill className="icon2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      placeholder="Nouveau mot de passe"
                      required
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className={`password-strength strength-${passwordStrength.score}`}>
                      <div className="strength-bar">
                        <div className="strength-fill"></div>
                      </div>
                      <span className="strength-text">{passwordStrength.feedback}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe :</label>
                  <div className="input-container password-container">
                    <BsFillShieldLockFill className="icon2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      required
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="password-error">Les mots de passe ne correspondent pas</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || passwordStrength.score < 3 || newPassword !== confirmPassword} 
                  className="btn1"
                >
                  {loading ? "Enregistrement..." : "Confirmer le changement"}
                </button>

                <button type="button" className="btn-cancel" onClick={() => setStep(2)}>
                  Retour au connexion
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Connexion;