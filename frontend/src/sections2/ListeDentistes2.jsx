import React, { useState, useEffect, useMemo } from "react";
import Axios from "axios";
import { Search, MapPin, Phone, Award, User, GraduationCap } from "lucide-react";
import "../sections2Css/ListeDentistes2.css";

const regionsList = [
  "Alaotra Mangoro", "Antsinanana", "Anosy", "Analanjirofo", "Atsimo Andrefana",
  "Amoron'i Mania", "Atsimo Atsinanana", "Analamanga", "Androy", "Boeny",
  "Betsiboka", "Bongolava", "Betsimisaraka", "Diana", "Haute Matsiatra",
  "Itasy", "Ihorombe", "Melaky", "Menabe", "Sofia",
  "Vakinankaratra", "Vatovavy Fitovinany"
];

const titresList = [
  "Docteur",
  "Professeur",
  "Docteur Spécialiste"
];

const ListeDentistes2 = () => {
  const [dentistes, setDentistes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les 3 filtres
  const [searchNom, setSearchNom] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedTitre, setSelectedTitre] = useState("");

  useEffect(() => {
    const fetchDentistes = async () => {
      setLoading(true);
      try {
        const res = await Axios.get('http://localhost:3002/ListeDentiste2');
        setDentistes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDentistes();
  }, []);

  // Filtrage des dentistes selon les 3 critères
  const filteredDentistes = useMemo(() => {
    return dentistes.filter(dentiste => {
      // Filtre par nom (nom OU prénom)
      const nomMatch = !searchNom.trim() || 
        dentiste.Nom?.toLowerCase().includes(searchNom.toLowerCase()) ||
        dentiste.Prenom?.toLowerCase().includes(searchNom.toLowerCase());
      
      // Filtre par région
      const regionMatch = !selectedRegion || dentiste.Region === selectedRegion;
      
      // Filtre par titre
      const titreMatch = !selectedTitre || dentiste.Titre === selectedTitre;
      
      return nomMatch && regionMatch && titreMatch;
    });
  }, [dentistes, searchNom, selectedRegion, selectedTitre]);

  const getImageUrl = (profileImage) => {
    if (!profileImage) return "/default-avatar.png";
    if (profileImage.startsWith("http")) return profileImage;
    return `http://localhost:3002/uploads/${profileImage}`;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Non renseigné";
    // Format malgache: 038 08 143 39
    if (phone.length === 10) {
      return phone.replace(/(\d{3})(\d{2})(\d{3})(\d{2})/, '$1 $2 $3 $4');
    }
    return phone;
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchNom || selectedRegion || selectedTitre;

  return (
    <div className="annuaire-prive">
      {/* Header */}
      <div className="annuaire-header">
        <h1>🦷 Annuaire des Collègues Dentistes</h1>
        <p>Recherchez vos collègues par nom, région ou titre</p>
      </div>

      {/* Section des 3 filtres */}
      <div className="filtres-triples">
        {/* 1. Recherche par Nom */}
        <div className="filtre-item">
          <div className="filtre-header">
            <User size={18} />
            <h3>Nom / Prénom</h3>
          </div>
          <div className="filtre-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Entrez un nom ou prénom..."
              value={searchNom}
              onChange={(e) => setSearchNom(e.target.value)}
            />
            {searchNom && (
              <button 
                className="clear-btn"
                onClick={() => setSearchNom("")}
                title="Effacer"
              >
                ×
              </button>
            )}
          </div>
          <div className="filtre-info">
            {searchNom ? `Recherche : "${searchNom}"` : "Tapez un Nom ou Prénom"}
          </div>
        </div>

        {/* 2. Filtre par Région */}
        <div className="filtre-item">
          <div className="filtre-header">
            <MapPin size={18} />
            <h3>Région</h3>
          </div>
          <div className="filtre-select">
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">Toutes les régions</option>
              {regionsList.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="filtre-info">
            {selectedRegion ? `Région : ${selectedRegion}` : "Sélectionnez une région"}
          </div>
        </div>

        {/* 3. Filtre par Titre */}
        <div className="filtre-item">
          <div className="filtre-header">
            <GraduationCap size={18} />
            <h3>Titre professionnel</h3>
          </div>
          <div className="filtre-select">
            <select 
              value={selectedTitre} 
              onChange={(e) => setSelectedTitre(e.target.value)}
            >
              <option value="">Tous les titres</option>
              {titresList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="filtre-info">
            {selectedTitre ? `Titre : ${selectedTitre}` : "Sélectionnez un titre"}
          </div>
        </div>
      </div>
      {hasActiveFilters && (
        <div className="filtres-compteur">
          <span className="compteur-text">
            {filteredDentistes.length} résultat{filteredDentistes.length !== 1 ? 's' : ''} trouvé{filteredDentistes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Statistiques */}
      {/* <div className="stats-simples">
        <div className="stat-item">
          <span className="stat-number">{dentistes.length}</span>
          <span className="stat-label">Dentistes au total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredDentistes.length}</span>
          <span className="stat-label">Résultats filtrés</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {new Set(dentistes.map(d => d.Region)).size}
          </span>
          <span className="stat-label">Régions</span>
        </div>
      </div> */}

      {/* Liste des dentistes */}
      <div className="liste-dentistes">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des dentistes...</p>
          </div>
        ) : filteredDentistes.length === 0 ? (
          <div className="empty-state">
            <p>Aucun dentiste ne correspond à vos critères</p>
            {hasActiveFilters && (
              <div className="suggestion-text">
                Essayez de modifier vos critères de recherche
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="dentistes-liste-horizontale">
              {filteredDentistes.map((dentiste, index) => (
                <div key={index} className="dentiste-horizontal">
                  {/* Colonne Image */}
                  <div className="colonne-image">
                    <img
                      src={getImageUrl(dentiste.profileImage)}
                      alt={`${dentiste.Prenom} ${dentiste.Nom}`}
                      className="avatar-horizontal"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>

                  {/* Colonne Informations */}
                  <div className="colonne-infos">
                    <div className="infos-principales">
                      <h3>
                        <span className="dentiste-nom">{dentiste.Nom} {dentiste.Prenom}</span>
                      </h3>
                      
                      <div className="metadonnees">
                        {dentiste.NumOrdre && (
                          <div className="ordre-info-horizontal">
                            <Award size={14} />
                            <span>N° {dentiste.NumOrdre}</span>
                          </div>
                        )}
                        
                        {dentiste.Domaine && (
                          <span className="domaine-badge">{dentiste.Domaine}</span>
                        )}
                        {dentiste.Region && (
                            <span className="region-text strong">{dentiste.Region}</span>
                          )}
                      </div>
                    </div>

                    <div className="infos-details">
                      <div className="detail-row">
                        <MapPin size={14} />
                        <div className="location-text">
                      
                          {dentiste.Adresse && (
                            <span className="adresse">{dentiste.Adresse}</span>
                          )}
                        </div>
                      </div>

                      {dentiste.Contact && (
                        <div className="detail-row">
                          <Phone size={14} />
                          <span className="phone-number">
                            {formatPhoneNumber(dentiste.Contact)}
                          </span>
                        </div>
                      )}

                      {dentiste.email && (
                        <div className="detail-row">
                          <span className="email-icon">✉️</span>
                          <span className="email-link">
                            {dentiste.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListeDentistes2;