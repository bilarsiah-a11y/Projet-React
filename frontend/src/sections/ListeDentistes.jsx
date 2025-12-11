import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Search, MapPin, Phone, Mail, Award, Filter } from "lucide-react";
import "../sectionsCss/ListeDentistes.css";

const regionsList = [
  "Alaotra Mangoro", "Antsinanana", "Anosy", "Analanjirofo", "Atsimo Andrefana",
  "Amoron'i Mania", "Atsimo Atsinanana", "Analamanga", "Androy", "Boeny",
  "Betsiboka", "Bongolava", "Betsimisaraka", "Diana", "Haute Matsiatra",
  "Itasy", "Ihorombe", "Melaky", "Menabe", "Sofia",
  "Vakinankaratra", "Vatovavy Fitovinany"
];

const ListeDentistes = () => {
  const [region, setRegion] = useState("");
  const [dentistes, setDentistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDentistes = async () => {
      setLoading(true);
      try {
        const url = region 
          ? `http://localhost:3002/ListeDentistes?region=${region}`
          : 'http://localhost:3002/ListeDentistes';
        const res = await Axios.get(url);
        setDentistes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDentistes();
  }, [region]);

  // Filtrer par recherche textuelle
  const filteredDentistes = dentistes.filter(d =>
    !searchTerm.trim() ||
    d.Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.Prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.Adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.Lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (profileImage) => {
    if (!profileImage) return "/default-avatar.png";
    if (profileImage.startsWith("http")) return profileImage;
    return `http://localhost:3002/uploads/${profileImage}`;
  };

  const formatContact = (contact) => {
    if (!contact) return "Non renseigné";
    // Format: 038 08 143 39
    return contact.replace(/(\d{3})(\d{2})(\d{3})(\d{2})/, '$1 $2 $3 $4');
  };

  return (
    <div className="annuaire-visiteur">

      {/* Hero Section */}
      <div className="hero-section-visiteur">
        <div className="hero-content">
          <h1>Annuaire des Dentistes de Madagascar</h1>
          <p className="hero-subtitle">Recherchez et trouvez des dentistes qualifiés près de chez vous</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="filtres-visiteur">
        <div className="search-container-visiteur">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher un dentiste par nom, ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-visiteur"
          />
        </div>
        
        <div className="region-filter-visiteur">
          <Filter size={18} />
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="region-select-visiteur"
          >
            <option value="">Toutes les régions</option>
            {regionsList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-visiteur">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="icon">🦷</span>
          </div>
          <div className="stat-content">
            <h3>{filteredDentistes.length}</h3>
            <p>Dentistes à {region && `${region}`}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="icon">📍</span>
          </div>
          <div className="stat-content">
            <h3>{new Set(filteredDentistes.map(d => d.Region)).size}</h3>
            <p>Régions représentées</p>
          </div>
        </div>
      </div>

      {/* Liste des dentistes - SIMPLIFIÉE */}
      <div className="liste-dentistes-container-simple">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des dentistes...</p>
          </div>
        ) : filteredDentistes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🦷</div>
            <h3>Aucun dentiste trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="dentistes-liste-simple">
            {/* Compteur de résultats */}
            <div className="results-counter">
              <span className="results-count">{filteredDentistes.length} dentiste(s) trouvé(s)</span>
              {region && <span className="region-filter-info"> • Filtre : {region}</span>}
            </div>
            
            {/* Liste simplifiée */}
            {filteredDentistes.map((dentiste, index) => (
              <div key={dentiste.id || index} className="dentiste-item-simple">
                
                {/* Image à gauche (100px) */}
                <div className="dentiste-image-simple">
                  <img
                    src={getImageUrl(dentiste.profileImage)}
                    alt={`${dentiste.Prenom} ${dentiste.Nom}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                
                {/* Toutes les informations à droite */}
                <div className="dentiste-info-simple">
                  {/* Nom et numéro d'ordre */}
                  <div className="dentiste-header-simple">
                    <h3 className="dentiste-nom">
                      {dentiste.Titre || "Dr"}  {dentiste.Nom} {dentiste.Prenom}
                    </h3>
                    {dentiste.NumOrdre && (
                      <div className="dentiste-numero">
                        <Award size={14} />
                        <span>N° {dentiste.NumOrdre}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Adresse */}
                  <div className="dentiste-adresse">
                    <MapPin size={16} />
                    <div>
                      <span className="adresse-text"> 
                        {dentiste.Adresse || "Non renseignée"}
                      </span>
                      <div className="localisation">
                        {dentiste.Lieu && <span className="ville">{dentiste.Lieu}</span>}
                        {dentiste.Region && <span className="region">{dentiste.Region}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contacts */}
                  <div className="dentiste-contacts">
                    <div className="contact-row">
                      {dentiste.Contact && (
                        <div className="contact-item-simple">
                          <Phone size={16} />
                          <span className="telephone">
                            {formatContact(dentiste.Contact)}
                          </span>
                        </div>
                      )}
                      
                      {dentiste.email && (
                        <div className="contact-item-simple">
                          <Mail size={16} />
                          <span className="email">
                            {dentiste.email}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {dentiste.AutreContact && (
                      <div className="contact-secondaire">
                        <span className="label">Second contact :</span>
                        <span className="valeur">{dentiste.AutreContact}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Domaine */}
                  {dentiste.Domaine && (
                    <div className="dentiste-domaine">
                      <span className="label-domaine">Fonction d'exercice :</span>
                      <span className="valeur-domaine">{dentiste.Domaine}</span>
                    </div>
                  )}
                
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeDentistes;