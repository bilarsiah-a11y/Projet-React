import React, { useState, useEffect } from "react";
import "../Crud/Modifier.css";
import Axios from "axios";

const Modifier = ({ onClose, profilId, currentData }) => {
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

  useEffect(() => {
    if (currentData) {
  
      setFormData({
        nom: currentData.Nom || "",
        prenom: currentData.Prenom || "",
        date: currentData.Date || "",
        lieu: currentData.Lieu || "",
        genre: currentData.genre || "",
        adresse: currentData.Adresse || "",
        numordre: currentData.NumOrdre || "",
        contact: currentData.Contact || "",
        autreContact: currentData.AutreContact || "",
        titre: currentData.Titre || "",
        domaine: currentData.Domaine || "",
        region: currentData.Region || "",
      });
    }
  }, [currentData]);
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
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // CORRECTION : Utiliser PUT au lieu de POST et inclure l'ID dans l'URL
      const token = localStorage.getItem('token');
      const response = await Axios.put(
        `http://localhost:3002/Modifier/${profilId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Réponse backend :", response.data);
      alert("Modification réussie !");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Erreur complète :", err.response?.data || err.message);
      alert(err.response?.data?.message || "Erreur lors de la modification");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Modifier vos informations</h2>
        <form onSubmit={handleSubmit}>
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
            <option value="">-- Sélectionnez votre genre --</option>
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
            <option value="">-- Sélectionnez votre titre --</option>
            <option value="Docteur">Docteur</option>
            <option value="Professeur">Professeur</option>
            <option value="Docteur Spécialiste">Docteur Spécialiste</option>
          </select>

          <label>Domaine :</label>
          <select name="domaine" value={formData.domaine} onChange={handleChange} required>
            <option value="">-- Sélectionnez votre domaine --</option>
            <option value="Fonctionnaire">Fonctionnaire</option>
            <option value="Privé">Privé</option>
            <option value="Libéral">Libéral</option>
          </select>

          {/* CORRECTION : Changer le name de "domaine" à "region" */}
          <label>Région :</label>
          <select name="region" value={formData.region} onChange={handleChange} required>
            <option value="">-- Sélectionnez votre région --</option>
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
            <option value="Betsiboka">Betsiboka</option>
            <option value="Bongolava">Bongolava</option>
            <option value="Diana">Diana</option>
            <option value="Haute Matsiatra">Haute Matsiatra</option>
            <option value="Itasy">Itasy</option>
            <option value="Ihorombe">Ihorombe</option>
            <option value="Melaky">Melaky</option>
            <option value="Menabe">Menabe</option>
            <option value="Sofia">Sofia</option>
            <option value="Vakinankaratra">Vakinankaratra</option>
            <option value="Vatovavy Fitovinany">Vatovavy Fitovinany</option>
          </select>

          <div className="button-container">
            <button type="submit" className="btn-submit">Modifier</button>
            <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modifier;