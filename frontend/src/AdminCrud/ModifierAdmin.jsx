import React, { useState, useEffect } from "react";
import axios from "axios";
import "../AdminCrud/ModifierAdmin.css";

const ModifierAdmin = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Charger les données actuelles
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3002/AdminProfil",
        {},
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      const userData = response.data;
      setFormData(prev => ({
        ...prev,
        username: userData.username || "",
        email: userData.email || ""
      }));
    } catch (error) {
      console.error("Erreur chargement:", error);
      setErrors({ submit: "Erreur lors du chargement des données" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "L'ancien mot de passe est requis";
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Le mot de passe doit contenir au moins 6 caractères";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      console.log("Envoi des données:", updateData);

      const response = await axios.put(
        "http://localhost:3002/admin/update-profile",
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      setSuccess("Profil mis à jour avec succès !");
      
      // Réinitialiser les mots de passe
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Erreur mise à jour:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de la mise à jour";
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modifier-admin-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Modifier le Profil Administrateur</h2>
          <p>Mettez à jour vos informations personnelles</p>
        </div>

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modifier-form">
          <div className="form-section">
            <h3>Informations Personnelles</h3>
            
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "error" : ""}
                placeholder="Entrez votre nom d'utilisateur"
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Entrez votre adresse email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Changer le Mot de Passe</h3>
            <p className="section-description">
              Laissez ces champs vides si vous ne souhaitez pas changer le mot de passe
            </p>

            <div className="form-group">
              <label htmlFor="currentPassword">Ancien Mot de Passe</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={errors.currentPassword ? "error" : ""}
                placeholder="Entrez votre mot de passe actuel"
              />
              {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nouveau Mot de Passe</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "error" : ""}
                placeholder="Entrez le nouveau mot de passe"
              />
              {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le Nouveau Mot de Passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                placeholder="Confirmez le nouveau mot de passe"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="button-container">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierAdmin;