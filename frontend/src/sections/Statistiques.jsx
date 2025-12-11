import React, { useEffect, useState } from 'react';
import "../sectionsCss/Statistiques.css"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Enregistrer TOUS les plugins nécessaires
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const API_BASE_URL = 'http://localhost:3002';

const Statistiques = () => {
    const [statsTitreDomaineRegion, setStatsTitreDomaineRegion] = useState([]);
    const [statsTitreRegion, setStatsTitreRegion] = useState([]);
    const [statsDomaineRegion, setStatsDomaineRegion] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');
    const [activeTab, setActiveTab] = useState('tab1');
    const [totalRecords, setTotalRecords] = useState(0);
    const [uniqueTitles, setUniqueTitles] = useState(0);
    const [totalRegions, setTotalRegions] = useState(0);
    const [dataInfo, setDataInfo] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('🔄 Début du chargement des statistiques...');
            
            // Test de connexion au serveur - CORRIGÉ : sans /stats dans le chemin
            const testResponse = await fetch(`${API_BASE_URL}/test-connection`);
            
            // Vérifier si la réponse est du JSON
            const contentType = testResponse.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await testResponse.text();
                console.error('❌ Réponse non-JSON reçue:', text.substring(0, 200));
                throw new Error('Le serveur a retourné une réponse non-JSON');
            }
            
            const testData = await testResponse.json();
            
            console.log('🔍 Résultat test connexion:', testData);
            
            if (!testData.success) {
                throw new Error(`Problème de connexion: ${testData.error || 'Serveur non disponible'}`);
            }
            
            setServerStatus('connected');
            
            if (testData.database && testData.database.tableExists) {
                setDataInfo(`Base: ${testData.database.tableName} | Enregistrements: ${testData.database.totalRecords}`);
                
                // Charger les données réelles avec timeout
                const fetchWithTimeout = (url, timeout = 5000) => {
                    return Promise.race([
                        fetch(url).then(async response => {
                            const contentType = response.headers.get("content-type");
                            if (!contentType || !contentType.includes("application/json")) {
                                const text = await response.text();
                                throw new Error(`Réponse non-JSON de ${url}: ${text.substring(0, 100)}`);
                            }
                            const data = await response.json();
                            // Retourner seulement les données réelles
                            return data.data || [];
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error(`Timeout sur ${url}`)), timeout)
                        )
                    ]);
                };
                
                // CORRIGÉ : URLs sans /stats devant
                const [data1, data2, data3] = await Promise.all([
                    fetchWithTimeout(`${API_BASE_URL}/stats-titre-domaine-region`).catch(err => {
                        console.warn('Erreur sur stats-titre-domaine-region:', err.message);
                        return [];
                    }),
                    fetchWithTimeout(`${API_BASE_URL}/stats-titre-region`).catch(err => {
                        console.warn('Erreur sur stats-titre-region:', err.message);
                        return [];
                    }),
                    fetchWithTimeout(`${API_BASE_URL}/stats-domaine-region`).catch(err => {
                        console.warn('Erreur sur stats-domaine-region:', err.message);
                        return [];
                    })
                ]);
                
                console.log('📥 Données réelles reçues:', {
                    titreDomaineRegion: Array.isArray(data1) ? data1.length : 0,
                    titreRegion: Array.isArray(data2) ? data2.length : 0,
                    domaineRegion: Array.isArray(data3) ? data3.length : 0
                });
                
                // Stocker les données réelles
                setStatsTitreDomaineRegion(Array.isArray(data1) ? data1 : []);
                setStatsTitreRegion(Array.isArray(data2) ? data2 : []);
                setStatsDomaineRegion(Array.isArray(data3) ? data3 : []);
                
                // Calculer les résumés avec sécurité
                if (Array.isArray(data2) && data2.length > 0) {
                    const total = data2.reduce((sum, item) => {
                        const count = item && typeof item === 'object' && 'count' in item 
                            ? Number(item.count) || 0 
                            : 0;
                        return sum + count;
                    }, 0);
                    
                    const titles = new Set(
                        data2
                            .map(item => item && item.Titre)
                            .filter(Boolean)
                    );
                    
                    const regions = new Set(
                        data2
                            .map(item => item && item.Region)
                            .filter(Boolean)
                    );
                    
                    setTotalRecords(total);
                    setUniqueTitles(titles.size);
                    setTotalRegions(regions.size);
                }
                
                setError(null);
            } else {
                throw new Error(`Table non trouvée dans la base de données`);
            }
            
            setLoading(false);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            setServerStatus('disconnected');
            setError(`Serveur indisponible: ${error.message}`);
            
            // Ne pas charger de données de démonstration
            setStatsTitreDomaineRegion([]);
            setStatsTitreRegion([]);
            setStatsDomaineRegion([]);
            setTotalRecords(0);
            setUniqueTitles(0);
            setTotalRegions(0);
            
            setLoading(false);
        }
    };

    // Fonction utilitaire pour obtenir count en toute sécurité
    const getSafeCount = (item) => {
        if (!item || typeof item !== 'object') return 0;
        return Number(item.count) || 0;
    };

    const prepareChart1Data = () => {
        const data = statsTitreDomaineRegion;
        
        if (!Array.isArray(data) || data.length === 0) {
            return {
                labels: ['Aucune donnée disponible'],
                datasets: [{
                    label: 'En attente de données',
                    data: [0],
                    backgroundColor: 'rgba(135, 206, 235, 0.3)',
                    borderColor: 'rgba(135, 206, 235, 0.5)',
                    borderWidth: 1
                }]
            };
        }
        
        // Extraire toutes les régions uniques
        const regions = [...new Set(
            data
                .filter(item => item && item.Region && item.Region !== 'Non spécifié')
                .map(item => item.Region)
        )];
        
        if (regions.length === 0) regions.push('Région non spécifiée');
        
        // Extraire toutes les combinaisons Titre-Domaine uniques
        const groups = [...new Set(
            data
                .filter(item => item && item.Titre && item.Domaine && 
                       item.Titre !== 'Non spécifié' && item.Domaine !== 'Non spécifié')
                .map(item => `${item.Titre}-${item.Domaine}`)
        )];
        
        if (groups.length === 0) {
            return {
                labels: regions,
                datasets: [{
                    label: 'Données totales',
                    data: regions.map(() => 
                        data.reduce((sum, item) => sum + getSafeCount(item), 0)
                    ),
                    backgroundColor: 'rgba(135, 206, 235, 0.6)'
                }]
            };
        }
        
        // Préparer les datasets
        const datasets = groups.map((group, index) => {
            const [titre, domaine] = group.split('-');
            const colorIndex = index % 8;
            const colors = [
                'rgba(135, 206, 235, 0.7)',   // Sky blue
                'rgba(70, 130, 180, 0.7)',    // Steel blue
                'rgba(100, 149, 237, 0.7)',   // Cornflower blue
                'rgba(30, 144, 255, 0.7)',    // Dodger blue
                'rgba(0, 191, 255, 0.7)',     // Deep sky blue
                'rgba(176, 224, 230, 0.7)',   // Powder blue
                'rgba(173, 216, 230, 0.7)',   // Light blue
                'rgba(135, 206, 250, 0.7)'    // Light sky blue
            ];
            
            const dataPoints = regions.map(region => {
                const item = data.find(d => 
                    d && d.Titre === titre && 
                    d.Domaine === domaine && 
                    d.Region === region
                );
                return item ? getSafeCount(item) : 0;
            });
            
            return {
                label: `${titre} (${domaine})`,
                data: dataPoints,
                backgroundColor: colors[colorIndex],
                borderColor: colors[colorIndex].replace('0.7', '1'),
                borderWidth: 1,
                borderRadius: 4
            };
        });
        
        return {
            labels: regions,
            datasets: datasets
        };
    };

    const prepareChart2Data = () => {
        const data = statsTitreRegion;
        
        if (!Array.isArray(data) || data.length === 0) {
            return {
                labels: ['Aucune donnée disponible'],
                datasets: [{
                    label: 'En attente de données',
                    data: [0],
                    backgroundColor: 'rgba(135, 206, 235, 0.3)',
                    borderColor: 'rgba(70, 130, 180, 0.5)',
                    borderWidth: 2,
                    fill: true
                }]
            };
        }
        
        const regions = [...new Set(
            data
                .filter(item => item && item.Region && item.Region !== 'Non spécifié')
                .map(item => item.Region)
        )];
        
        const titles = [...new Set(
            data
                .filter(item => item && item.Titre && item.Titre !== 'Non spécifié')
                .map(item => item.Titre)
        )];
        
        if (regions.length === 0) regions.push('Régions');
        if (titles.length === 0) titles.push('Titre non spécifié');
        
        const datasets = titles.map((titre, index) => {
            const colors = [
                'rgba(135, 206, 235, 0.4)',
                'rgba(70, 130, 180, 0.4)',
                'rgba(100, 149, 237, 0.4)',
                'rgba(30, 144, 255, 0.4)',
                'rgba(0, 191, 255, 0.4)'
            ];
            
            const dataPoints = regions.map(region => {
                const item = data.find(d => 
                    d && d.Titre === titre && d.Region === region
                );
                return item ? getSafeCount(item) : 0;
            });
            
            return {
                label: titre,
                data: dataPoints,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.4', '1'),
                borderWidth: 2,
                tension: 0.3,
                fill: true
            };
        });
        
        return {
            labels: regions,
            datasets: datasets
        };
    };

    const prepareChart3Data = () => {
        const data = statsDomaineRegion;
        
        if (!Array.isArray(data) || data.length === 0) {
            return {
                labels: ['Aucune donnée disponible'],
                datasets: [{
                    label: 'En attente de données',
                    data: [0],
                    backgroundColor: 'rgba(135, 206, 235, 0.3)'
                }]
            };
        }
        
        const regions = [...new Set(
            data
                .filter(item => item && item.Region && item.Region !== 'Non spécifié')
                .map(item => item.Region)
        )];
        
        const domaines = [...new Set(
            data
                .filter(item => item && item.Domaine && item.Domaine !== 'Non spécifié')
                .map(item => item.Domaine)
        )];
        
        if (regions.length === 0) regions.push('Régions');
        if (domaines.length === 0) domaines.push('Domaine non spécifié');
        
        const datasets = domaines.map((domaine, index) => {
            const colors = [
                'rgba(135, 206, 235, 0.8)',
                'rgba(176, 224, 230, 0.8)',
                'rgba(173, 216, 230, 0.8)',
                'rgba(135, 206, 250, 0.8)',
                'rgba(70, 130, 180, 0.8)'
            ];
            
            const dataPoints = regions.map(region => {
                const item = data.find(d => 
                    d && d.Domaine === domaine && d.Region === region
                );
                return item ? getSafeCount(item) : 0;
            });
            
            return {
                label: domaine,
                data: dataPoints,
                backgroundColor: colors[index % colors.length],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
                borderRadius: 5
            };
        });
        
        return {
            labels: regions,
            datasets: datasets
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#2c5282',
                    font: { size: 12 },
                    padding: 15,
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                color: '#2c5282',
                font: { size: 16, weight: 'bold' }
            }
        }
    };

    if (loading) {
        return (
            <div className="statistiques-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Connexion au serveur en cours</p>
                    <p className="loading-sub">Chargement des données de la base</p>
                </div>
            </div>
        );
    }

    return (
        <div className="statistiques-container">
            <div className="statistiques-header">
                <h1>Tableau de Bord Statistique</h1>
                
            </div>

            {error && (
                <div className="error-message">
                    <strong>⚠️ {error}</strong>
                    <p>Les données réelles ne sont pas disponibles. Vérifiez votre connexion au serveur.</p>
                    <div className="action-buttons">
                        <button onClick={fetchStats} className="retry-button">
                            🔄 Réessayer la connexion
                        </button>
                    </div>
                </div>
            )}

            {/* Résumé des données */}
            <div className="stats-summary-top">
                <div className="stat-card">
                    <div className="stat-icon total-icon">📋</div>
                    <h3>Total Enregistrements</h3>
                    <p className="stat-value">{totalRecords}</p>
                    <p className="stat-note">Tous</p>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon unique-icon">🏷️</div>
                    <h3>Titres Uniques</h3>
                    <p className="stat-value">{uniqueTitles}</p>
                    <p className="stat-note">Docteur, Professeur,<br /> Dr Specialiste</p>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon region-icon">🌍</div>
                    <h3>Régions Couvertes</h3>
                    <p className="stat-value">{totalRegions}</p>
                    <p className="stat-note">Tous</p>
                </div>
            </div>

            {/* Navigation par onglets */}
            <div className="tabs-navigation">
                <button
                    className={`tab-button ${activeTab === 'tab1' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tab1')}
                >
                    <span className="tab-icon">📊</span>
                    Titre × Domaine × Région
                </button>
                <button
                    className={`tab-button ${activeTab === 'tab2' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tab2')}
                >
                    <span className="tab-icon">📈</span>
                    Titre × Région
                </button>
                <button
                    className={`tab-button ${activeTab === 'tab3' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tab3')}
                >
                    <span className="tab-icon">🏢</span>
                    Domaine × Région
                </button>
            </div>

            {/* Contenu des onglets */}
            <div className="tab-content">
                {activeTab === 'tab1' && (
                    <div className="chart-card">
                        <h2>Statistiques par Titre, Domaine et Région</h2>
                        <div className="chart-container">
                            <Bar 
                                data={prepareChart1Data()} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Distribution par Titre, Domaine et Région'
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'tab2' && (
                    <div className="chart-card sky-gradient">
                        <h2 className="sky-blue-text">Statistiques par Titre et Région</h2>
                
                        <div className="chart-container">
                            <Line 
                                data={prepareChart2Data()} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Évolution par Titre et Région'
                                        }
                                    },
                                    scales: {
                                        x: {
                                            grid: { color: 'rgba(135, 206, 235, 0.1)' },
                                            ticks: { color: '#2c5282', maxRotation: 45 }
                                        },
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(135, 206, 235, 0.1)' },
                                            ticks: { color: '#2c5282', precision: 0 }
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'tab3' && (
                    <div className="chart-card">
                        <h2>Statistiques par Domaine et Région</h2>
                        <div className="chart-container">
                            <Bar 
                                data={prepareChart3Data()} 
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                            ...chartOptions.plugins.title,
                                            text: 'Répartition par Domaine et Région'
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Statistiques;