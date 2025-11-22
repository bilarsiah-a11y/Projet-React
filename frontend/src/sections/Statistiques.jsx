import React, { useState, useEffect } from 'react';
import Card from '../Statistique/Card';
import '../sectionsCss/Statistiques.css';

// URL de base de l'API
const API_BASE = "http://localhost:3002/Statistiques";

const Statistiques = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonctions de service directement dans le composant
  const statistiqueService = {
    getStatistiquesRegion: async () => {
      const res = await fetch(`${API_BASE}/region`);
      return res.json();
    },
    getStatistiquesTitre: async () => {
      const res = await fetch(`${API_BASE}/titre`);
      return res.json();
    },
    getStatistiquesDomaine: async () => {
      const res = await fetch(`${API_BASE}/domaine`);
      return res.json();
    },
    getTotalDentistes: async () => {
      const res = await fetch(`${API_BASE}/total`);
      return res.json();
    },
  };

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        setLoading(true);
        
        // Récupérer toutes les données en parallèle
        const [regionsData, titresData, domainesData, totalData] = await Promise.all([
          statistiqueService.getStatistiquesRegion(),
          statistiqueService.getStatistiquesTitre(),
          statistiqueService.getStatistiquesDomaine(),
          statistiqueService.getTotalDentistes()
        ]);

        // Calculer les pourcentages et préparer les données
        const total = totalData.total || 1;

       // Dans la partie où vous créez newCardsData, modifiez les couleurs :
const newCardsData = [
  {
    title: "Régions",
    color: {
      backGround: "linear-gradient(135deg, #87CEEB 0%, #9370DB 100%)", // Bleu ciel à violet
      boxShadow: "0px 10px 20px 0px rgba(135, 206, 235, 0.3)",
    },
    barValue: Math.round((regionsData.length / 22) * 100),
    value: `${regionsData.length} régions`,
    png: "FaMapMarker",
    series: [
      {
        name: "Dentistes par région",
        data: regionsData.map(region => region.count)
      },
    ],
    details: regionsData
  },
  {
    title: "Titres",
    color: {
      backGround: "linear-gradient(135deg, #87CEEB 0%, #6A5ACD 100%)", // Bleu ciel à slate blue
      boxShadow: "0px 10px 20px 0px rgba(135, 206, 235, 0.3)",
    },
    barValue: Math.round((titresData.length / 5) * 100),
    value: `${titresData.length} titres`,
    png: "MdTitle",
    series: [
      {
        name: "Dentistes par titre",
        data: titresData.map(titre => titre.count)
      },
    ],
    details: titresData
  },
  {
    title: "Domaines",
    color: {
      backGround: "linear-gradient(135deg, #9370DB 0%, #87CEEB 100%)", // Violet à bleu ciel
      boxShadow: "0px 10px 20px 0px rgba(147, 112, 219, 0.3)",
    },
    barValue: Math.round((domainesData.length / 3) * 100),
    value: `${domainesData.length} domaines`,
    png: "FaUserTie",
    series: [
      {
        name: "Dentistes par domaine",
        data: domainesData.map(domaine => domaine.count)
      },
    ],
    details: domainesData
  },
  {
    title: "Total Dentistes",
    color: {
      backGround: "linear-gradient(135deg, #6A5ACD 0%, #87CEEB 100%)", // Slate blue à bleu ciel
      boxShadow: "0px 10px 20px 0px rgba(106, 90, 205, 0.3)",
    },
    barValue: 100,
    value: `${totalData.total} dentistes`,
    png: "FaUsers",
    series: [
      {
        name: "Évolution",
        data: [totalData.total * 0.8, totalData.total * 0.9, totalData.total]
      },
    ],
    details: [{ label: 'Total', count: totalData.total }]
  }
];

        setCardsData(newCardsData);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Erreur fetch statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="Statistiques">
      <h2 className="statistiques-title">Statistiques des Dentistes</h2>
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
          />
        ))}
      </div>
    </div>
  );
};

export default Statistiques;