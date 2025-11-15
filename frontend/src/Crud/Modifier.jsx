import React, { useState } from "react";
import "./Modifier.css";
import Axios from "axios";

const Modifier = ({ onClose }) => {
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
      "nom",
      "prenom",
      "date",
      "lieu",
      "genre",
      "adresse",
      "numordre",
      "contact",
      "titre",
      "domaine",
      "region",
    ];

    const emptyField = requiredFields.find((field) => !formData[field]);
    if (emptyField) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const response = await Axios.post("http://localhost:3002/Modifier", formData);
      console.log("Réponse backend :", response.data);
      alert("Enregistrement réussi !");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Erreur complète :", err.response?.data || err.message);
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Vos informations</h2>
        <form onSubmit={handleSubmit}>
          {/* Champ texte classique */}
          <label>Nom :</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />

          <label>Prénom :</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />

          <label>Date de naissance :</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />

          <label>Lieu de naissance :</label>
          <input type="text" name="lieu" value={formData.lieu} onChange={handleChange} required />

          {/* Sélection du genre */}
          <label>Genre :</label>
          <select name="genre" value={formData.genre} onChange={handleChange} required>
            <option value="">-- Sélectionnez votre genre --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>

          <label>Adresse :</label>
          <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} required />

          <label>Numéro d'ordre :</label>
          <input type="text" name="numordre" value={formData.numordre} onChange={handleChange} required />

          <label>Contact :</label>
          <input type="tel" name="contact" value={formData.contact} onChange={handleChange} required />

          <label>Autre contact :</label>
          <input type="text" name="autreContact" value={formData.autreContact} onChange={handleChange} />

          {/* Sélection du titre */}
          <label>Titre :</label>
          <select name="titre" value={formData.titre} onChange={handleChange} required>
            <option value="">-- Sélectionnez votre titre --</option>
            <option value="Docteur">Docteur</option>
            <option value="Professeur">Professeur</option>
            <option value="Docteur Spécialiste">Docteur Spécialiste</option>
          </select>

          {/* Sélection du domaine */}
          <label>Domaine :</label>
          <select name="domaine" value={formData.domaine} onChange={handleChange} required>
            <option value="">-- Sélectionnez votre domaine --</option>
            <option value="Fonctionnaire">Fonctionnaire</option>
            <option value="Privé">Privé</option>
            <option value="Libéral">Libéral</option>
          </select>

          <label>Région :</label>
           <select name="domaine" value={formData.region} onChange={handleChange} required>
            <option value="">-- Sélectionnez votre region --</option>
            <option value="Alaotra Mongoro ">Alaotra Mongoro </option>
             <option value="Antsinana">Antsinana</option>
            <option value="Anosy">Anosy</option>
            <option value="Analanjorofo">Analanjorofo</option>
            <option value="Atsino andrefana">Atsino andrefana</option>
            <option value="Amoron'i Mania">Amoron'i Mania</option>
            <option value="Antsimo antsinanana">Antsimo antsinanana</option>
             <option value="Alaotra Mongoro ">Alaotra Mongoro </option>
            <option value="Analamanga ">Analamanga </option>
            <option value="Androy">Androy</option>
             <option value="Boeny ">Boeny </option>
            <option value="Betsimisaraka">Betsimisaraka</option>
            <option value="Bongolava ">Bongolava </option>
             <option value="Diana">Diana</option>
             <option value="haute Matsiatra ">haute Matsiatra </option>
            <option value="Itasy">Itasy</option>
            <option value="Ihorombe">Ihorombe</option>
            <option value="Melaky">Melaky</option>
            <option value="Menabe">Menabe</option>
            <option value="Sofia  ">Sofia  </option>
             <option value="Vakinakratra">Vakinakratra</option>
            <option value="Vatovavy Fitovinany ">Vatovavy Fitovinany </option>
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

export default Modifier;
