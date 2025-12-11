import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../sections2Css/Apropos2.css";

const Apropos2 = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    views: 0,
    patientsReferred: 0,
    profileCompletion: 0,
    totalDentistes: 0,
    dentistesApprouves: 0,
    regionsCouvertes: 0
  });
  const [recentDentistes, setRecentDentistes] = useState([]);
  const [regionsData, setRegionsData] = useState([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [hasProfil, setHasProfil] = useState(false);

  const display = (value) => (value ? value : "—");

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log("Utilisateur connecté:", parsedUser.username);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error("Aucun token trouvé");
          setLoading(false);
          return;
        }

        // CORRECTION : Utiliser /Users au lieu de /Profil
        const res = await axios.post(
          "http://localhost:3002/Users",
          {},
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        console.log("✅ Données du profil reçues:", res.data);

        if (res.data) {
          setProfile(res.data);
          
          // CORRECTION : Vérifier si le profil existe
          const userHasProfil = res.data && res.data.hasProfil && res.data.Nom;
          setHasProfil(userHasProfil);
          
          if (userHasProfil) {
            // CORRECTION : Calculer le pourcentage exact
            const requiredFields = [
              "Nom", "Prenom", "Date", "Lieu", "genre", "Adresse",
              "NumOrdre", "Contact", "Titre", "Domaine", "Region"
            ];
            
            const filledFields = requiredFields.filter(field => 
              res.data[field] && res.data[field].trim() !== ""
            );
            const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);
            
            console.log("📊 Calcul pourcentage:", {
              filled: filledFields.length,
              total: requiredFields.length,
              percentage: completionPercentage
            });
            
            // Définir si le profil est complet
            const isComplete = completionPercentage === 100;
            setProfileComplete(isComplete);
            
            // Récupérer les autres données
            await fetchDashboardStats();
            await fetchRecentDentistes();
            await fetchRegionsStats();
            
            // Mettre à jour le pourcentage
            setStats(prev => ({
              ...prev,
              profileCompletion: completionPercentage
            }));
          } else {
            // Pas de profil = 0%
            setProfileComplete(false);
            setStats(prev => ({
              ...prev,
              profileCompletion: 0
            }));
          }
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement du profil:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/connexion');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('http://localhost:3002/dashboard/stats');
        setStats(prev => ({
          ...prev,
          totalDentistes: response.data.totalDentistes || 0,
          dentistesApprouves: response.data.dentistesApprouves || 0,
          regionsCouvertes: response.data.regionsCouvertes || 0
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
      }
    };

    const fetchRecentDentistes = async () => {
      try {
        const response = await axios.get('http://localhost:3002/dentistes/recent', {
          params: { limit: 4 }
        });
        setRecentDentistes(response.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des dentistes récents:', error);
      }
    };

    const fetchRegionsStats = async () => {
      try {
        const response = await axios.get('http://localhost:3002/stats/regions');
        setRegionsData(response.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des stats régions:', error);
      }
    };

    fetchProfile();
  }, [navigate]);

  const getInitial = () => {
    if (profile && profile.Nom) {
      return profile.Nom.trim()[0].toUpperCase();
    }
    if (profile && profile.Prenom) {
      return profile.Prenom.trim()[0].toUpperCase();
    }
    if (user && user.username) {
      return user.username[0].toUpperCase();
    }
    return "D";
  };

  const getSpecialite = () => {
    if (profile && profile.Titre) {
      return profile.Titre;
    }
    return "Dentiste Généraliste";
  };

  const getFullName = () => {
    if (profile && profile.Nom && profile.Prenom ) {
      return `${profile.Nom} ${profile.Prenom} `;
    }
    if (profile && profile.Prenom) {
      return profile.Prenom;
    }
    if (user && user.username) {
      return user.username;
    }
    return "Dentiste";
  };

  const isProfileVerified = () => {
    return profile && profile.NumOrdre && profile.NumOrdre !== "";
  };

  // Calculer la position dans la région
  const getRegionRank = () => {
    if (!profile?.Region || regionsData.length === 0) return null;
    
    const region = regionsData.find(r => r.name === profile.Region);
    if (!region) return null;
    
    const sortedRegions = [...regionsData].sort((a, b) => b.count - a.count);
    const rank = sortedRegions.findIndex(r => r.name === profile.Region) + 1;
    
    return {
      rank,
      totalInRegion: region.count,
      totalRegions: sortedRegions.length
    };
  };

  const regionRank = getRegionRank();

  // Conseils personnalisés selon l'état du profil - VERSION COMPLÈTE
  const getPersonalizedTips = () => {
    const tips = [];
    
    // 3 ÉTATS DISTINCTS
    if (!hasProfil) {
      // ÉTAT 1 : Pas de profil du tout
      tips.push({
        icon: "📋",
        title: "Créez votre profil dentiste",
        description: "Commencez par créer votre profil professionnel pour apparaître dans les listes",
        priority: "urgent"
      });
      
      tips.push({
        icon: "💼",
        title: "Ajoutez vos informations",
        description: "Remplissez vos informations personnelles et professionnelles",
        priority: "important"
      });
      
      tips.push({
        icon: "📍",
        title: "Indiquez votre localisation",
        description: "Les patients cherchent des dentistes près de chez eux",
        priority: "important"
      });
      
      tips.push({
        icon: "📞",
        title: "Ajoutez vos contacts",
        description: "Rendez-vous accessible pour les prises de rendez-vous",
        priority: "normal"
      });
      
    } else if (!profileComplete) {
      // ÉTAT 2 : Profil créé mais incomplet
      // Identifier les champs manquants
      const missingFields = [];
      
      if (!profile?.Adresse) missingFields.push("adresse");
      if (!profile?.Contact) missingFields.push("contact");
      if (!profile?.NumOrdre) missingFields.push("numéro d'ordre");
      if (!profile?.Lieu) missingFields.push("lieu");
      if (!profile?.Domaine) missingFields.push("domaine d'exercice");
      if (!profile?.Region) missingFields.push("région");
      
      // Conseils selon les champs manquants
      if (missingFields.length > 0) {
        tips.push({
          icon: "⚠️",
          title: `${missingFields.length} champ(s) manquant(s)`,
          description: `Complétez: ${missingFields.join(', ')}`,
          priority: "urgent"
        });
      }
      
      // Conseils généraux pour l'amélioration
      tips.push({
        icon: "📈",
        title: `Profil à ${stats.profileCompletion}%`,
        description: "Complétez votre profil pour augmenter votre visibilité",
        priority: "important"
      });
      
      tips.push({
        icon: "👁️",
        title: "Apparaître dans les recherches",
        description: "Un profil complet est 3fois plus visible",
        priority: "normal"
      });
      
      tips.push({
        icon: "🌟",
        title: "Gagnez en crédibilité",
        description: "Les patients font confiance aux profils complets",
        priority: "normal"
      });
      
    } else {
      // ÉTAT 3 : Profil complet (100%)
      tips.push({
        icon: "⭐",
        title: "Profil 100% complet !",
        description: "Votre profil est 3x plus visible que les profils incomplets",
        priority: "success"
      });
      
      tips.push({
        icon: "👁️",
        title: "Visibilité maximale",
        description: "Vous apparaissez en priorité dans les recherches",
        priority: "success"
      });
      
      tips.push({
        icon: "📈",
        title: "Améliorez votre position",
        description: "Activez les avis patients pour monter dans les classements",
        priority: "normal"
      });
      
      tips.push({
        icon: "💬",
        title: "Répondez rapidement",
        description: "Répondez sous 24h aux demandes pour garder un bon score",
        priority: "normal"
      });
    }
    
    // Si pas assez de conseils (cas rare), ajouter des conseils généraux
    if (tips.length < 4) {
      const generalTips = [
        {
          icon: "📸",
          title: "Ajoutez des photos",
          description: "Des photos de qualité augmentent la confiance des patients",
          priority: "normal"
        },
        {
          icon: "⏰",
          title: "Mettez à jour vos horaires",
          description: "Des horaires à jour réduisent les annulations",
          priority: "normal"
        },
        {
          icon: "💰",
          title: "Indiquez vos tarifs",
          description: "Une transparence tarifaire attire plus de patients",
          priority: "normal"
        }
      ];
      
      while (tips.length < 4 && generalTips.length > 0) {
        tips.push(generalTips.shift());
      }
    }
    
    return tips.slice(0, 4);
  };

  const personalizedTips = getPersonalizedTips();

  if (loading) {
    return (
      <div className="dentiste-accueil">
        <div className="dentiste-main-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Chargement de votre espace dentiste...</div>
          </div>
        </div>
      </div>
    );
  }

  // Si pas de profil après chargement mais utilisateur connecté
  if (!hasProfil && user) {
    return (
      <div className="dentiste-accueil">
        <div className="dentiste-main-content">
          <section className="bienvenue-section">
            <div className="bienvenue-card">
              <div className="bienvenue-content">
                <h2>Bienvenue Dr. {user.username} sur votre espace dentiste !</h2>
                <p>
                  Vous n'avez pas encore créé votre profil professionnel. Créez-le maintenant 
                  pour le rendre visible aux patients et bénéficier de toutes les fonctionnalités.
                </p>
                <Link to="/profil" className="btn-completer">
                  Créer mon profil
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Si aucun utilisateur connecté
  if (!user) {
    return (
      <div className="dentiste-accueil">
        <div className="dentiste-main-content">
          <div className="error-section">
            <h2>Accès non autorisé</h2>
            <p>Veuillez vous connecter pour accéder à cette page.</p>
            <Link to="/connexion" className="btn-completer">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dentiste-accueil">
      <div className="dentiste-main-content">
        
        {/* === 1ère CARD : Section de Bienvenue (pleine largeur) === */}
        <section className="bienvenue-section">
          <div className="bienvenue-card">
            <div className="bienvenue-content">
              <h2>Bienvenue  sur votre espace dentiste !</h2>
              <p>
                {profileComplete 
                  ? " Votre profil est complet et visible par vos patients. Vous pouvez continuer à l'enrichir."
                  : hasProfil 
                    ? `⚠️ Votre profil est créé mais incomplet (${stats.profileCompletion}%). Complétez-le pour le rendre visible à vos futurs patients.`
                    : "📋 Créez votre profil pour apparaître dans les recherches des patients."}
              </p>
            </div>
          </div>
        </section>

        {/* === 2ème CARD : Header du Profil (colonne gauche) - VERSION INTELLIGENTE === */}
        <section className="profil-header-section">
          <div className="profil-header-card">
            <div className="profil-identite">
              <div className="avatar-container">
                <div className={`avatar-dentiste-small ${!hasProfil ? 'create-profile' : ''}`}>
                  {!hasProfil ? '➕' : getInitial()}
                </div>
                {hasProfil && isProfileVerified() && (
                  <span className="verification-badge-small" title="Profil vérifié">
                    ✅
                  </span>
                )}
              </div>
              <div className="identite-info-small">
                <div className="nom-titre-small">
                  <h3>
                    {!hasProfil 
                      ? `Dr. ${user.username}` 
                      : profile.Titre 
                        ? `${profile.Titre} ${getFullName()}` 
                        : `Dr. ${getFullName()}`
                    }
                  </h3>
                  <span className={`status-indicator ${
                    !hasProfil ? 'status-pending' : 
                    !profileComplete ? 'status-incomplete' : 
                    'status-complete'
                  }`}>
                    {!hasProfil ? '⏳ Sans profil' : 
                     !profileComplete ? `⚠️ ${stats.profileCompletion}%` : 
                     '✅ 100% complet'}
                  </span>
                </div>
                <p className="specialite-small">
                  {!hasProfil ? 'Profil à créer' : getSpecialite()}
                </p>
                
                <div className="contact-mini-small">
                  {!hasProfil ? (
                    <>
                      <span className="contact-item-small">
                        <span className="icon">👤</span>
                        {user.username}
                      </span>
                      <span className="contact-item-small">
                        <span className="icon">✉️</span>
                        {user.email}
                      </span>
                      <span className="contact-item-small">
                        <span className="icon">🚀</span>
                        Prêt à commencer
                      </span>
                    </>
                  ) : (
                    <>
                      {profile.Lieu && (
                        <span className="contact-item-small">
                          <span className="icon">📍</span>
                          {display(profile.Lieu)}, {display(profile.Region)}
                        </span>
                      )}
                      {profile.Contact && (
                        <span className="contact-item-small">
                          <span className="icon">📞</span>
                          {display(profile.Contact)}
                        </span>
                      )}
                      {user.email && (
                        <span className="contact-item-small">
                          <span className="icon">✉️</span>
                          {display(user.email)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="profil-actions-small">
              <Link 
                to="/profil" 
                className={`btn-secondary-small ${!hasProfil ? 'create-btn' : ''}`}
              >
                <span className="icon">
                  {!hasProfil ? '➕' : '✏️'}
                </span>
                {!hasProfil ? 'Créer mon profil' : 
                 !profileComplete ? 'Compléter le profil' : 'Modifier le profil'}
              </Link>
            </div>
          </div>
        </section>

        {/* === 3ème CARD : Section Statistiques Personnelles (colonne droite) === */}
        <section className="stats-section">
          <div className="stats-header">
            <h3>Votre visibilité sur la plateforme</h3>
            {regionRank && (
              <div className="region-rank-small">
                <span className="icon">📈</span>
                <span>#{regionRank.rank} dans {profile.Region}</span>
              </div>
            )}
          </div>
          <div className="stats-grid-compact">
            <div className="stat-card-compact">
              <div className="stat-icon-compact completion">
                <span className="icon">⭐</span>
              </div>
              <div className="stat-content-compact">
                <h4>{stats.profileCompletion}%</h4>
                <p>Profil complété</p>
              </div>
            </div>
            <div className="stat-card-compact">
              <div className="stat-icon-compact">
                <span className="icon">🗺️</span>
              </div>
              <div className="stat-content-compact">
                <h4>{stats.regionsCouvertes}</h4>
                <p>Régions couvertes</p>
              </div>
            </div>
          </div>
        </section>


        {/* === 5ème CARD : Section Conseils Personnalisés (2x2) === */}
        <section className="tips-section-compact">
          <div className="tips-header-small">
            <h3>Conseils pour améliorer votre visibilité</h3>
            <p>Recommandations personnalisées selon votre profil</p>
          </div>
          <div className="tips-grid-compact">
            {personalizedTips.map((tip, index) => (
              <div 
                key={index} 
                className={`tip-card-compact ${
                  tip.priority === 'urgent' ? 'urgent' : 
                  tip.priority === 'important' ? 'important' :
                  tip.priority === 'success' ? 'success' : 
                  'normal'
                }`}
              >
                <div className="tip-icon">{tip.icon}</div>
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
                {tip.priority === 'urgent' && (
                  <span className="priority-badge">Prioritaire</span>
                )}
                {tip.priority === 'important' && (
                  <span className="important-badge">Important</span>
                )}
                {tip.priority === 'success' && (
                  <span className="success-badge">Réussi</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* === 6ème CARD : Espace libre pour future fonctionnalité === */}
        <section className="empty-section">
          <div className="empty-card">
            <div className="empty-content">
              <div className="empty-icon">🚀</div>
              <h3>Fonctionnalités à venir</h3>
              <p>Bientôt de nouvelles fonctionnalités pour améliorer votre expérience</p>
            </div>
          </div>
        </section>

        {/* === 7ème CARD : Call to Action Final (pleine largeur) === */}
        <section className="cta-section-compact">
          <div className="cta-card-compact">
            <div className="cta-content-compact">
              <h3>Prêt à recevoir plus de patients ?</h3>
              <p>
                {!hasProfil 
                  ? "Créez votre profil dentiste maintenant pour apparaître dans les recherches et attirer des patients locaux."
                  : !profileComplete 
                    ? `Complétez votre profil (actuellement à ${stats.profileCompletion}%) pour apparaître dans les recherches et attirer des patients locaux.`
                    : "✅ Votre profil est optimisé ! Continuez à le mettre à jour pour maintenir votre visibilité."}
              </p>
              <div className="cta-buttons-compact">
                <Link to="/profil" className="btn-cta-small">
                  {!hasProfil ? "Créer mon profil" : 
                   !profileComplete ? "Compléter mon profil" : "Vérifier mon profil"}
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Apropos2;