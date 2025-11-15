import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import logo from "../image/logo.png";
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";
import "../sectionsCss/Connexion.css";
import MotPasseOublier  from './MotPasseOublier';
import { Dialog } from "primereact/dialog";

const Connexion = () => {
  const navigate = useNavigate();
  const [loginusername, setLoginUsername] = useState('');
  const [loginpassword, setLoginPassword] = useState('');
  
  const loginUser = async (e) => {
    e.preventDefault();
    
    try {
      const res = await Axios.post('http://localhost:3002/Connexion', {
        Username: loginusername,
        Password: loginpassword,
      });
      
      const { token, user } = res.data;
      
      if (token && user) {
        // ✅ Stockage des infos de l'utilisateur dans le localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);          // <-- stockage du rôle
        localStorage.setItem('user', JSON.stringify(user));

        alert('Connexion réussie');

        // ✅ Redirection selon le rôle
        if (user.role === "admin") {
          navigate('/admin/home'); 
        } else {
          navigate('/profil'); 
        }
      } else {
        alert(res.data.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur de connexion !');
    }
  };

const [visiblepassword, setVisiblePassword] = useState(false);


  return (
    <div className="login-section">
      <div className="login-container">
        <img src={logo} alt="Logo" className="login-logo" />
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
            Se connecter
            <AiOutlineSwapRight className="icon3" />
          </button>
           <p className="forgot-password-link">
              <span onClick={() => setVisiblePassword(true)}>
                  Mot de passe oublié !
                 </span>
                     </p>
      <Dialog 
  visible={visiblepassword} 
  onHide={() => setVisiblePassword(false)} 
  style={{ width: "450px", maxWidth: "90vw" }}
  header={null}
  closable={false}
>
  <MotPasseOublier onClose={() => setVisiblePassword(false)} />
</Dialog>

          <div className="form-footer">
            <p>Je n'ai pas de compte ? <Link to="/inscription">S'inscrire</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Connexion;
