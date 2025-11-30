import React, { useState } from "react";
import "../Crud/Ajouter.css";
import Axios from "axios";

const Ajouter = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    date: "",
    lieu: "",
    genre: "",
    adresse: "",
    numordre: "",
    contact: "",
    autreContact: "",
    titre: "",
    domaine: "",
    region: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const requiredFields = [
      "nom", "prenom", "date", "lieu", "genre", "adresse",
      "numordre", "contact", "titre", "domaine", "region",
    ];

    const emptyField = requiredFields.find((field) => !formData[field]);
    if (emptyField) {
      alert(`Veuillez remplir le champ: ${emptyField}`);
      return;
    }

   try {
      const response = await Axios.post(
        'http://localhost:3002/Ajouter',
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log("✅ Réponse backend :", response.data);
      alert("Profil créé avec succès !");

       if (onSuccess) {
        onSuccess();
      }
      console.log("Réponse backend:", response.data);
      alert("Profil créé avec succès !");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Erreur complète:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Erreur lors de la création du profil");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Créer votre profil</h2>
        <form onSubmit={handleSubmit}>
          {/* Vos champs de formulaire */}
          <label>Nom :</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />

          <label>Prénom :</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />

          <label>Date de naissance :</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />

          <label>Lieu de naissance :</label>
          <input type="text" name="lieu" value={formData.lieu} onChange={handleChange} required />

          <label>Genre :</label>
          <select name="genre" value={formData.genre} onChange={handleChange} required>
            <option value="">-- Sélectionnez --</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>

          <label>Adresse :</label>
          <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} required />

          <label>Numéro d'ordre :</label>
          <input type="text" name="numordre" value={formData.numordre} onChange={handleChange} required />

          <label>Contact :</label>
          <input type="tel" name="contact" value={formData.contact} onChange={handleChange} required />

          <label>Autre contact :</label>
          <input type="text" name="autreContact" value={formData.autreContact} onChange={handleChange} />

          <label>Titre :</label>
          <select name="titre" value={formData.titre} onChange={handleChange} required>
            <option value="">-- Sélectionnez --</option>
            <option value="Docteur">Docteur</option>
            <option value="Professeur">Professeur</option>
            <option value="Docteur Spécialiste">Docteur Spécialiste</option>
          </select>

          {/* CHAMP DOMAINE - BIEN CONFIGURÉ */}
          <label>Fonction :</label>
          <select name="domaine" value={formData.domaine} onChange={handleChange} required>
            <option value="">-- Sélectionnez --</option>
            <option value="Fonctionnaire">Fonctionnaire</option>
            <option value="Privé">Privé</option>
            <option value="Libéral">Libéral</option>
          </select>

          <label>Région :</label>
          <select name="region" value={formData.region} onChange={handleChange} required>
            <option value="">-- Sélectionnez --</option>
            <option value="Alaotra Mangoro">Alaotra Mangoro</option>
            <option value="Analamanga">Analamanga</option>
            {/* ... autres régions ... */}
          </select>

          <div className="button-container">
            <button type="submit" className="btn-submit">Créer le profil</button>
            <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Ajouter;