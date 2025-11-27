import React, { useState, useEffect } from 'react';
import Card from '../Statistique/Card.jsx';
import AdvancedStats from '../Statistique/AdvancedStats.jsx';
import AdminStats from '../Adminstat/AdminStats.jsx';
import '../AdminCss/AdminStatistique.css';

const API_BASE = "http://localhost:3002/Statistiques";
const ADMIN_API_BASE = "http://localhost:3002/admin";

const AdminStatistique = () => {
  const [cardsData, setCardsData] = useState([]);
  const [advancedStatsData, setAdvancedStatsData] = useState({
    titreRegion: [],
    domaineRegion: []
  });
  const [adminStats, setAdminStats] = useState({
    totalDentistes: 0,
    pending: 0,
    verified: 0,
    regions: 0,
    totalRegions: 22
  });
  const [recentUsers, setRecentUsers] = useState([]);
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
    getAdminStats: async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/stats`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur stats admin:', error);
        throw error;
      }
    },
    getRecentUsers: async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/recent`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur utilisateurs récents:', error);
        return [];
      }
    },
    getPendingUsers: async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/pending-users`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error('Erreur utilisateurs en attente:', error);
        return [];
      }
    }
  };

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        console.log('🔄 Chargement des statistiques admin...');
        
        const [
          regionsData, 
          titresData, 
          domainesData, 
          totalData, 
          titreRegionData, 
          domaineRegionData,
          adminStatsData,
          recentUsersData,
          pendingUsersData
        ] = await Promise.allSettled([
          statistiqueService.getStatistiquesRegion(),
          statistiqueService.getStatistiquesTitre(),
          statistiqueService.getStatistiquesDomaine(),
          statistiqueService.getTotalDentistes(),
          statistiqueService.getStatistiquesTitreRegion(),
          statistiqueService.getStatistiquesDomaineRegion(),
          statistiqueService.getAdminStats(),
          statistiqueService.getRecentUsers(),
          statistiqueService.getPendingUsers()
        ]);

        const regions = regionsData.status === 'fulfilled' ? regionsData.value : [];
        const titres = titresData.status === 'fulfilled' ? titresData.value : [];
        const domaines = domainesData.status === 'fulfilled' ? domainesData.value : [];
        const total = totalData.status === 'fulfilled' ? totalData.value : { total: 0 };
        const titreRegion = titreRegionData.status === 'fulfilled' ? titreRegionData.value : [];
        const domaineRegion = domaineRegionData.status === 'fulfilled' ? domaineRegionData.value : [];
        const adminStatsResult = adminStatsData.status === 'fulfilled' ? adminStatsData.value : {};
        const recentUsersResult = recentUsersData.status === 'fulfilled' ? recentUsersData.value : [];
        const pendingUsers = pendingUsersData.status === 'fulfilled' ? pendingUsersData.value : [];

        setAdvancedStatsData({
          titreRegion,
          domaineRegion
        });

        setAdminStats(adminStatsResult);
        setRecentUsers(recentUsersResult);

        const newCardsData = [
          {
            title: "Total Dentistes",
            color: {
              backGround: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              boxShadow: "0px 8px 25px 0px rgba(52, 152, 219, 0.4)",
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
          },
          {
            title: "Inscriptions en Attente",
            color: {
              backGround: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
              boxShadow: "0px 8px 25px 0px rgba(231, 76, 60, 0.4)",
            },
            barValue: pendingUsers.length > 0 ? Math.min((pendingUsers.length / 10) * 100, 100) : 0,
            value: `${pendingUsers.length} en attente`,
            png: "FaClock",
            series: [{
              name: "En attente",
              data: [pendingUsers.length || 0]
            }],
            details: pendingUsers,
            type: "pending"
          },
          {
            title: "Régions Couvertes",
            color: {
              backGround: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
              boxShadow: "0px 8px 25px 0px rgba(155, 89, 182, 0.4)",
            },
            barValue: regions.length > 0 ? Math.round((regions.length / 22) * 100) : 0,
            value: `${regions.length}/22 régions`,
            png: "FaMapMarker",
            series: [{
              name: "Dentistes par région",
              data: regions.map(region => region.count || 0)
            }],
            details: regions,
            type: "region"
          },
          {
            title: "Titres Professionnels",
            color: {
              backGround: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
              boxShadow: "0px 8px 25px 0px rgba(46, 204, 113, 0.4)",
            },
            barValue: titres.length > 0 ? Math.round((titres.length / 5) * 100) : 0,
            value: `${titres.length} titres`,
            png: "MdTitle",
            series: [{
              name: "Dentistes par titre",
              data: titres.map(titre => titre.count || 0)
            }],
            details: titres,
            type: "titre"
          },
          {
            title: "Domaines d'Activité",
            color: {
              backGround: "linear-gradient(135deg, #f39c12 0%, #d35400 100%)",
              boxShadow: "0px 8px 25px 0px rgba(243, 156, 18, 0.4)",
            },
            barValue: domaines.length > 0 ? Math.round((domaines.length / 3) * 100) : 0,
            value: `${domaines.length} domaines`,
            png: "FaUserTie",
            series: [{
              name: "Dentistes par domaine",
              data: domaines.map(domaine => domaine.count || 0)
            }],
            details: domaines,
            type: "domaine"
          },
          {
            title: "Dentistes Vérifiés",
            color: {
              backGround: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
              boxShadow: "0px 8px 25px 0px rgba(26, 188, 156, 0.4)",
            },
            barValue: adminStatsResult.verified > 0 ? Math.round((adminStatsResult.verified / adminStatsResult.totalDentistes) * 100) : 0,
            value: `${adminStatsResult.verified || 0} vérifiés`,
            png: "FaCheckCircle",
            series: [{
              name: "Vérifiés",
              data: [adminStatsResult.verified || 0]
            }],
            details: [{ label: 'Dentistes vérifiés', count: adminStatsResult.verified || 0 }],
            type: "verified"
          }
        ];

        setCardsData(newCardsData);
        console.log('✅ 6 cartes admin créées');

      } catch (err) {
        console.error('❌ Erreur fetch statistiques admin:', err);
        setError('Erreur lors du chargement des statistiques admin');
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
        <div className="loading-text">Chargement des statistiques admin...</div>
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
    <div className="admin-statistiques-page">
      <div className="statistiques-header">
        <h2 className="statistiques-title">Statistiques Détaillées</h2>
        <p className="statistiques-subtitle">
          Analyses complètes et indicateurs de performance de la plateforme
        </p>
      </div>
      
      <div className="statistiques-grid admin-grid">
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

      <AdminStats 
        adminStats={adminStats}
        recentUsers={recentUsers}
      />
    </div>
  );
};

export default AdminStatistique;