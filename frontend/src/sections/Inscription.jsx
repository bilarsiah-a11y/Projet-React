import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import Axios from 'axios';
import "../sectionsCss/Inscription.css"
import logo2 from '../image/logo2.jpg';

const Inscription = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  const navigate = useNavigate();

  // Vérifier le statut périodiquement si l'utilisateur est en attente
  useEffect(() => {
    let interval;
    if (message.includes('attente') && email) {
      interval = setInterval(() => {
        checkUserStatus();
      }, 5000); // Vérifier toutes les 5 secondes
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
            navigate('/connexion', { state: { username, password } });
          }, 3000);
        } else if (status === 'rejected') {
          setMessage(`Inscription refusée: ${admin_notes || 'Raison non spécifiée'}`);
          setMessageType('error');
        }
        // Si toujours 'pending', on ne fait rien
      })
      .catch(error => {
        console.error('Erreur vérification statut:', error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        setMessageType('warning'); // Message d'attente
        
        // Ne pas vider les champs immédiatement
        // On garde l'email pour vérifier le statut

        // Vérifier le statut après 3 secondes
        setTimeout(() => {
          checkUserStatus();
        }, 3000);
      })
      .catch((error) => {
        console.error('Erreur:', error);
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

  return (
    <div className="inscription-container">
      <div className="image-side">
        <img src={logo2} alt="Cabinet dentaire" />
      </div>

      <div className="form-side">
        <h1>Inscription</h1>

        {message && (
          <div className={getMessageClass()}>
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <div className="input-wrapper">
              <FaUserShield className="icon" />
              <input
                type="text"
                placeholder="Entrer votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <MdOutlineMail className="icon" />
              <input
                type="email"
                placeholder="Entrer votre Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <BsFillShieldLockFill className="icon" />
              <input
                type="password"
                placeholder="Entrer votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn3" type="submit">S'inscrire</button>

          <p className="login-text">
            J'ai déjà un compte ? <Link to="/connexion">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Inscription;