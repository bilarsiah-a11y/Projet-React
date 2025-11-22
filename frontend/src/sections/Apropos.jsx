// src/pages/AccueilPublic.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../sectionsCss/Apropos.css";

const Apropos = () => {
  return (
    <div className="accueil-court">

      {/* HERO TOUT-EN-UN */}
      <section className="hero">
        <div className="container">

          <h1>
            Trouvez votre dentiste<br />
            dans <span className="red">toutes les régions</span> de Madagascar
          </h1>

          <p className="slogan">
            Un beau sourire, partout à Mada
          </p>

          <div className="actions">
            <Link to="/listedentistes" className="btn big primary">
              Voir les dentistes
            </Link>
            <Link to="/connexion" className="btn big secondary">
              Espace dentiste
            </Link>
          </div>

          {/* Mini liste des régions – juste pour montrer la couverture */}
          <div className="regions-mini">
            <p>Présent dans les 22 régions :</p>
            <div className="tags">
              {["Analamanga", "Antsinanana", "Diana", "Boeny", "Atsimo Andrefana", "Haute Matsiatra", "Vakinankaratra", "Androy", "Anosy", "Menabe", "Sofia", "Alaotra Mangoro", "+ 10 autres"].map((r, i) => (
                <span key={i} className="tag">{r}</span>
              ))}
            </div>
          </div>

          {/* Pour les dentistes */}
          <div className="dentist-cta">
            <p>Vous êtes dentiste ?</p>
            <Link to="/inscription" className="link">
              → Créer gratuitement votre profil
            </Link>
          </div>

        </div>
      </section>

      {/* Petit footer discret */}
      <footer className="mini-footer">
        <p>© 2025 SourireGuide – Le sourire malgache connecté</p>
      </footer>
    </div>
  );
};

export default Apropos;