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
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    zIndex: 1000,
    minWidth: "300px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    animation: "slideIn 0.3s ease-out"
  };

  const typeStyles = {
    success: {
      background: "linear-gradient(135deg, #87CEEB, #4682B4)",
      borderLeft: "4px solid #368BC9"
    },
    error: {
      background: "linear-gradient(135deg, #FF6B6B, #EE5A52)",
      borderLeft: "4px solid #DC3545"
    },
    info: {
      background: "linear-gradient(135deg, #87CEEB, #5D8AA8)",
      borderLeft: "4px solid #4A90E2"
    }
  };

  return (
    <div style={{ ...alertStyles, ...typeStyles[type] }}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
          marginLeft: "10px",
          fontWeight: "bold"
        }}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001
  };

  const contentStyles = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center"
  };

  const buttonContainerStyles = {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "20px"
  };

  const buttonStyles = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease"
  };

  return (
    <div style={modalStyles}>
      <div style={contentStyles}>
        <h3 style={{ margin: "0 0 15px 0", color: "#2C3E50" }}>Confirmation</h3>
        <p style={{ color: "#5D6D7E", lineHeight: "1.5" }}>{message}</p>
        <div style={buttonContainerStyles}>
          <button
            onClick={onCancel}
            style={{
              ...buttonStyles,
              background: "#E74C3C",
              color: "white"
            }}
            onMouseOver={(e) => e.target.style.background = "#C0392B"}
            onMouseOut={(e) => e.target.style.background = "#E74C3C"}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...buttonStyles,
              background: "linear-gradient(135deg, #87CEEB, #4682B4)",
              color: "white"
            }}
            onMouseOver={(e) => e.target.style.background = "#368BC9"}
            onMouseOut={(e) => e.target.style.background = "linear-gradient(135deg, #87CEEB, #4682B4)"}
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

  useEffect(() => {
    fetchDentistes();
  }, [region]);

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
      `Vous voullez supprimer définitivement ${nomComplet} ?\n\nCette action est irréversible !`
    );

    if (!confirmed) return;

    setDeletingId(profilId);

    try {
      const response = await Axios.delete(
        `http://localhost:3002/admin/delete/${profilId}/${userId || 'null'}`
      );

      if (response.status === 200) {
        showAlert(`${nomComplet} supprimé avec succès !`, "success");
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

      <div className="admin-header">
        <h1>GESTION DES DENTISTES</h1>
        <p>SourireGuide - Administration 2025</p>
      </div>

      <div className="admin-controls">
        <div className="filter-section">
          <label>Région :</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regionsList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="stats">
          <strong>{dentistes.length}</strong> dentiste(s)
        </div>
      </div>

      <div className="dentistes-table-container">
        {loading ? (
          <p>Chargement en cours...</p>
        ) : dentistes.length === 0 ? (
          <p>Aucun dentiste trouvé dans cette région.</p>
        ) : (
          <table className="dentistes-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Dentiste</th>
                <th>Contact</th>
                <th>N° Ordre</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dentistes.map((dentiste) => {
                const nomComplet = `${dentiste.Titre || "Dr"} ${dentiste.Prenom} ${dentiste.Nom}`.trim();

                return (
                  <tr key={dentiste.id}>
                    <td>
                      <img
                        src={getImageUrl(dentiste.profileImage)}
                        alt="profil"
                        className="admin-photo"
                        onError={(e) => e.target.src = "/default-avatar.png"}
                      />
                    </td>
                    <td>
                      <strong>{nomComplet}</strong><br />
                      <small>{dentiste.Adresse} • {dentiste.Domaine || "Généraliste"}</small>
                      {dentiste.Lieu && <div> {dentiste.Lieu}</div>}
                    </td>
                    <td>
                      {dentiste.Contact}<br />
                      {dentiste.AutreContact && <small>{dentiste.AutreContact}</small>}
                    </td>
                    <td>{dentiste.NumOrdre || "—"}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(dentiste.id, dentiste.users_id, nomComplet)}
                        disabled={deletingId === dentiste.id}
                      >
                        {deletingId === dentiste.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Ajoutez cette CSS dans votre AdminListe.css */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminListe;