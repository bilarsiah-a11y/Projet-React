import React, { useState } from "react";
import { UilTimes } from '@iconscout/react-unicons';
import '../sectionsCss/MotPasseOublier.css'
const MotPasseOublier = ({ onClose }) => {
  const [email, setEmail] = useState("");
 

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(email);

    fetch("http://localhost:3002/MotPasseOublier", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "Utilisateur enregistré");
        alert(data.status);
      })
      .catch((err) => console.error("Erreur :", err));
  };

  return (
       <div className="modal-content">
      {/* Bouton fermeture à l'intérieur */}
      <div className="dialog-header">
        <h3>Mot de passe oublié</h3>
        <UilTimes onClick={onClose} className="close-icon" />
      </div>

      <form onSubmit={handleSubmit} className="form-mot-passe">
        <label>Entrez votre email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Entrez votre mail"
        />

        <div className="btn-group">
          <button type="submit" className="btn1">
            Envoyer
          </button>
          <button type="button" onClick={onClose} className="btn-cancel">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default MotPasseOublier;
