import React from 'react';
import Card from '../Statistique/Card'; // tu dois importer ton composant Card
import '../sections2Css/Statistiques2.css';
const Statistiques2 = () => {
  return (
    <div className="Statistiques2">
      {CardsData.map((card, id) => (
        <Card
          key={id}
          title={card.title}
          color={card.color}
          barValue={card.barValue}
          value={card.Value}
          png={card.png}
          series={card.series}
        />
      ))}
    </div>
  );
};

export default Statistiques2;
