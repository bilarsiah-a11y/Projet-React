import React, { useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";
import { motion, LayoutGroup } from "framer-motion";
import Chart from 'apexcharts';
import { UilTimes } from '@iconscout/react-unicons';
import { FaMapMarker, FaUserTie, FaUsers } from "react-icons/fa";
import { MdTitle } from "react-icons/md";
import './card.css';

// icônes
const iconComponents = {
  FaMapMarker,
  MdTitle,
  FaUserTie,
  FaUsers
};

const Card = (props) => {
  const [expanded, setExpanded] = useState(false);

  const getIconComponent = (iconName) => {
    return iconComponents[iconName] || FaUsers;
  };

  const IconComponent = getIconComponent(props.png);

  return (
    <div className="card">
      <LayoutGroup>
        {expanded ? (
          <ExpandedCard 
            param={{...props, png: IconComponent}} 
            setExpanded={() => setExpanded(false)} 
          />
        ) : (
          <CompactCard 
            param={{...props, png: IconComponent}} 
            setExpanded={() => setExpanded(true)} 
          />
        )}
      </LayoutGroup>
    </div>
  );
};

function CompactCard({ param, setExpanded }) {
  const IconComponent = param.png;
  
  const isTotalCard = param.title === "Total Dentistes";

  return (
    <motion.div
      className="CompactCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      onClick={setExpanded}
      layoutId={`expandableCard-${param.title}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="card-header">
        <div className="card-icon-container">
          <IconComponent className="card-icon" />
        </div>
        {!isTotalCard ? (
          // CircularProgressbar pour  3 premières 
          <div className="circular-progress-container">
            <CircularProgressbar
              value={param.barValue}
              text={`${param.barValue}%`}
              styles={{
                root: { width: 60, height: 60 },
                path: { 
                  stroke: '#fff',
                  strokeLinecap: 'round',
                },
                text: { 
                  fill: '#fff', 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  dominantBaseline: 'middle',
                  textAnchor: 'middle'
                },
                trail: { 
                  stroke: 'rgba(255,255,255,0.2)',
                  strokeLinecap: 'round',
                }
              }}
            />
          </div>
        ) : (
        
          <div className="card-percentage">
            100%
          </div>
        )}
      </div>
      
      <div className="card-content">
        <span className="card-title">{param.title}</span>
        <span className="card-value">{param.value}</span>
      </div>

    </motion.div>
  );
}

// ... (ExpandedCard reste inchangé)
function ExpandedCard({ param, setExpanded }) {
  const chartOptions = {
    chart: {
      type: "area",
      height: "auto",
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#fff'],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    tooltip: {
      theme: 'dark'
    },
    grid: {
      show: true,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false
        }
      },   
      yaxis: {
        lines: {
          show: true
        }
      },  
    },
    xaxis: {
      categories: param.series[0].data.map((_, index) => `Point ${index + 1}`),
      labels: {
        style: {
          colors: '#fff'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#fff'
        }
      }
    }
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow
      }}
      layoutId={`expandableCard-${param.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="expanded-header">
        <span className="expanded-title">{param.title}</span>
        <UilTimes 
          onClick={setExpanded} 
          className="close-icon"
        />
      </div>
      
      <div className="chartContainer">
        <Chart 
          options={chartOptions}
          series={param.series}
          type="area"
          height={300}
        />
      </div>

      <div className="details-list">
        <h4>Détails :</h4>
        {param.details && param.details.map((item, index) => (
          <div key={index} className="detail-item">
            <span className="detail-label">{item.Region || item.Titre || item.Domaine || item.label}:</span>
            <span className="detail-value">{item.count}</span>
          </div>
        ))}
      </div>
      
      <span className="update-info">Mise à jour en temps réel</span>
    </motion.div>
  );
}

export default Card;