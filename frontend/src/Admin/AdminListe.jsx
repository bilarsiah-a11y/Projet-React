import React, { useState, useEffect } from "react";
import Axios from "axios";
import "../AdminCss/AdminListe.css";

const regionsList = [
  "Alaotra Mangoro",
  "Antsinanana",
  "Anosy",
  "Analanjirofo",
  "Atsimo Andrefana",
  "Amoron'i Mania",
  "Atsimo Atsinanana",
  "Analamanga",
  "Androy",
  "Boeny",
  "Betsiboka",
  "Bongolava",
  "Betsimisaraka",
  "Diana",
  "Haute Matsiatra",
  "Itasy",
  "Ihorombe",
  "Melaky",
  "Menabe",
  "Sofia",
  "Vakinankaratra",
  "Vatovavy Fitovinany"
];

// Composant pour les alertes stylisées
const StyledAlert = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const alertStyles = {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 20px",
    borderRadius: "10px",
    color: "white",
    fontWeight: "500",
    zIndex: 1000,
    minWidth: "300px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    animation: "slideIn 0.3s ease-out",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)"
  };

  const typeStyles = {
    success: {
      background: "linear-gradient(135deg, rgba(135, 206, 235, 0.95), rgba(70, 130, 180, 0.95))",
      borderLeft: "5px solid #2E8BC0"
    },
    error: {
      background: "linear-gradient(135deg, rgba(255, 107, 107, 0.95), rgba(238, 90, 82, 0.95))",
      borderLeft: "5px solid #D32F2F"
    },
    info: {
      background: "linear-gradient(135deg, rgba(135, 206, 235, 0.95), rgba(93, 138, 168, 0.95))",
      borderLeft: "5px solid #1976D2"
    }
  };

  return (
    <div style={{ ...alertStyles, ...typeStyles[type] }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {type === "success" && <span style={{ fontSize: "20px" }}>✓</span>}
        {type === "error" && <span style={{ fontSize: "20px" }}>✗</span>}
        {type === "info" && <span style={{ fontSize: "20px" }}>ℹ</span>}
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "white",
          fontSize: "20px",
          cursor: "pointer",
          marginLeft: "10px",
          fontWeight: "bold",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s"
        }}
        onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
        onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
      >
        ×
      </button>
    </div>
  );
};

// Composant pour les confirmations stylisées
const StyledConfirm = ({ message, onConfirm, onCancel }) => {
  const modalStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
    backdropFilter: "blur(3px)"
  };

  const contentStyles = {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
    maxWidth: "450px",
    width: "90%",
    textAlign: "center",
    border: "1px solid #E3F2FD"
  };

  const buttonContainerStyles = {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginTop: "25px"
  };

  const buttonStyles = {
    padding: "12px 25px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    minWidth: "120px",
    fontSize: "14px",
    letterSpacing: "0.5px"
  };

  return (
    <div style={modalStyles}>
      <div style={contentStyles}>
        <div style={{
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #FF6B6B, #EE5A52)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          color: "white",
          fontSize: "28px"
        }}>
          ⚠
        </div>
        <h3 style={{ 
          margin: "0 0 15px 0", 
          color: "#2C3E50",
          fontSize: "22px"
        }}>
          Confirmation requise
        </h3>
        <p style={{ 
          color: "#5D6D7E", 
          lineHeight: "1.6",
          fontSize: "15px",
          marginBottom: "5px"
        }}>
          {message}
        </p>
        <p style={{
          color: "#E74C3C",
          fontSize: "13px",
          fontWeight: "500",
          marginTop: "0"
        }}>
          Cette action est irréversible !
        </p>
        <div style={buttonContainerStyles}>
          <button
            onClick={onCancel}
            style={{
              ...buttonStyles,
              background: "linear-gradient(135deg, #E0E0E0, #BDBDBD)",
              color: "#2C3E50"
            }}
            onMouseOver={(e) => e.target.style.background = "linear-gradient(135deg, #D6D6D6, #B0B0B0)"}
            onMouseOut={(e) => e.target.style.background = "linear-gradient(135deg, #E0E0E0, #BDBDBD)"}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...buttonStyles,
              background: "linear-gradient(135deg, #FF6B6B, #EE5A52)",
              color: "white",
              boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)"
            }}
            onMouseOver={(e) => e.target.style.background = "linear-gradient(135deg, #FF5252, #D32F2F)"}
            onMouseOut={(e) => e.target.style.background = "linear-gradient(135deg, #FF6B6B, #EE5A52)"}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminListe = () => {
  const [region, setRegion] = useState("Analamanga");
  const [dentistes, setDentistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDentistes();
  }, [region, refreshTrigger]);

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
  };

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setConfirm({
        message,
        onConfirm: () => {
          setConfirm(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirm(null);
          resolve(false);
        }
      });
    });
  };

  const fetchDentistes = async () => {
    setLoading(true);
    try {
      const res = await Axios.get(`http://localhost:3002/AdminListe?region=${region}`);
      const dentistesAvecIds = res.data.map(dentiste => {
        if (!dentiste.profilId) {
          console.error("Dentiste sans profilId !", dentiste);
        }
        return {
          ...dentiste,
          id: dentiste.profilId,
          users_id: dentiste.userId || null
        };
      });
      setDentistes(dentistesAvecIds);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setDentistes([]);
      showAlert("Erreur lors du chargement des dentistes", "error");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "/default-avatar.png";
    if (img.startsWith("http")) return img;
    return `http://localhost:3002/uploads/${img}`;
  };

  const handleDelete = async (profilId, userId, nomComplet) => {
    if (!profilId) {
      showAlert("Impossible de supprimer : ID du profil manquant", "error");
      return;
    }

    const confirmed = await showConfirm(
      `Voulez-vous vraiment supprimer définitivement le dentiste :\n"${nomComplet}" ?`
    );

    if (!confirmed) return;

    setDeletingId(profilId);

    try {
      const response = await Axios.delete(
        `http://localhost:3002/admin/delete/${profilId}/${userId || 'null'}`
      );

      if (response.status === 200) {
        showAlert(`Dentiste "${nomComplet}" supprimé avec succès !`, "success");
        setDentistes(prev => prev.filter(d => d.id !== profilId));
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Échec de la suppression";
      showAlert("Erreur : " + msg, "error");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    showAlert("Liste des dentistes actualisée", "info");
  };

  return (
    <div className="admin-dentistes-container">
      {/* Alertes stylisées */}
      {alert && (
        <StyledAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Confirmation stylisée */}
      {confirm && (
        <StyledConfirm
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}

        <div className="content">
          <h1>Gestion des dentistes</h1>
        </div>
      

      <div className="admin-controls">
        <div className="controls-left">
          <div className="filter-section">
            <label htmlFor="region-select">
              <i className="filter-icon">📍</i>
              Sélectionnez une région :
            </label>
            <div className="select-wrapper">
              <select 
                id="region-select"
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
              >
                {regionsList.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
          
          <div className="region-indicator">
            <span className="region-label">Région active :</span>
            <span className="region-value">{region}</span>
          </div>
        </div>

        <div className="controls-right">
      
          
          <div className="stats">
            <div className="stats-content">
              <span className="stats-label">Total dentistes</span>
              <span className="stats-value">{dentistes.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dentistes-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des dentistes de la région <strong>{region}</strong>...</p>
            <p className="loading-sub">Veuillez patienter</p>
          </div>
        ) : dentistes.length === 0 ? (
          <div className="no-result">
            <div className="no-result-icon">🦷</div>
            <h3>Aucun dentiste trouvé</h3>
            <p>La région <strong>{region}</strong> ne contient aucun dentiste pour le moment.</p>
            <p className="hint">Essayez une autre région ou revenez plus tard</p>
          </div>
        ) : (
          <table className="dentistes-table">
            <thead>
              <tr>
                <th className="photo-header">Photo</th>
                <th>Dentiste</th>
                <th>Contact</th>
                <th>N° Ordre</th>
                <th className="action-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {dentistes.map((dentiste) => {
                const nomComplet = `${dentiste.Titre || "Dr"} ${dentiste.Prenom} ${dentiste.Nom}`.trim();
                const domain = dentiste.Domaine || "Généraliste";
                
                return (
                  <tr key={dentiste.id} className="dentiste-row">
                    <td>
                      <div className="photo-container">
                        <img
                          src={getImageUrl(dentiste.profileImage)}
                          alt={`Profil de ${nomComplet}`}
                          className="admin-photo"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                            e.target.onerror = null;
                          }}
                        />
                
                      </div>
                    </td>
                    <td>
                      <div className="dentiste-info">
                        <strong className="dentiste-name">{nomComplet}</strong>
                        <div className="dentiste-details">
                          {dentiste.NumOrdre}
                          <span className="domaine-badge">{domain}</span>
                          <span className="dentiste-address">
                            <i className="address-icon">📍</i>
                            {dentiste.Adresse || "Adresse non renseignée"}
                          </span>
                          {dentiste.Lieu && (
                            <span className="dentiste-lieu">
                              <i className="lieu-icon">🏢</i>
                              {dentiste.Lieu}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-main">
                          <i className="phone-icon">📱</i>
                          <span className="contact-number">{dentiste.Contact || "Non renseigné"}</span>
                        </div>
                        {dentiste.AutreContact && (
                          <div className="contact-secondary">
                            <i className="phone-icon">📞</i>
                            <span>{dentiste.AutreContact}</span>
                          </div>
                        )}
                        {dentiste.Email && (
                          <div className="contact-email">
                            <i className="email-icon">✉</i>
                            <span>{dentiste.Email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="num-ordre-container">
                        <span className="num-ordre">
                          {dentiste.NumOrdre || "—"}
                        </span>
                        {dentiste.NumOrdre && (
                          <span className="ordre-badge">Validé</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(dentiste.id, dentiste.users_id, nomComplet)}
                          disabled={deletingId === dentiste.id}
                        >
                          {deletingId === dentiste.id ? (
                            <>
                              <span className="deleting-spinner"></span>
                              Suppression...
                            </>
                          ) : (
                            <>
                              <i className="delete-icon">🗑</i>
                              Supprimer
                            </>
                          )}
                        </button>
                
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminListe;