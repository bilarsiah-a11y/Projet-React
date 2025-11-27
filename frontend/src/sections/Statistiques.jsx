import React, { useState, useEffect } from 'react';
import Card from '../Statistique/Card';
import AdvancedStats from '../Statistique/AdvancedStats';
import '../sectionsCss/Statistiques.css';

const API_BASE = "http://localhost:3002/Statistiques";

const Statistiques = () => {
  const [cardsData, setCardsData] = useState([]);
  const [advancedStatsData, setAdvancedStatsData] = useState({
    titreRegion: [],
    domaineRegion: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statistiqueService = {
    getStatistiquesRegion: async () => {
      try {
        const res = await fetch(`${API_BASE}/region`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur région:', error);
        throw error;
      }
    },
    getStatistiquesTitre: async () => {
      try {
        const res = await fetch(`${API_BASE}/titre`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur titre:', error);
        throw error;
      }
    },
    getStatistiquesDomaine: async () => {
      try {
        const res = await fetch(`${API_BASE}/domaine`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur domaine:', error);
        throw error;
      }
    },
    getTotalDentistes: async () => {
      try {
        const res = await fetch(`${API_BASE}/total`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur total:', error);
        throw error;
      }
    },
    getStatistiquesTitreRegion: async () => {
      try {
        const res = await fetch(`${API_BASE}/titre-region`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur titre-région:', error);
        return [];
      }
    },
    getStatistiquesDomaineRegion: async () => {
      try {
        const res = await fetch(`${API_BASE}/domaine-region`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur domaine-région:', error);
        return [];
      }
    },
  };

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        console.log('🔄 Chargement des statistiques...');
        
        const [regionsData, titresData, domainesData, totalData, titreRegionData, domaineRegionData] = 
          await Promise.allSettled([
            statistiqueService.getStatistiquesRegion(),
            statistiqueService.getStatistiquesTitre(),
            statistiqueService.getStatistiquesDomaine(),
            statistiqueService.getTotalDentistes(),
            statistiqueService.getStatistiquesTitreRegion(),
            statistiqueService.getStatistiquesDomaineRegion()
          ]);

        // Gérer les résultats
        const regions = regionsData.status === 'fulfilled' ? regionsData.value : [];
        const titres = titresData.status === 'fulfilled' ? titresData.value : [];
        const domaines = domainesData.status === 'fulfilled' ? domainesData.value : [];
        const total = totalData.status === 'fulfilled' ? totalData.value : { total: 0 };
        const titreRegion = titreRegionData.status === 'fulfilled' ? titreRegionData.value : [];
        const domaineRegion = domaineRegionData.status === 'fulfilled' ? domaineRegionData.value : [];

        // Stocker les données pour les statistiques avancées
        setAdvancedStatsData({
          titreRegion,
          domaineRegion
        });

        // SEULEMENT 4 CARTES PRINCIPALES
        const newCardsData = [
          {
            title: "Régions",
            color: {
              backGround: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0px 8px 25px 0px rgba(102, 126, 234, 0.4)",
            },
            barValue: regions.length > 0 ? Math.round((regions.length / 22) * 100) : 0,
            value: regions.length > 0 ? `${regions.length} régions` : "Aucune donnée",
            png: "FaMapMarker",
            series: [{
              name: "Dentistes par région",
              data: regions.map(region => region.count || 0)
            }],
            details: regions,
            type: "region"
          },
          {
            title: "Titres",
            color: {
              backGround: "linear-gradient(135deg, #a78bfa 0%, #7e5bef 100%)",
              boxShadow: "0px 8px 25px 0px rgba(167, 139, 250, 0.4)",
            },
            barValue: titres.length > 0 ? Math.round((titres.length / 5) * 100) : 0,
            value: titres.length > 0 ? `${titres.length} titres` : "Aucune donnée",
            png: "MdTitle",
            series: [{
              name: "Dentistes par titre",
              data: titres.map(titre => titre.count || 0)
            }],
            details: titres,
            type: "titre"
          },
          {
            title: "Domaines",
            color: {
              backGround: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
              boxShadow: "0px 8px 25px 0px rgba(96, 165, 250, 0.4)",
            },
            barValue: domaines.length > 0 ? Math.round((domaines.length / 3) * 100) : 0,
            value: domaines.length > 0 ? `${domaines.length} domaines` : "Aucune donnée",
            png: "FaUserTie",
            series: [{
              name: "Dentistes par domaine",
              data: domaines.map(domaine => domaine.count || 0)
            }],
            details: domaines,
            type: "domaine"
          },
          {
            title: "Total Dentistes",
            color: {
              backGround: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
              boxShadow: "0px 8px 25px 0px rgba(52, 211, 153, 0.4)",
            },
            barValue: 100,
            value: `${total.total || 0} dentistes`,
            png: "FaUsers",
            series: [{
              name: "Évolution",
              data: [total.total * 0.8 || 0, total.total * 0.9 || 0, total.total || 0]
            }],
            details: [{ label: 'Total', count: total.total || 0 }],
            type: "total"
          }
        ];

        setCardsData(newCardsData);
        console.log('✅ 4 cartes principales créées');

      } catch (err) {
        console.error('❌ Erreur fetch statistiques:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-text">{error}</div>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="Statistiques">
      <div className="statistiques-header">
        <h2 className="statistiques-title">Tableau de Bord des Statistiques Dentistes</h2>
        <p className="statistiques-subtitle">
          Vue d'ensemble complète de la répartition des dentistes
        </p>
      </div>
      
      {/* Grille des 4 cartes principales seulement */}
      <div className="Statistiques-grid">
        {cardsData.map((card, id) => (
          <Card
            key={id}
            id={id}
            title={card.title}
            color={card.color}
            barValue={card.barValue}
            value={card.value}
            png={card.png}
            series={card.series}
            details={card.details}
            type={card.type}
          />
        ))}
      </div>

      {/* Section des statistiques avancées (graphiques) */}
      <div className="advanced-stats-section">
        {advancedStatsData.titreRegion.length > 0 && (
          <AdvancedStats 
            title="Répartition des Titres par Région"
            data={advancedStatsData.titreRegion}
            type="titre-region"
          />
        )}
        {advancedStatsData.domaineRegion.length > 0 && (
          <AdvancedStats 
            title="Répartition des Domaines par Région"
            data={advancedStatsData.domaineRegion}
            type="domaine-region"
          />
        )}
      </div>
    </div>
  );
};

export default Statistiques;