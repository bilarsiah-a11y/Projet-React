import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import AvatarEditor from "react-avatar-editor";
import "../AdminCss/AdminProfil.css";

const AdminProfil = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [userData, setUserData] = useState({
    profileImage: "/default-avatar.png",
    username: "Solo",
    email: "solofo@gmail.com",
  });

  const [formData, setFormData] = useState({
    username: "Solo",
    email: "solofo@gmail.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const displayValue = (value) => (value ? value : "—");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/apropos2");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3002/AdminProfil",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData({
        profileImage: res.data.profileImage || "/default-avatar.png",
        username: res.data.username || "Solo",
        email: res.data.email || "solofo@gmail.com",
      });

      setFormData({
        username: res.data.username || "Solo",
        email: res.data.email || "solofo@gmail.com",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      if (res.data.profileImage) setPreview(res.data.profileImage);
    } catch (err) {
      console.error("Erreur chargement profil:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/apropos2");
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setImageEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const saveEditedImage = async () => {
    if (!editorRef.current || !selectedFile) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("profileImage", blob, selectedFile.name);

        const res = await axios.post(
          "http://localhost:3002/upload-profile-image",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserData(prev => ({ ...prev, profileImage: res.data.profileImage }));
        setImageEditorOpen(false);
        setSelectedFile(null);
        setScale(1);
        setRotation(0);
        
        alert("Image de profil mise à jour avec succès !");
        setLoading(false);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'upload de l'image");
      setLoading(false);
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
      
      setUserData(prev => ({
        ...prev,
        username: formData.username,
        email: formData.email
      }));

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setEditing(false);

    } catch (error) {
      console.error("Erreur mise à jour:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de la mise à jour";
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profil-container">
      <div className="single-profile-card">
        {/* HEADER - Version simple */}
        <div className="card-header-simple">
          <h1 className="card-title-simple">Mon Profil Administrateur</h1>
          <p className="card-subtitle-simple">Gérez vos informations personnelles et votre sécurité</p>
        </div>

        {/* MAIN CONTENT */}
        <div className="card-content-unified">
          {/* LEFT SECTION - PROFILE INFO */}
          <div className="profile-info-side-unified">
            {/* AVATAR */}
            <div className="avatar-section-unified">
              <div className="avatar-wrapper" onClick={handleAvatarClick}>
                <Avatar
                  src={userData.profileImage}
                  name={userData.username || "Admin"}
                  size="120"
                  round={true}
                  className="profile-avatar-main"
                />
                <div className="avatar-edit-hint">
                  <i className="pi pi-camera"></i>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={onFileChange} 
                ref={fileInputRef}
                style={{ display: "none" }}
              />
      
              
            </div>

            {/* EDIT BUTTON RAPPROCHÉ */}
            <div className="edit-button-container" style={{ marginTop: '1rem' }}>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="edit-toggle-btn"
                >
                  <i className="pi pi-user-edit"></i>
                  Modifier le profil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                    setSuccess("");
                    fetchProfile();
                  }}
                  className="cancel-toggle-btn"
                >
                  <i className="pi pi-times"></i>
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SECTION - CONTENT */}
          <div className="content-side-unified">
            {editing ? (
              <div className="edit-mode-content">
                {success && (
                  <div className="success-notice">
                    <i className="pi pi-check-circle"></i>
                    {success}
                  </div>
                )}

                {errors.submit && (
                  <div className="error-notice">
                    <i className="pi pi-exclamation-triangle"></i>
                    {errors.submit}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="edit-profile-form">
                  <div className="form-block">
                    <h3 className="block-title">
                      <i className="pi pi-user"></i>
                      Informations Personnelles
                    </h3>
                    
                    <div className="input-field">
                      <label htmlFor="username">Nom d'utilisateur *</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? "input-error" : ""}
                        placeholder="Entrez votre nom d'utilisateur"
                      />
                      {errors.username && <span className="field-error-msg">{errors.username}</span>}
                    </div>

                    <div className="input-field">
                      <label htmlFor="email">Adresse Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "input-error" : ""}
                        placeholder="Entrez votre adresse email"
                      />
                      {errors.email && <span className="field-error-msg">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-block">
                    <h3 className="block-title">
                      <i className="pi pi-lock"></i>
                      Sécurité du Compte
                    </h3>
                    <p className="block-description">
                      Laissez ces champs vides si vous ne souhaitez pas changer le mot de passe
                    </p>

                    <div className="input-field">
                      <label htmlFor="currentPassword">Ancien Mot de Passe</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={errors.currentPassword ? "input-error" : ""}
                        placeholder="Entrez votre mot de passe actuel"
                      />
                      {errors.currentPassword && <span className="field-error-msg">{errors.currentPassword}</span>}
                    </div>

                    <div className="input-field">
                      <label htmlFor="newPassword">Nouveau Mot de Passe</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={errors.newPassword ? "input-error" : ""}
                        placeholder="Entrez le nouveau mot de passe"
                      />
                      {errors.newPassword && <span className="field-error-msg">{errors.newPassword}</span>}
                    </div>

                    <div className="input-field">
                      <label htmlFor="confirmPassword">Confirmer le Nouveau Mot de Passe</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? "input-error" : ""}
                        placeholder="Confirmez le nouveau mot de passe"
                      />
                      {errors.confirmPassword && <span className="field-error-msg">{errors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="form-actions-block">
                    <button 
                      type="submit" 
                      className="submit-save-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="pi pi-spinner pi-spin"></i>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <i className="pi pi-save"></i>
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="view-mode-content">
                {/* ACCOUNT DETAILS - Version simple */}
                <div className="account-details-simple">
                  <h3 className="details-title">
                    <i className="pi pi-info-circle"></i>
                    Détails du Compte
                  </h3>
                  
                  <div className="details-list">
                    <div className="detail-row">
                      <label className="detail-label">Nom d'utilisateur</label>
                      <p className="detail-value">{displayValue(userData.username)}</p>
                    </div>
                    
                    <div className="detail-row">
                      <label className="detail-label">Email</label>
                      <p className="detail-value">{displayValue(userData.email)}</p>
                    </div>
                    
                    <div className="detail-row">
                      <label className="detail-label">Rôle</label>
                      <p className="detail-value role-display">Administrateur</p>
                    </div>
                    
                    <div className="detail-row">
                      <label className="detail-label">Statut</label>
                      <p className="detail-value status-display">Actif</p>
                    </div>
                    
                    <div className="detail-row">
                      <label className="detail-label">Date de création</label>
                      <p className="detail-value">15 Janvier 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE EDITOR MODAL */}
      {imageEditorOpen && (
        <div className="image-editor-modal-overlay">
          <div className="image-editor-container">
            <div className="editor-modal-header">
              <h3>
                <i className="pi pi-image"></i>
                Éditeur de photo de profil
              </h3>
              <button 
                className="close-modal-btn"
                onClick={() => setImageEditorOpen(false)}
                disabled={loading}
              >
                <i className="pi pi-times"></i>
              </button>
            </div>
            
            <div className="editor-modal-body">
              {preview && (
                <div className="avatar-editor-wrapper">
                  <AvatarEditor
                    ref={editorRef}
                    image={preview}
                    width={220}
                    height={220}
                    border={25}
                    borderRadius={110}
                    color={[255, 255, 255, 0.6]}
                    scale={scale}
                    rotate={rotation}
                    className="avatar-editor-component"
                  />
                </div>
              )}
              
              {/* Controls avec flèches pour ajustement fin */}
              <div className="editor-controls-panel">
                <div className="control-group-vertical">
                  <label className="control-label">
                    <i className="pi pi-search-plus"></i>
                    Zoom
                  </label>
                  <div className="control-with-arrows">
                    <button 
                      className="control-arrow-btn"
                      onClick={() => setScale(Math.max(1, scale - 0.1))}
                      disabled={scale <= 1}
                    >
                      <i className="pi pi-arrow-down"></i>
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="control-range"
                    />
                    <button 
                      className="control-arrow-btn"
                      onClick={() => setScale(Math.min(3, scale + 0.1))}
                      disabled={scale >= 3}
                    >
                      <i className="pi pi-arrow-up"></i>
                    </button>
                  </div>
                  <div className="control-value-display">
                    <span className="value-label">Valeur:</span>
                    <span className="value-number">{scale.toFixed(1)}x</span>
                  </div>
                </div>
                
                <div className="control-group-vertical">
                  <label className="control-label">
                    <i className="pi pi-sync"></i>
                    Rotation
                  </label>
                  <div className="control-with-arrows">
                    <button 
                      className="control-arrow-btn"
                      onClick={() => setRotation((rotation - 15 + 360) % 360)}
                    >
                      <i className="pi pi-arrow-left"></i>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="control-range"
                    />
                    <button 
                      className="control-arrow-btn"
                      onClick={() => setRotation((rotation + 15) % 360)}
                    >
                      <i className="pi pi-arrow-right"></i>
                    </button>
                  </div>
                  <div className="control-value-display">
                    <span className="value-label">Valeur:</span>
                    <span className="value-number">{rotation}°</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="editor-modal-actions">
              <button
                className="cancel-editor-btn"
                onClick={() => setImageEditorOpen(false)}
                disabled={loading}
              >
                <i className="pi pi-times"></i>
                Annuler
              </button>
              <button
                className="apply-editor-btn"
                onClick={saveEditedImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="pi pi-spinner pi-spin"></i>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="pi pi-check"></i>
                    Appliquer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfil;