import React, { useState } from 'react';
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
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    Axios.post('http://localhost:3002/Inscription', {
      Username: username,
      Email: email,
      Password: password,
    })
      .then(() => {
        setMessage('Compte créé avec succès!');
        setUsername('');
        setEmail('');
        setPassword('');

        setTimeout(() => {
          navigate('/connexion', { state: { username, password } });
        }, 1000);
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
      });
  };

  return (
    <div className="inscription-container">
      {/* Image à gauche */}
      <div className="image-side">
        <img src={logo2} alt="Cabinet dentaire" />
      </div>

      {/* Formulaire à droite */}
      <div className="form-side">
        <h1>Inscription</h1>

        {message && (
          <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
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
