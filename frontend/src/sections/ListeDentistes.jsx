import React, { useState, useEffect } from "react";
import Axios from "axios";
import "../sectionsCss/ListeDentistes.css";

const regionsList = [
  "Alaotra Mangoro", "Antsinanana", "Anosy", "Analanjirofo", "Atsimo Andrefana",
  "Amoron'i Mania", "Atsimo Atsinanana", "Analamanga", "Androy", "Boeny",
  "Betsiboka", "Bongolava", "Betsimisaraka", "Diana", "Haute Matsiatra",
  "Itasy", "Ihorombe", "Melaky", "Menabe", "Sofia",
  "Vakinankaratra", "Vatovavy Fitovinany"
];

const ListeDentistes = () => {
  const [region, setRegion] = useState("Analamanga");
  const [dentistes, setDentistes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDentistes = async () => {
      setLoading(true);
      try {
        const res = await Axios.get(`http://localhost:3002/ListeDentiste2?region=${region}`);
        setDentistes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDentistes();
  }, [region]);

  const getImageUrl = (profileImage) => {
    if (!profileImage) return "/default-avatar.png";
    if (profileImage.startsWith("http")) return profileImage;
    return `http://localhost:3002/uploads/${profileImage}`;
  };

  return (
    <div className="annuaire-simple">

      {/* TITRE SIMPLE, SANS DÉCO */}
      <div className="header-simple">
        <h1>ANNUAIRE DES DENTISTES</h1>
        <p>Madagascar 2025</p>
      </div>

      {/* FILTRE */}
      <div className="filter-simple">
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          {regionsList.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* LISTE COMPACTE */}
      <div className="liste-simple">
        {loading ? (
          <p className="loading">Chargement...</p>
        ) : dentistes.length === 0 ? (
          <p className="no-result">Aucun dentiste dans cette région pour le moment</p>
        ) : (
          dentistes.map((d, i) => (
            <div key={i} className="dentiste-ligne">
              <img
                src={getImageUrl(d.profileImage)}
                alt={`${d.Prenom} ${d.Nom}`}
                className="photo-petite"
                onError={(e) => e.target.src = "/default-avatar.png"}
              />
              <div className="infos">
                <strong>{d.Titre || "Dr"} {d.Prenom} {d.Nom}</strong>
                <span>{d.Adresse || d.Region}</span>
                <span>Tél : {d.Contact || d.AutreContact || "Non renseigné"}</span>
                <span>N° Ordre : {d.NumOrdre || "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListeDentistes;