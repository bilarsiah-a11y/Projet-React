import React from "react";
import "../Crud/AfficherProfil.css";

const AfficherProfil = ({ profildata, hasProfile }) => {
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  const displayValue = (value) => (value ? value : "—");

  if (!hasProfile) {
    return (
      <div className="profil-dentiste-section">
        <div className="section-header">
          <h3>Profil professionnel</h3>
          <div className="alert alert-info">
            <p>Vous n'avez pas encore de profil professionnel. Cliquez sur "Ajouter infos" pour créer votre profil.</p>
          </div>
        </div>
        <div className="no-profile">
          <p>Aucune information professionnelle disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-dentiste-section">
      <div className="section-header">
        <h3>Profil professionnel</h3>
      </div>
      
      <div className="info-grid">
        <div className="info-item">
          <strong>Nom :</strong> {displayValue(profildata.Nom)}
        </div>
        <div className="info-item">
          <strong>Prénom :</strong> {displayValue(profildata.Prenom)}
        </div>
        <div className="info-item">
          <strong>Date de naissance :</strong> {formatDate(profildata.Date)}
        </div>
        <div className="info-item">
          <strong>Lieu de naissance :</strong> {displayValue(profildata.Lieu)}
        </div>
        <div className="info-item">
          <strong>Genre :</strong> {displayValue(
            profildata.genre === 'homme' ? 'Homme' : 
            profildata.genre === 'femme' ? 'Femme' : 
            profildata.genre
          )}
        </div>
        <div className="info-item">
          <strong>Adresse :</strong> {displayValue(profildata.Adresse)}
        </div>
        <div className="info-item">
          <strong>Contact :</strong> {displayValue(profildata.Contact)}
        </div>
        <div className="info-item">
          <strong>Autre contact :</strong> {displayValue(profildata.AutreContact)}
        </div>
        <div className="info-item">
          <strong>Numéro d'ordre :</strong> {displayValue(profildata.NumOrdre)}
        </div>
        <div className="info-item">
          <strong>Titre :</strong> {displayValue(profildata.Titre)}
        </div>
        <div className="info-item">
          <strong>Fonction :</strong> {displayValue(profildata.Domaine)}
        </div>
        <div className="info-item">
          <strong>Région :</strong> {displayValue(profildata.Region)}
        </div>
      </div>
    </div>
  );
};

export default AfficherProfil;