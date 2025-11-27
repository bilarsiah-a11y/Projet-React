import React, { useState, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";
import { motion, LayoutGroup } from "framer-motion";
import Chart from 'react-apexcharts';
import { UilTimes } from '@iconscout/react-unicons';
import { FaMapMarker, FaUserTie, FaUsers, FaChartBar, FaChartPie } from "react-icons/fa";
import { MdTitle } from "react-icons/md";
import './card.css';



// icônes
const iconComponents = {
  FaMapMarker,
  MdTitle,
  FaUserTie,
  FaUsers,
  FaChartBar,
  FaChartPie
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
  const isPendingCard = param.title === "Inscriptions en Attente";
  const isVerifiedCard = param.title === "Dentistes Vérifiés";

  return (
    <motion.div
      className={`CompactCard ${isTotalCard ? 'no-progress-card' : ''}`}
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      onClick={setExpanded}
      layoutId={`expandableCard-${param.title}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      data-type={param.type}
    >
      <div className="card-header">
        <div className="card-icon-container">
          <IconComponent className="card-icon" />
        </div>
        {!isTotalCard && (
          <div className="circular-progress-container">
            <CircularProgressbar
              value={param.barValue}
              text={`${param.barValue}%`}
              styles={{
                root: { width: 60, height: 60 },
                path: { 
                  stroke: isPendingCard ? '#FF6B6B' : isVerifiedCard ? '#51CF66' : '#fff',
                  strokeLinecap: 'round',
                },
                text: { 
                  fill: '#fff', 
                  fontSize: '20px', 
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
        )}
      </div>
      
      <div className="card-content">
        <span className="card-title">{param.title}</span>
        <span className="card-value">{param.value}</span>
      </div>
    </motion.div>
  );
}

function ExpandedCard({ param, setExpanded }) {
  const [chartType, setChartType] = useState(
    param.type === 'titre-region' || param.type === 'domaine-region' ? 'bar' : 'area'
  );

  
 // Dans la fonction getChartOptions de ExpandedCard - version corrigée
const getChartOptions = () => {
  const isCombinedChart = param.type === 'titre-region' || param.type === 'domaine-region';
  
  if (isCombinedChart) {
    return {
      chart: {
        type: chartType,
        height: '100%',
        toolbar: { show: true },
        background: 'transparent',
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      colors: ['#3beaf6', '#8b4fec', '#17ce91', '#ecaa38', '#e66666', '#595bd3'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          borderRadius: 6,
        },
      },
      dataLabels: { enabled: false },
      stroke: chartType === 'line' ? { 
        width: 3,
        curve: 'smooth'
      } : { 
        show: true, 
        width: 2, 
        colors: ['transparent'] 
      },
      xaxis: { 
        categories: [...new Set(param.details.map(item => item.Region))],
        labels: { 
          style: { 
            colors: '#fff',
            fontSize: '12px',
            fontFamily: 'Segoe UI, sans-serif'
          } 
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { 
        labels: { 
          style: { 
            colors: '#fff',
            fontSize: '12px',
            fontFamily: 'Segoe UI, sans-serif'
          } 
        }
      },
      fill: chartType === 'line' ? {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      } : { 
        opacity: 0.9,
        type: 'solid'
      },
      tooltip: { 
        theme: 'dark',
        style: {
          fontSize: '12px',
          fontFamily: 'Segoe UI, sans-serif'
        }
      },
      grid: { 
        show: true, 
        borderColor: 'rgba(255, 255, 255, 0.1)',
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      legend: { 
        labels: { 
          colors: '#fff',
          useSeriesColors: false,
          fontFamily: 'Segoe UI, sans-serif'
        },
        position: 'top',
        horizontalAlign: 'center'
      }
    };
  } else {
    // Graphique simple pour les autres statistiques
    return {
      chart: {
        type: "area",
        height: '100%',
        toolbar: { show: true },
        background: 'transparent',
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      colors: ['#fff'],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
      dataLabels: { enabled: false },
      stroke: { 
        curve: "smooth", 
        width: 3,
        colors: ['#fff']
      },
      tooltip: { 
        theme: 'dark',
        style: {
          fontSize: '12px',
          fontFamily: 'Segoe UI, sans-serif'
        }
      },
      grid: { 
        show: true, 
        borderColor: 'rgba(255, 255, 255, 0.1)',
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        categories: param.series[0]?.data?.map((_, index) => `P${index + 1}`) || [],
        labels: { 
          style: { 
            colors: '#fff',
            fontSize: '12px',
            fontFamily: 'Segoe UI, sans-serif'
          } 
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { 
        labels: { 
          style: { 
            colors: '#fff',
            fontSize: '12px',
            fontFamily: 'Segoe UI, sans-serif'
          } 
        }
      }
    };
  }
};
  const getChartSeries = () => {
    const isCombinedChart = param.type === 'titre-region' || param.type === 'domaine-region';
    
    if (isCombinedChart) {
      const categories = [...new Set(param.details.map(item => item.Region))];
      const seriesMap = {};
      
      param.details.forEach(item => {
        const key = item.Titre || item.Domaine;
        if (!seriesMap[key]) {
          seriesMap[key] = {
            name: key,
            data: new Array(categories.length).fill(0)
          };
        }
        const regionIndex = categories.indexOf(item.Region);
        if (regionIndex !== -1) {
          seriesMap[key].data[regionIndex] = item.count;
        }
      });

      return Object.values(seriesMap);
    }

    return param.series || [];
  };

  const chartOptions = getChartOptions();
  const chartSeries = getChartSeries();
  const isCombinedChart = param.type === 'titre-region' || param.type === 'domaine-region';

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow
      }}
      layoutId={`expandableCard-${param.title}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header avec titre et bouton fermer bien visible */}
      <div className="expanded-header">
        <div className="header-left">
          <span className="expanded-title">{param.title}</span>
          {isCombinedChart && (
            <div className="chart-type-selector">
              <button 
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                📊 Barres
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                📈 Lignes
              </button>
            </div>
          )}
        </div>
        <UilTimes 
          onClick={setExpanded} 
          className="close-icon"
          size="24"
        />
      </div>
      
      {/* Graphique principal - Plus grand et plus visible */}
      <div className="chartContainer">
        {chartSeries.length > 0 ? (
          <Chart 
            options={chartOptions}
            series={chartSeries}
            type={isCombinedChart ? chartType : 'area'}
            height={350}
            width="100%"
          />
        ) : (
          <div className="no-data-message">
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Détails réduits pour plus de place au graphique */}
      <div className="details-section">
        <div className="details-header">
          <h4>Détails</h4>
          <span className="items-count">{param.details?.length || 0} éléments</span>
        </div>
        <div className="details-grid">
          {param.details && param.details.slice(0, 6).map((item, index) => (
            <div key={index} className="detail-item">
              <span className="detail-label">
                {item.Region && `${item.Region} - `}
                {item.Titre || item.Domaine || item.label}
              </span>
              <span className="detail-value">{item.count}</span>
            </div>
          ))}
          {param.details && param.details.length > 6 && (
            <div className="more-items">
              + {param.details.length - 6} autres éléments
            </div>
          )}
        </div>
      </div>
      
      {/* Footer simplifié */}
      <div className="card-footer">
        <span className="update-info">Données en temps réel</span>
        <span className="chart-type-info">
          {isCombinedChart ? (chartType === 'bar' ? 'Graphique en barres' : 'Graphique en lignes') : 'Graphique en aires'}
        </span>
      </div>
    </motion.div>
  );
}

export default Card;