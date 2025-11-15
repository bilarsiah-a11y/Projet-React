import React, { useState } from "react";
import Axios from "axios";
// import "./Ajouter.css";

const ModifierAdmin = ({ onClose }) => {
  const [data, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });


  
 

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Fermer">×</button>
        <h2>Modification</h2>
        <form>

          <label>Pseudonyme :</label>
          {/* <input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required /> */}

          <label>Email :</label>
          {/* <input type="text" name="Prenom" value={formData.Prenom} onChange={handleChange} required /> */}

          <label>Ancien Mot de passe :</label>
          {/* <input type="date" name="Date" value={formData.Date} onChange={handleChange} required /> */}

          <label>Nouveau Mot de passe :</label>
          {/* <input type="text" name="Lieu" value={formData.Lieu} onChange={handleChange} required /> */}

          <div className="button-container">
            <button type="submit" className="btn-submit">Enregistrer</button>
            <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierAdmin;
