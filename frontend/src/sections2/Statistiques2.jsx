import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import "../sections2Css/Statistiques2.css";

const Statistiques2 = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [allDentistes, setAllDentistes] = useState([]);
  const [personalStats, setPersonalStats] = useState({
    profileCompletion: 0,
    rankNational: 0,
    rankRegional: 0,
    totalInRegion: 0,
    views: 0,
    patientReferrals: 0,
    responseTime: 0,
    satisfactionRate: 0
  });
  
  const [monthlyPerformance, setMonthlyPerformance] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [regionStats, setRegionStats] = useState([]);
  const [genderStats, setGenderStats] = useState([]);

  const themeColors = {
    primary: "#87CEEB",
    secondary: "#FFFFFF",
    accent: "#5DADE2",
    lightBlue: "#E8F4FC",
    darkBlue: "#3498DB",
    success: "#2ECC71",
    warning: "#F39C12",
    danger: "#E74C3C"
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("Aucun token trouvé");
          setLoading(false);
          return;
        }

        // 1. Récupérer le profil personnel depuis la table 'profil'
        const profileRes = await axios.get(
          "http://localhost:3002/all-data", // Utiliser l'endpoint correct
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Récupérer l'ID utilisateur depuis le token ou chercher le profil correspondant
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData.id;

        // Trouver le profil correspondant à l'utilisateur connecté
        const allProfiles = profileRes.data?.data || [];
        setAllDentistes(allProfiles);
        
        // Trouver le profil de l'utilisateur connecté
        const userProfile = allProfiles.find(profile => profile.users_id === userId);
        
        if (userProfile) {
          setProfile(userProfile);
          
          // 2. Calculer les statistiques personnelles
          calculatePersonalStats(userProfile, allProfiles);
          
          // 3. Générer les données pour les graphiques
          generateChartData(userProfile, allProfiles);
          
          // 4. Calculer les statistiques de genre
          await calculateGenderStats();
        } else {
          console.warn("Profil utilisateur non trouvé dans les données");
          // Utiliser des données par défaut
          setProfile({
            id: userId,
            Nom: "Utilisateur",
            Prenom: "",
            Region: "",
            Titre: "",
            Date: new Date().toLocaleDateString('fr-FR')
          });
          calculatePersonalStats({}, allProfiles);
          generateChartData({}, allProfiles);
          await calculateGenderStats();
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        // Données de démonstration en cas d'erreur
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadDemoData = () => {
    // Données de démonstration
    const demoProfile = {
      id: 1,
      Nom: "Dupont",
      Prenom: "Jean",
      NumOrdre: "12345",
      Contact: "0321234567",
      Region: "Analamanga",
      Titre: "Docteur",
      Date: "15/01/2024"
    };
    
    const demoDentistes = [
      { id: 1, Nom: "Dupont", Prenom: "Jean", Region: "Analamanga", Titre: "Docteur", NumOrdre: "12345", Contact: "0321234567", users_id: 1 },
      { id: 2, Nom: "Martin", Prenom: "Sophie", Region: "Analamanga", Titre: "Docteur Spécialiste", NumOrdre: "12346", Contact: "0321234568", users_id: 2 },
      { id: 3, Nom: "Dubois", Prenom: "Pierre", Region: "Analamanga", Titre: "Docteur", NumOrdre: "12347", Contact: "0321234569", users_id: 3 },
      { id: 4, Nom: "Lefevre", Prenom: "Marie", Region: "Vakinankaratra", Titre: "Professeur", NumOrdre: "12348", Contact: "0321234570", users_id: 4 },
      { id: 5, Nom: "Moreau", Prenom: "Luc", Region: "Analamanga", Titre: "Docteur", NumOrdre: "12349", Contact: "0321234571", users_id: 5 }
    ];
    
    setProfile(demoProfile);
    setAllDentistes(demoDentistes);
    calculatePersonalStats(demoProfile, demoDentistes);
    generateChartData(demoProfile, demoDentistes);
    
    // Statistiques de genre par défaut
    setGenderStats([
      { name: 'Docteur', value: 3, color: themeColors.primary },
      { name: 'Professeur', value: 1, color: themeColors.accent },
      { name: 'Docteur Spécialiste', value: 1, color: themeColors.warning }
    ]);
  };

  const calculatePersonalStats = (profile, allDentists) => {
    if (!allDentists || allDentists.length === 0) {
      console.warn("Aucun dentiste trouvé pour le calcul des statistiques");
      return;
    }

    // Calcul du score de complétude
    let score = 0;
    if (profile?.Nom) score += 15;
    if (profile?.Prenom) score += 15;
    if (profile?.NumOrdre && profile.NumOrdre.trim() !== "") score += 25;
    if (profile?.Contact && profile.Contact.trim() !== "") score += 15;
    if (profile?.Region && profile.Region.trim() !== "") score += 15;
    if (profile?.Titre && profile.Titre.trim() !== "") score += 15;
    
    // 1. Classement national
    const dentistsWithScores = allDentists.map(d => ({
      ...d,
      score: calculateDentistScore(d)
    }));

    const sortedByScore = [...dentistsWithScores].sort((a, b) => b.score - a.score);
    const nationalRank = profile?.id ? 
      sortedByScore.findIndex(d => d.id === profile.id) + 1 : 
      allDentists.length + 1;

    // 2. Classement régional
    const profileRegion = profile?.Region || "";
    const dentistsInRegion = allDentists.filter(d => d.Region === profileRegion);
    const sortedRegional = [...dentistsInRegion].sort((a, b) => {
      const aScore = calculateDentistScore(a);
      const bScore = calculateDentistScore(b);
      return bScore - aScore;
    });

    const regionalRank = profile?.id ? 
      sortedRegional.findIndex(d => d.id === profile.id) + 1 : 
      dentistsInRegion.length + 1;

    // 3. Calcul des statistiques réelles
    const stats = {
      profileCompletion: score,
      rankNational: nationalRank > 0 ? nationalRank : allDentists.length + 1,
      rankRegional: regionalRank > 0 ? regionalRank : dentistsInRegion.length + 1,
      totalInRegion: dentistsInRegion.length,
      views: calculateViews(profile, allDentists),
      patientReferrals: calculateReferrals(profile, allDentists),
      responseTime: profile?.Contact ? 45 : 120,
      satisfactionRate: profile?.NumOrdre ? 85 : 65
    };

    setPersonalStats(stats);
  };

  const calculateDentistScore = (dentist) => {
    if (!dentist) return 0;
    
    let score = 0;
    if (dentist.Nom) score += 15;
    if (dentist.Prenom) score += 15;
    if (dentist.NumOrdre && dentist.NumOrdre.trim() !== "") score += 25;
    if (dentist.Contact && dentist.Contact.trim() !== "") score += 15;
    if (dentist.Region && dentist.Region.trim() !== "") score += 15;
    if (dentist.Titre && dentist.Titre.trim() !== "") score += 15;
    return score;
  };

  const calculateViews = (profile, allDentists) => {
    if (!allDentists || allDentists.length === 0) return 200;
    
    const score = calculateDentistScore(profile);
    const maxScore = allDentists.reduce((max, d) => Math.max(max, calculateDentistScore(d)), 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    return Math.floor((percentage / 100) * 1500) + 200;
  };

  const calculateReferrals = (profile, allDentists) => {
    if (!allDentists || allDentists.length === 0) return 10;
    
    const score = calculateDentistScore(profile);
    const maxScore = allDentists.reduce((max, d) => Math.max(max, calculateDentistScore(d)), 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    return Math.floor((percentage / 100) * 80) + 10;
  };

  const generateChartData = (profile, allDentists) => {
    // 1. Performance mensuelle basée sur le mois d'inscription
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = months.map((month, index) => {
      const dentistsThisMonth = allDentists.filter(d => {
        if (!d.Date) return false;
        try {
          const dateParts = d.Date.split('/');
          if (dateParts.length === 3) {
            const monthNum = parseInt(dateParts[1]) - 1;
            return monthNum === index;
          }
          return false;
        } catch {
          return false;
        }
      }).length;
      
      const userMonth = profile?.Date ? 
        (() => {
          try {
            const dateParts = profile.Date.split('/');
            if (dateParts.length === 3) {
              return parseInt(dateParts[1]) - 1 === index ? 100 : 0;
            }
          } catch {}
          return 0;
        })() : 0;
      
      return {
        month,
        vous: userMonth,
        inscriptions: dentistsThisMonth * 10,
        moyenne: Math.floor(allDentists.length / 12) * 10
      };
    });
    setMonthlyPerformance(monthlyData);

    // 2. Compétences basées sur les données réelles
    const skills = [
      { 
        subject: 'Profil', 
        vous: calculateDentistScore(profile), 
        moyenne: allDentists.length > 0 ? 
          Math.floor(allDentists.reduce((sum, d) => sum + calculateDentistScore(d), 0) / allDentists.length) : 0,
        fullMark: 100 
      },
      { 
        subject: 'Contact', 
        vous: profile?.Contact ? 100 : 0, 
        moyenne: allDentists.length > 0 ? 
          Math.floor((allDentists.filter(d => d.Contact).length / allDentists.length) * 100) : 0,
        fullMark: 100 
      },
      { 
        subject: 'Numéro Ordre', 
        vous: profile?.NumOrdre ? 100 : 0, 
        moyenne: allDentists.length > 0 ? 
          Math.floor((allDentists.filter(d => d.NumOrdre).length / allDentists.length) * 100) : 0,
        fullMark: 100 
      },
      { 
        subject: 'Localisation', 
        vous: profile?.Region ? 100 : 0, 
        moyenne: allDentists.length > 0 ? 
          Math.floor((allDentists.filter(d => d.Region).length / allDentists.length) * 100) : 0,
        fullMark: 100 
      },
      { 
        subject: 'Spécialité', 
        vous: profile?.Titre ? 100 : 0, 
        moyenne: allDentists.length > 0 ? 
          Math.floor((allDentists.filter(d => d.Titre).length / allDentists.length) * 100) : 0,
        fullMark: 100 
      }
    ];
    setSkillData(skills);

    // 3. Statistiques régionales
    if (profile?.Region && allDentists.length > 0) {
      const dentistsInRegion = allDentists.filter(d => d.Region === profile.Region);
      const regionCompletion = dentistsInRegion.length > 0 
        ? Math.floor(dentistsInRegion.reduce((sum, d) => sum + calculateDentistScore(d), 0) / dentistsInRegion.length)
        : 0;
      
      // Calcul de la région la plus peuplée
      const regionCounts = {};
      allDentists.forEach(d => {
        if (d.Region) {
          regionCounts[d.Region] = (regionCounts[d.Region] || 0) + 1;
        }
      });
      
      let bestRegionName = '';
      let bestRegionCount = 0;
      
      Object.entries(regionCounts).forEach(([region, count]) => {
        if (count > bestRegionCount) {
          bestRegionCount = count;
          bestRegionName = region;
        }
      });
      
      const regionStatsData = [
        { 
          name: 'Votre région', 
          dentistes: dentistsInRegion.length, 
          completion: regionCompletion 
        }
      ];
      
      if (bestRegionName) {
        regionStatsData.push({ 
          name: 'Région la plus peuplée', 
          dentistes: bestRegionCount, 
          completion: bestRegionName === profile.Region ? regionCompletion : 75 
        });
      }
      
      regionStatsData.push({ 
        name: 'Moyenne nationale', 
        dentistes: Object.keys(regionCounts).length > 0 ? 
          Math.floor(allDentists.length / Object.keys(regionCounts).length) : 0, 
        completion: 65 
      });
      
      setRegionStats(regionStatsData);
    } else {
      // Données par défaut
      setRegionStats([
        { name: 'Votre région', dentistes: 0, completion: 0 },
        { name: 'Région la plus peuplée', dentistes: 0, completion: 0 },
        { name: 'Moyenne nationale', dentistes: 0, completion: 65 }
      ]);
    }
  };

  const calculateGenderStats = async () => {
    try {
      // Utiliser l'endpoint /stats/check-values pour récupérer les statistiques de titre
      const response = await axios.get("http://localhost:3002/check-values");
      const titleData = response.data?.data?.titre || [];
      
      const genderStatsData = titleData.map(item => ({
        name: item.Titre || 'Non spécifié',
        value: parseInt(item.count) || 0,
        color: item.Titre === 'Docteur' ? themeColors.primary : 
               item.Titre === 'Professeur' ? themeColors.accent :
               item.Titre === 'Docteur Spécialiste' ? themeColors.warning : 
               themeColors.darkBlue
      }));
      
      setGenderStats(genderStatsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de titre:", error);
      // Données par défaut
      setGenderStats([
        { name: 'Docteur', value: 0, color: themeColors.primary },
        { name: 'Professeur', value: 0, color: themeColors.accent },
        { name: 'Docteur Spécialiste', value: 0, color: themeColors.warning }
      ]);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, isRank = false }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color + '20' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className={`stat-value ${isRank ? 'rank-value' : ''}`}>
          {isRank && <span className="rank-prefix">#</span>}
          {value}
        </div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="stats-container loading">
        <div className="spinner"></div>
        <p>Analyse de votre position parmi les dentistes...</p>
      </div>
    );
  }

  return (
    <div className="stats-container">
      {/* En-tête personnalisé */}
      <div className="stats-header">
        <div className="header-content">
          <div>
            <h1>📊 Vos Statistiques Personnelles</h1>
            <p className="header-subtitle">
              {profile ? `${profile.Titre || ''} ${profile.Nom || ''} ${profile.Prenom || ''}` : 'Dentiste'} • 
              Analyse de votre position parmi {allDentistes.length} dentistes
            </p>
          </div>
        </div>
      </div>

      {/* Section: Votre position parmi tous les dentistes */}
      <div className="section">
        <h2 className="section-title">🏆 Votre Position Nationale</h2>
        
        <div className="stats-grid">
          <StatCard
            title="Classement National"
            // value={personalStats.rankNational}
            icon="🇲🇬"
            color={themeColors.primary}
            subtitle={`sur ${allDentistes.length} dentistes`}
            isRank={true}
          />
          <StatCard
            title="Classement Régional"
            // value={personalStats.rankRegional}
            icon="📍"
            color={themeColors.accent}
            subtitle={`${personalStats.totalInRegion} dentistes dans votre région`}
            isRank={true}
          />
        </div>
      </div>

      {/* Section: Performance détaillée */}
      <div className="section">
        <h2 className="section-title accent">📊 Performance Mensuelle</h2>
        
        <div className="charts-grid">
          <div className="chart-card">
            <h3>📅 Évolution des inscriptions</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F4FC" />
                  <XAxis dataKey="month" stroke="#3498DB" />
                  <YAxis stroke="#3498DB" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: themeColors.secondary,
                      borderColor: themeColors.primary,
                      color: themeColors.darkBlue
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="vous" 
                    name="Votre inscription" 
                    stroke={themeColors.primary} 
                    strokeWidth={3}
                    dot={{ fill: themeColors.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: themeColors.accent }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inscriptions" 
                    name="Nouveaux dentistes" 
                    stroke={themeColors.success} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Analyse régionale */}
      {profile?.Region && (
        <div className="section">
          <h2 className="section-title success">📍 Analyse de Votre Région: {profile.Region}</h2>
          
          <div className="region-grid">
            <div className="region-card">
              <h3>🏥 Dentistes dans votre région</h3>
              <div className="region-count">
                {personalStats.totalInRegion}
              </div>
              <div className="region-subtitle">
                Total des dentistes enregistrés dans {profile.Region}
              </div>
            </div>

            <div className="region-card">
              <h3>Titre</h3>
              <div className="chart-container small">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: themeColors.secondary,
                        borderColor: themeColors.primary,
                        color: themeColors.darkBlue
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Statistiques Régionales en bas */}
          <div className="region-stats-bottom">
            <div className="chart-card">
              <h3>📊 Statistiques Régionales</h3>
              <div className="chart-container" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F4FC" />
                    <XAxis dataKey="name" stroke="#3498DB" />
                    <YAxis stroke="#3498DB" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: themeColors.secondary,
                        borderColor: themeColors.primary,
                        color: themeColors.darkBlue
                      }}
                      formatter={(value) => [value, 'Dentistes']}
                    />
                    <Bar 
                      dataKey="dentistes" 
                      name="Nombre de dentistes" 
                      fill={themeColors.accent}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Objectifs et améliorations */}
      <div className="section">
        <h2 className="section-title warning">🎯 Objectifs d'Amélioration</h2>
        
        <div className="goals-card">
          
          <div className="recommendations">
            <div className="recommendations-title">Actions recommandées:</div>
            <div className="recommendations-grid">
              <div className="recommendation-item">
                <span className="recommendation-icon">📝</span>
                Complétez votre numéro d'ordre
              </div>
              <div className="recommendation-item">
                <span className="recommendation-icon">📍</span>
                Précisez votre localisation
              </div>
              <div className="recommendation-item">
                <span className="recommendation-icon">📞</span>
                Ajoutez vos contacts
              </div>
              <div className="recommendation-item">
                <span className="recommendation-icon">🎓</span>
                Spécifiez votre spécialité
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiques2;