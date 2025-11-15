import React, { useState } from "react";
import Axios from "axios";
import "./Ajouter.css";

const Ajouter = ({ onClose }) => {
  const [formData, setFormData] = useState({
    Nom: "",
    Prenom: "",
    Date: "",
    Lieu: "",
    genre: "",
    Adresse: "",
    NumOrdre: "",
    Contact: "",
    AutreContact: "",
    Titre: "",
    Domaine: "",
    Region: ""
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const requiredFields = [
      "Nom", "Prenom", "Date", "Lieu", "genre", "Adresse",
      "NumOrdre", "Contact", "Titre", "Domaine", "Region"
    ];

    const emptyField = requiredFields.find(field => !formData[field]);
    if (emptyField) {
      alert(`Veuillez remplir le champ obligatoire: ${emptyField}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Données envoyées:", formData); 

      const response = await Axios.post(
        "http://localhost:3002/Ajouter",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Fermer">×</button>
        <h2>Vos informations</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom :</label>
          <input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required />

          <label>Prénom :</label>
          <input type="text" name="Prenom" value={formData.Prenom} onChange={handleChange} required />

          <label>Date de naissance :</label>
          <input type="date" name="Date" value={formData.Date} onChange={handleChange} required />

          <label>Lieu :</label>
          <input type="text" name="Lieu" value={formData.Lieu} onChange={handleChange} required />

          <label>Genre :</label>
          <select name="genre" value={formData.genre} onChange={handleChange} required>
            <option value="" disabled>-- Sélectionnez --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <label>Adresse :</label>
          <input type="text" name="Adresse" value={formData.Adresse} onChange={handleChange} required />

          <label>Numéro d'ordre :</label>
          <input type="text" name="NumOrdre" value={formData.NumOrdre} onChange={handleChange} required />

          <label>Contact :</label>
          <input type="tel" name="Contact" value={formData.Contact} onChange={handleChange} required />

          <label>Autre contact :</label>
          <input type="text" name="AutreContact" value={formData.AutreContact} onChange={handleChange} />

          <label>Titre :</label>
          <select name="Titre" value={formData.Titre} onChange={handleChange} required>
            <option value="" disabled>-- Sélectionnez --</option>
            <option value="Docteur">Docteur</option>
            <option value="Professeur">Professeur</option>
            <option value="Docteur Spécialiste">Docteur Spécialiste</option>
          </select>

          <label>Domaine :</label>
          <select name="Domaine" value={formData.Domaine} onChange={handleChange} required>
            <option value="" disabled>-- Sélectionnez --</option>
            <option value="Fonctionnaire">Fonctionnaire</option>
            <option value="Privé">Privé</option>
            <option value="Libéral">Libéral</option>
          </select>

          <label>Région :</label>
          <select name="Region" value={formData.Region} onChange={handleChange} required>
            <option value="" disabled>-- Sélectionnez --</option>
            <option value="Alaotra Mangoro">Alaotra Mangoro</option>
            <option value="Antsinanana">Antsinanana</option>
            <option value="Anosy">Anosy</option>
            <option value="Analanjirofo">Analanjirofo</option>
            <option value="Atsimo Andrefana">Atsimo Andrefana</option>
            <option value="Amoron'i Mania">Amoron'i Mania</option>
            <option value="Atsimo Atsinanana">Atsimo Atsinanana</option>
            <option value="Analamanga">Analamanga</option>
            <option value="Androy">Androy</option>
            <option value="Boeny">Boeny</option>
            <option value="Betsimisaraka">Betsimisaraka</option>
            <option value="Bongolava">Bongolava</option>
            <option value="Diana">Diana</option>
            <option value="Haute Matsiatra">Haute Matsiatra</option>
            <option value="Itasy">Itasy</option>
            <option value="Ihorombe">Ihorombe</option>
            <option value="Melaky">Melaky</option>
            <option value="Menabe">Menabe</option>
            <option value="Sofia">Sofia</option>
            <option value="Vakinakatrana">Vakinakatrana</option>
            <option value="Vatovavy Fitovinany">Vatovavy Fitovinany</option>
          </select>

          <div className="button-container">
            <button type="submit" className="btn-submit">Enregistrer</button>
            <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Ajouter;
