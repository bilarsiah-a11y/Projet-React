import React, { useState, useEffect } from 'react';
import Card from '../Statistique/Card'
import '../sectionsCss/Statistiques.css';
import { statistiqueService } from '../Service/statistiqueService.js';

const Statistiques = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const total = totalData.total || 1; // Éviter la division par zéro

        const newCardsData = [
          {
            title: "Régions",
            color: {
              backGround: "linear-gradient(180deg, #bb67ff 0%, #4484f3 100%)",
              boxShadow: "0px 10px 20px 0px #e0c6f5",
            },
            barValue: Math.round((regionsData.length / 22) * 100), // 22 régions au maximum
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
              backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
              boxShadow: "0px 10px 20px 0px #FDC0C7",
            },
            barValue: Math.round((titresData.length / 5) * 100), // Estimation du nombre maximum de titres
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
              backGround: "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
              boxShadow: "0px 10px 20px 0px #F9D59B",
            },
            barValue: Math.round((domainesData.length / 3) * 100), // 3 domaines maximum
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
              backGround: "linear-gradient(180deg, #5efc8d 0%, #4ae571 100%)",
              boxShadow: "0px 10px 20px 0px #c6f5d5",
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