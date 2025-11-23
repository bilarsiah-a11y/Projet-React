// src/pages/AccueilAdmin.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../AdminCss/AdminHome.css";

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalDentistes: 0,
    pending: 0,
    verified: 0,
    regions: 0,
  });

  const [profilsRecents, setProfilsRecents] = useState([]);
  
  useEffect(() => {
    // CORRECTION : Ajout du / manquant dans les URLs
    axios.get("http://localhost:3002/admin/stats")
      .then(res => {
        console.log("Stats reçues:", res.data); // Pour debug
        setStats(res.data);
      })
      .catch(err => console.log("Erreur stats:", err));

    axios.get("http://localhost:3002/admin/recent")
      .then(res => {
        console.log("Profils récents reçus:", res.data); // Pour debug
        setProfilsRecents(res.data);
      })
      .catch(err => console.log("Erreur profils récents:", err));
  }, []);

  // Fonction pour formater le nom complet
  const getNomComplet = (profil) => {
    return `${profil.Prenom || ''} ${profil.Nom || ''}`.trim();
  };

  // Fonction pour les initiales
  const getInitiales = (profil) => {
    const nomComplet = getNomComplet(profil);
    return nomComplet.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="admin-accueil">
      <div className="admin-main-content">

        {/* Header */}
        <header className="admin-header">
          <div className="admin-welcome">
            <h1>Gestion des Profils Dentistes</h1>
            <p>Administration de la plateforme SourireGuide</p>
          </div>

          <div className="admin-actions">
            <Link to="/admin/liste" className="btn-admin primary">
              ⚡ Valider les profils ({stats.pending})
            </Link>
            <button className="btn-admin secondary">📊 Rapport mensuel</button>
          </div>
        </header>

        {/* CONTENT GRID */}
        <div className="admin-content-grid">

          {/* Modération */}
          <section className="moderation-section">
            <h2>🛡️ Modération en attente</h2>

            <div className="moderation-actions">
              <Link to="/admin/liste" className="moderation-card urgent">
                <div className="moderation-icon">✅</div>
                <div className="moderation-content">
                  <h3>Profils à valider</h3>
                  <p>{stats.pending} inscriptions en attente</p>
                  <span className="moderation-alert">Action requise</span>
                </div>
              </Link>

              
            </div>
          </section>

          {/* Profils récents */}
          <section className="profils-recents">
            <h2>👨‍⚕️ Derniers profils ajoutés</h2>

            <div className="profils-list">
              {profilsRecents.length > 0 ? (
                profilsRecents.map((profil, index) => (
                  <div key={index} className="profil-item">
                    <div className="profil-avatar">
                      {getInitiales(profil)}
                    </div>

                    <div className="profil-info">
                      <h4>{getNomComplet(profil)}</h4>
                      <p>Dentiste</p>
                      <span className="profil-region">📍 {profil.Region || "Inconnue"}</span>
                    </div>

                    <div className="profil-date">
                      {profil.created_at ? new Date(profil.created_at).toLocaleDateString("fr-FR") : "Date inconnue"}
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucun profil récent.</p>
              )}
            </div>

            <Link to="/admin/liste" className="voir-plus">
              Voir tous les profils →
            </Link>
          </section>

        </div>

        {/* OUTILS ADMIN */}
        <section className="admin-tools">
          <h2>🛠️ Outils d'administration</h2>

          <div className="tools-grid">
            

            <Link to="/admin/liste" className="tool-card">
              <div className="tool-icon">🎯</div>
              <span>Spécialités dentaires</span>
            </Link>

            <Link to="/admin/analytics" className="tool-card">
              <div className="tool-icon">📊</div>
              <span>Analytics détaillés</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminHome;

