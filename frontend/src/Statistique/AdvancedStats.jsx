import React from 'react';
import Chart from 'react-apexcharts';
import './AdvancedStats.css';

const AdvancedStats = ({ title, data, type = 'bar' }) => {

 
const getChartOptions = () => {
  if (type === 'titre-region' || type === 'domaine-region') {
    const categories = [...new Set(data.map(item => item.Region))];
    const seriesMap = {};
    
    data.forEach(item => {
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

    return {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: true },
        background: 'transparent'
      },
      colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 6,
        },
      },
      dataLabels: { enabled: false },
      stroke: { 
        show: true, 
        width: 2, 
        colors: ['transparent'] 
      },
      xaxis: { 
        categories,
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Arial'
          }
        }
      },
      yaxis: { 
        title: { text: 'Nombre de dentistes' },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      fill: { opacity: 0.9 },
      tooltip: { 
        theme: 'light',
        style: {
          fontSize: '12px'
        }
      },
      grid: { 
        show: true, 
        borderColor: '#e5e7eb',
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      legend: { 
        position: 'top',
        horizontalAlign: 'center'
      }
    };
  }

  return {
    chart: { 
      type: 'line', 
      height: 350, 
      toolbar: { show: true },
      background: 'transparent'
    },
    stroke: { 
      curve: 'smooth', 
      width: 3 
    },
    markers: { size: 5 },
    xaxis: { type: 'category' },
    yaxis: { 
      title: { text: 'Count' }
    },
    colors: ['#3B82F6'],
    grid: { 
      show: true, 
      borderColor: '#e5e7eb',
      strokeDashArray: 0
    },
    tooltip: { theme: 'light' }
  };
};

  const getChartSeries = () => {
    if (type === 'titre-region' || type === 'domaine-region') {
      const categories = [...new Set(data.map(item => item.Region))];
      const seriesMap = {};
      
      data.forEach(item => {
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

    return [{ name: title, data: data.map(item => item.count) }];
  };

  return (
    <div className="advanced-stats-card">
      <div className="stats-header">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-actions">
          <button className="stats-btn active">Mois</button>
          <button className="stats-btn">Trimestre</button>
          <button className="stats-btn">Année</button>
        </div>
      </div>
      
      <div className="stats-content">
        <div className="chart-container">
          <Chart
            options={getChartOptions()}
            series={getChartSeries()}
            type={type === 'titre-region' || type === 'domaine-region' ? 'bar' : 'line'}
            height={350}
          />
        </div>
        
        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-label">Total combinaisons</span>
            <span className="summary-value">{data.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Régions couvertes</span>
            <span className="summary-value">{new Set(data.map(item => item.Region)).size}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Moyenne par région</span>
            <span className="summary-value">
              {Math.round(data.reduce((acc, item) => acc + item.count, 0) / new Set(data.map(item => item.Region)).size)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;