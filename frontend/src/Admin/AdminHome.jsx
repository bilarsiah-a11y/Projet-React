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
    axios.get("http://localhost:3002/admin/stats")
      .then(res => {
        console.log("Stats reçues:", res.data);
        setStats(res.data);
      })
      .catch(err => console.log("Erreur stats:", err));

    axios.get("http://localhost:3002/admin/recent")
      .then(res => {
        console.log("Profils récents reçus:", res.data);
        setProfilsRecents(res.data);
      })
      .catch(err => console.log("Erreur profils récents:", err));
  }, []);

  const getNomComplet = (profil) => {
    return `${profil.Prenom || ''} ${profil.Nom || ''}`.trim();
  };

  const getInitiales = (profil) => {
    const nomComplet = getNomComplet(profil);
    return nomComplet.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleGenerateReport = () => {
    alert('Génération du rapport mensuel en cours...');
  };

  return (
    <div className="admin-accueil">
      <div className="admin-main-content">

        {/* Header */}
        <header className="admin-header">
          <div className="admin-welcome">
            <h1>Tableau de Bord Administrateur</h1>
            <p>Gestion de la plateforme SourireGuide</p>
          </div>

          <div className="admin-actions">
            <Link to="/admin/liste" className="btn-admin primary">
              ⚡ Valider les profils ({stats.pending})
            </Link>
            <button className="btn-admin secondary" onClick={handleGenerateReport}>
              📊 Rapport mensuel
            </button>
          </div>
        </header>

        {/* STATS RAPIDES */}
        <div className="quick-stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">👨‍⚕️</div>
            <div className="stat-content">
              <h3>Total Dentistes</h3>
              <span className="stat-number">{stats.totalDentistes}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-content">
              <h3>En Attente</h3>
              <span className="stat-number">{stats.pending}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon regions">🗺️</div>
            <div className="stat-content">
              <h3>Régions</h3>
              <span className="stat-number">{stats.regions}/22</span>
            </div>
          </div>
        </div>

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

              {/* Statistiques supprimées du tableau de bord */}
            </div>
          </section>

          {/* Profils récents */}
          <section className="profils-recents">
            <h2>👨‍⚕️ Derniers profils ajoutés</h2>

            <div className="profils-list">
              {profilsRecents.length > 0 ? (
                profilsRecents.map((profil, index) => (
                  <div key={index} className="profil-item">
                    <div className="profil-avatar">{getInitiales(profil)}</div>
                    <div className="profil-info">
                      <h4>{getNomComplet(profil)}</h4>
                      <p>{profil.Region}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucun profil récent.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminHome;
