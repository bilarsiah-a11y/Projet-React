// src/pages/AccueilAdmin.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../AdminCss/AdminHome.css";

// Import des composants de graphiques
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const API_BASE = "http://localhost:3002";
const ADMIN_API_BASE = "http://localhost:3002/admin";

const AdminHome = () => {
  // États pour les données
  const [adminStats, setAdminStats] = useState({
    totalDentistes: 0,
    pending: 0,
    verified: 0,
    regions: 0,
  });

  const [profilsRecents, setProfilsRecents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les données des graphiques
  const [regionData, setRegionData] = useState([]);
  const [titreData, setTitreData] = useState([]);
  const [domaineData, setDomaineData] = useState([]);
  const [titreRegionData, setTitreRegionData] = useState([]);
  const [domaineRegionData, setDomaineRegionData] = useState([]);

  // Configuration des couleurs (bleu ciel et blanc)
  const colorTheme = {
    primary: "#87CEEB", // Bleu ciel
    primaryDark: "#5DADE2",
    primaryLight: "#AED6F1",
    white: "#FFFFFF",
    grayLight: "#F8F9FA",
    gray: "#E9ECEF",
    grayDark: "#DEE2E6",
    text: "#2C3E50",
    textLight: "#7F8C8D"
  };

  // Couleurs pour les graphiques
  const CHART_COLORS = [
    '#87CEEB', '#5DADE2', '#3498DB', '#2980B9', '#21618C',
    '#1B4F72', '#AED6F1', '#85C1E9', '#2E86C1', '#1B4F72'
  ];

  // Service pour les appels API - CORRIGÉ selon votre backend
  const statistiqueService = {
    // Récupérer les statistiques par région
    getStatistiquesRegion: async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats-region`);
        console.log('📊 Données région reçues:', res.data);
        return res.data.data || [];
      } catch (error) {
        console.error('Erreur stats-region:', error);
        return [];
      }
    },
    
    // Récupérer les statistiques par titre
    getStatistiquesTitre: async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats-titre`);
        console.log('📊 Données titre reçues:', res.data);
        return res.data.data || [];
      } catch (error) {
        console.error('Erreur stats-titre:', error);
        return [];
      }
    },
    
    // Récupérer les statistiques par domaine
    getStatistiquesDomaine: async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats-domaine`);
        console.log('📊 Données domaine reçues:', res.data);
        return res.data.data || [];
      } catch (error) {
        console.error('Erreur stats-domaine:', error);
        return [];
      }
    },
    
    // Récupérer le total des dentistes
    getTotalDentistes: async () => {
      try {
        const res = await axios.get(`${API_BASE}/totals`);
        console.log('📊 Total dentistes reçu:', res.data);
        return res.data.data || { total: 0 };
      } catch (error) {
        console.error('Erreur totals:', error);
        return { total: 0 };
      }
    },
    
    // Récupérer les statistiques titre par région
    getStatistiquesTitreRegion: async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats-titre-region`);
        console.log('📊 Données titre-région reçues:', res.data);
        return res.data.data || [];
      } catch (error) {
        console.error('Erreur stats-titre-region:', error);
        return [];
      }
    },
    
    // Récupérer les statistiques domaine par région
    getStatistiquesDomaineRegion: async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats-domaine-region`);
        console.log('📊 Données domaine-région reçues:', res.data);
        return res.data.data || [];
      } catch (error) {
        console.error('Erreur stats-domaine-region:', error);
        return [];
      }
    },
    
    // Récupérer les statistiques admin (utilisateurs en attente, vérifiés, etc.)
    getAdminStats: async () => {
      try {
        const res = await axios.get(`${ADMIN_API_BASE}/stats`);
        console.log('📊 Stats admin reçues:', res.data);
        return res.data || {};
      } catch (error) {
        console.error('Erreur stats admin:', error);
        return {};
      }
    },
    
    // Récupérer les utilisateurs récents
    getRecentUsers: async () => {
      try {
        const res = await axios.get(`${ADMIN_API_BASE}/recent`);
        console.log('📊 Utilisateurs récents reçus:', res.data);
        return res.data || [];
      } catch (error) {
        console.error('Erreur utilisateurs récents:', error);
        return [];
      }
    },
    
    // Tester la connexion à la base de données
    testConnection: async () => {
      try {
        const res = await axios.get(`${API_BASE}/test-connection`);
        console.log('🔍 Test connexion:', res.data);
        return res.data;
      } catch (error) {
        console.error('Erreur test connexion:', error);
        return null;
      }
    },
    
    // Vérifier toutes les données disponibles
    getAllData: async () => {
      try {
        const res = await axios.get(`${API_BASE}/all-data`);
        console.log('📋 Toutes les données:', res.data);
        return res.data.data || [];
      } catch (error) {
        console.error('Erreur all-data:', error);
        return [];
      }
    }
  };

  // Fonction pour charger toutes les données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Chargement des données admin...');
        
        // D'abord, tester la connexion
        const connectionTest = await statistiqueService.testConnection();
        if (!connectionTest?.success) {
          throw new Error('Impossible de se connecter à la base de données');
        }
        
        console.log('✅ Connexion à la base de données établie');
        
        // Récupérer toutes les données en parallèle
        const [
          regionsResult, 
          titresResult, 
          domainesResult, 
          totalResult, 
          titreRegionResult,
          domaineRegionResult,
          adminStatsResult,
          recentUsersResult,
          allDataResult
        ] = await Promise.allSettled([
          statistiqueService.getStatistiquesRegion(),
          statistiqueService.getStatistiquesTitre(),
          statistiqueService.getStatistiquesDomaine(),
          statistiqueService.getTotalDentistes(),
          statistiqueService.getStatistiquesTitreRegion(),
          statistiqueService.getStatistiquesDomaineRegion(),
          statistiqueService.getAdminStats(),
          statistiqueService.getRecentUsers(),
          statistiqueService.getAllData()
        ]);

        // Traitement des résultats
        const regions = regionsResult.status === 'fulfilled' ? regionsResult.value : [];
        const titres = titresResult.status === 'fulfilled' ? titresResult.value : [];
        const domaines = domainesResult.status === 'fulfilled' ? domainesResult.value : [];
        const total = totalResult.status === 'fulfilled' ? totalResult.value : { total: 0 };
        const titreRegion = titreRegionResult.status === 'fulfilled' ? titreRegionResult.value : [];
        const domaineRegion = domaineRegionResult.status === 'fulfilled' ? domaineRegionResult.value : [];
        const adminStatsData = adminStatsResult.status === 'fulfilled' ? adminStatsResult.value : {};
        const recentUsersData = recentUsersResult.status === 'fulfilled' ? recentUsersResult.value : [];
        const allData = allDataResult.status === 'fulfilled' ? allDataResult.value : [];

        console.log('📊 Résultats récupérés:', {
          totalRegions: regions.length,
          totalTitres: titres.length,
          totalDomaines: domaines.length,
          totalDentistes: total.total,
          totalTitreRegion: titreRegion.length,
          totalDomaineRegion: domaineRegion.length,
          totalProfilsRecents: recentUsersData.length,
          totalAllData: allData.length
        });

        // Formatage des données pour les graphiques
        const formattedRegionData = regions.map(region => ({
          name: region.Region || 'Non spécifié',
          dentistes: parseInt(region.count) || 0
        })).sort((a, b) => b.dentistes - a.dentistes); // Trier par ordre décroissant

        const formattedTitreData = titres.map(titre => ({
          name: titre.Titre || 'Non spécifié',
          value: parseInt(titre.count) || 0
        })).sort((a, b) => b.value - a.value); // Trier par ordre décroissant

        const formattedDomaineData = domaines.map(domaine => ({
          name: domaine.Domaine || 'Non spécifié',
          value: parseInt(domaine.count) || 0
        })).sort((a, b) => b.value - a.value); // Trier par ordre décroissant

        // Mise à jour des états
        setAdminStats({
          totalDentistes: total.total || 0,
          pending: adminStatsData.pending || 0,
          verified: adminStatsData.verified || 0,
          regions: formattedRegionData.length || 0,
        });
        
        setProfilsRecents(recentUsersData);
        setRegionData(formattedRegionData);
        setTitreData(formattedTitreData);
        setDomaineData(formattedDomaineData);
        setTitreRegionData(titreRegion);
        setDomaineRegionData(domaineRegion);

        console.log('✅ Données admin chargées avec succès');

      } catch (err) {
        console.error('❌ Erreur lors du chargement:', err);
        setError(`Erreur lors du chargement des données: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fonctions utilitaires
  const getNomComplet = (profil) => {
    return `${profil.Prenom || ''} ${profil.Nom || ''}`.trim() || 'Nom inconnu';
  };

  const getInitiales = (profil) => {
    const nomComplet = getNomComplet(profil);
    return nomComplet.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const getRegion = (profil) => {
    return profil.Region || 'Non spécifié';
  };

  const handleGenerateReport = () => {
    alert('Génération du rapport mensuel en cours...');
  };

  const handleRefreshData = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  // Composant Graphique 1: Statistiques par région, titre et domaine
  const ChartStatsOverview = () => (
    <div className="chart-container" style={{ backgroundColor: colorTheme.white }}>
      <h3 style={{ color: colorTheme.text, marginBottom: '20px' }}>
        📊 Statistiques par Catégorie
      </h3>
      <div className="charts-grid">
        {/* Graphique des régions */}
        <div className="chart-card">
          <h4 style={{ color: colorTheme.textLight, marginBottom: '15px' }}>Dentistes par Région</h4>
          {regionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={regionData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorTheme.gray} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} dentistes`, 'Nombre']}
                  contentStyle={{ 
                    backgroundColor: colorTheme.white,
                    border: `1px solid ${colorTheme.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="dentistes" 
                  fill={colorTheme.primary}
                  radius={[4, 4, 0, 0]}
                  name="Nombre de dentistes"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data" style={{ textAlign: 'center', padding: '20px', color: colorTheme.textLight }}>
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Graphique des titres */}
        <div className="chart-card">
          <h4 style={{ color: colorTheme.textLight, marginBottom: '15px' }}>Répartition par Titre</h4>
          {titreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={titreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {titreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} dentistes`, 'Nombre']}
                  contentStyle={{ 
                    backgroundColor: colorTheme.white,
                    border: `1px solid ${colorTheme.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data" style={{ textAlign: 'center', padding: '20px', color: colorTheme.textLight }}>
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Graphique des domaines */}
        <div className="chart-card">
          <h4 style={{ color: colorTheme.textLight, marginBottom: '15px' }}>Répartition par Domaine</h4>
          {domaineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={domaineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorTheme.gray} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} dentistes`, 'Nombre']}
                  contentStyle={{ 
                    backgroundColor: colorTheme.white,
                    border: `1px solid ${colorTheme.primary}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={colorTheme.primaryDark}
                  radius={[4, 4, 0, 0]}
                  name="Nombre de dentistes"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data" style={{ textAlign: 'center', padding: '20px', color: colorTheme.textLight }}>
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Composant Graphique 2: Titres par région (graphique en ligne)
  const ChartTitreRegion = () => {
    // Préparation des données pour le graphique multi-lignes
    const prepareTitreRegionData = () => {
      if (!titreRegionData.length) return [];
      
      // Regrouper par région
      const regionsMap = {};
      
      titreRegionData.forEach(item => {
        const region = item.Region || 'Non spécifié';
        const titre = item.Titre || 'Non spécifié';
        const count = parseInt(item.count) || 0;
        
        if (!regionsMap[region]) {
          regionsMap[region] = { region };
        }
        regionsMap[region][titre] = count;
      });
      
      return Object.values(regionsMap);
    };

    const titreRegionChartData = prepareTitreRegionData();
    const titresUniques = [...new Set(titreRegionData.map(item => item.Titre || 'Non spécifié'))];

    return (
      <div className="chart-container" style={{ backgroundColor: colorTheme.white }}>
        <h3 style={{ color: colorTheme.text, marginBottom: '20px' }}>
          📈 Répartition des Titres par Région
        </h3>
        {titreRegionChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={titreRegionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colorTheme.gray} />
              <XAxis 
                dataKey="region" 
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} dentistes`, name]}
                contentStyle={{ 
                  backgroundColor: colorTheme.white,
                  border: `1px solid ${colorTheme.primary}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {titresUniques.map((titre, index) => (
                <Line
                  key={titre}
                  type="monotone"
                  dataKey={titre}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={titre}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data" style={{ textAlign: 'center', padding: '40px', color: colorTheme.textLight }}>
            Aucune donnée disponible pour les titres par région
          </div>
        )}
      </div>
    );
  };

  // Composant Graphique 3: Domaines par région (graphique à barres groupées)
  const ChartDomaineRegion = () => {
    // Préparation des données pour le graphique à barres groupées
    const prepareDomaineRegionData = () => {
      if (!domaineRegionData.length) return [];
      
      // Regrouper par région
      const regionsMap = {};
      
      domaineRegionData.forEach(item => {
        const region = item.Region || 'Non spécifié';
        const domaine = item.Domaine || 'Non spécifié';
        const count = parseInt(item.count) || 0;
        
        if (!regionsMap[region]) {
          regionsMap[region] = { region };
        }
        regionsMap[region][domaine] = count;
      });
      
      return Object.values(regionsMap).slice(0, 8); // Limiter à 8 régions pour lisibilité
    };

    const domaineRegionChartData = prepareDomaineRegionData();
    const domainesUniques = [...new Set(domaineRegionData.map(item => item.Domaine || 'Non spécifié'))];

    return (
      <div className="chart-container" style={{ backgroundColor: colorTheme.white }}>
        <h3 style={{ color: colorTheme.text, marginBottom: '20px' }}>
          🏢 Répartition des Domaines par Région
        </h3>
        {domaineRegionChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={domaineRegionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colorTheme.gray} />
              <XAxis 
                dataKey="region" 
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} dentistes`, name]}
                contentStyle={{ 
                  backgroundColor: colorTheme.white,
                  border: `1px solid ${colorTheme.primary}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {domainesUniques.map((domaine, index) => (
                <Bar
                  key={domaine}
                  dataKey={domaine}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  name={domaine}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data" style={{ textAlign: 'center', padding: '40px', color: colorTheme.textLight }}>
            Aucune donnée disponible pour les domaines par région
          </div>
        )}
      </div>
    );
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="loading-container" style={{ backgroundColor: colorTheme.white }}>
        <div className="loading-spinner" style={{ borderColor: `${colorTheme.primary} transparent` }}></div>
        <div className="loading-text" style={{ color: colorTheme.text }}>
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="error-container" style={{ backgroundColor: colorTheme.white }}>
        <div className="error-icon" style={{ color: colorTheme.primary }}>⚠️</div>
        <div className="error-text" style={{ color: colorTheme.text }}>{error}</div>
        <button 
          className="retry-btn" 
          onClick={handleRefreshData}
          style={{ 
            backgroundColor: colorTheme.primary,
            color: colorTheme.white,
            marginTop: '20px'
          }}
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="admin-accueil" style={{ backgroundColor: colorTheme.grayLight }}>
      <div className="admin-main-content">

        {/* Header */}
        <header className="admin-header" style={{ backgroundColor: colorTheme.white }}>
          <div className="admin-welcome">
            <h1 style={{ color: colorTheme.text }}>Tableau de Bord Administrateur</h1>
            <p style={{ color: colorTheme.textLight }}>Gestion de la plateforme SourireGuide</p>
          </div>

          <div className="admin-actions">
            <Link to="/admin/liste" className="btn-admin primary" 
              style={{ backgroundColor: colorTheme.primary, color: colorTheme.white }}>
              ⚡ Valider les profils ({adminStats.pending || 0})
            </Link>
            <button className="btn-admin secondary" onClick={handleGenerateReport}
              style={{ backgroundColor: colorTheme.white, color: colorTheme.primary, border: `1px solid ${colorTheme.primary}` }}>
              📊 Rapport mensuel
            </button>
          </div>
        </header>

        {/* STATS RAPIDES */}
        <div className="quick-stats-grid">
          <div className="stat-card" style={{ backgroundColor: colorTheme.white }}>
            <div className="stat-icon total" style={{ backgroundColor: colorTheme.primaryLight, color: colorTheme.primary }}>👨‍⚕️</div>
            <div className="stat-content">
              <h3 style={{ color: colorTheme.text }}>Total Dentistes</h3>
              <span className="stat-number" style={{ color: colorTheme.primary }}>{adminStats.totalDentistes || 0}</span>
            </div>
          </div>

          <div className="stat-card" style={{ backgroundColor: colorTheme.white }}>
            <div className="stat-icon pending" style={{ backgroundColor: colorTheme.primaryLight, color: colorTheme.primary }}>⏳</div>
            <div className="stat-content">
              <h3 style={{ color: colorTheme.text }}>En Attente</h3>
              <span className="stat-number" style={{ color: colorTheme.primary }}>{adminStats.pending || 0}</span>
            </div>
          </div>

          <div className="stat-card" style={{ backgroundColor: colorTheme.white }}>
            <div className="stat-icon regions" style={{ backgroundColor: colorTheme.primaryLight, color: colorTheme.primary }}>🗺️</div>
            <div className="stat-content">
              <h3 style={{ color: colorTheme.text }}>Régions</h3>
              <span className="stat-number" style={{ color: colorTheme.primary }}>{adminStats.regions || 0}/22</span>
            </div>
          </div>

          <div className="stat-card" style={{ backgroundColor: colorTheme.white }}>
            <div className="stat-icon verified" style={{ backgroundColor: colorTheme.primaryLight, color: colorTheme.primary }}>✅</div>
            <div className="stat-content">
              <h3 style={{ color: colorTheme.text }}>Vérifiés</h3>
              <span className="stat-number" style={{ color: colorTheme.primary }}>{adminStats.verified || 0}</span>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="admin-content-grid">

          {/* Profils récents */}
          <section className="profils-recents" style={{ backgroundColor: colorTheme.white }}>
            <h2 style={{ color: colorTheme.text }}>👨‍⚕️ Derniers profils ajoutés</h2>
            <div className="profils-list">
              {profilsRecents.length > 0 ? (
                profilsRecents.map((profil, index) => (
                  <div key={index} className="profil-item" 
                    style={{ borderBottom: `1px solid ${colorTheme.gray}` }}>
                    <div className="profil-avatar" 
                      style={{ backgroundColor: colorTheme.primary, color: colorTheme.white }}>
                      {getInitiales(profil)}
                    </div>
                    <div className="profil-info">
                      <h4 style={{ color: colorTheme.text }}>{getNomComplet(profil)}</h4>
                      <p style={{ color: colorTheme.textLight }}>{getRegion(profil)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: colorTheme.textLight }}>Aucun profil récent.</p>
              )}
            </div>
          </section>

          {/* Graphique 1: Statistiques par région, titre et domaine */}
          <section className="chart-section-full" style={{ backgroundColor: colorTheme.white, gridColumn: '1 / -1' }}>
            <ChartStatsOverview />
          </section>

          {/* Graphique 2: Titres par région */}
          <section className="chart-section-full" style={{ backgroundColor: colorTheme.white, gridColumn: '1 / -1' }}>
            <ChartTitreRegion />
          </section>

          {/* Graphique 3: Domaines par région */}
          <section className="chart-section-full" style={{ backgroundColor: colorTheme.white, gridColumn: '1 / -1' }}>
            <ChartDomaineRegion />
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminHome;