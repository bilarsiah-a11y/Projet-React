
import React, { useState, useEffect } from "react";
import Axios from "axios";
//import "./Listedentiste2.css";

const AdminListe = () => {
  
  const regionsList = [
    "Alaotra Mangoro", "Antsinanana", "Anosy", "Analanjirofo", "Atsimo Andrefana",
    "Amoron'i Mania", "Atsimo Atsinanana", "Analamanga", "Androy", "Boeny",
    "Betsiboka", "Bongolava", "Betsimisaraka", "Diana", "Haute Matsiatra",
    "Itasy", "Ihorombe", "Melaky", "Menabe", "Sofia",
    "Vakinankaratra", "Vatovavy Fitovinany"
  ];

  
  const [region, setRegion] = useState(regionsList);
  const [dentistes, setDentistes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔄 Charger les dentistes selon la région sélectionnée
   useEffect(() => {
    const fetchDentistes = async () => {
      setLoading(true);
      setError("");
      
      try {
        const url = region
          ? `http://localhost:3002/AdminListe?region=${region}`
          : "http://localhost:3002/AdminListe";
        const res = await Axios.get(url);
        setDentistes(res.data);
      } catch (err) {
        console.error("Erreur chargement dentistes :", err);
        setError("Impossible de charger les dentistes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDentistes();
  }, [region]);
;

  return (
    <div className="liste-dentistes-page">
      <h2>Liste des dentistes</h2>

      <div className="filter-container">
        <label htmlFor="region"> Région:</label>
        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regionsList.map((r, index) => (
            <option key={index} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="loading">Chargement...</p>}
      {error && <p className="error">{error}</p>}

      <div className="dentistes-grid">
  {dentistes.length === 0 && !loading ? (
    <p className="no-result">
      Pour le moment <br/>
      Aucun dentiste trouvé pour cette région.</p>
  ) : (
    dentistes.map((p, index) => (
      <div key={index} className="dentiste-card">
        <div className="dentiste-left">
          <img
            src={
              p.profileImage
                ? `http://localhost:3002/uploads/${p.profileImage}`
                : "/default-avatar.png"
            }
            alt="profil"
            className="dentiste-avatar"
          />
        </div>
        <div className="dentiste-right">
          <h3>{p.Nom} {p.Prenom}</h3>
          <p> {p.genre}</p>
          <p>{p.Adresse}</p>
          <p> {p.NumOrdre}</p>
          <p> {p.email}</p>
          <p> {p.Titre}</p>
          <p> {p.Domaine}</p>
          <p>{p.Region}</p>
          <button>Suprimer</button>
        </div>
      </div>
    ))
  )}
</div>
      
     

    </div>
  );
};

export default AdminListe;

