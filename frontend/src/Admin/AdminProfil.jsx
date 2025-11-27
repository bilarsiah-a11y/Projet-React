import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import Avatar from "react-avatar";
import ModifierAdmin from "../AdminCrud/ModifierAdmin";
import "../AdminCss/AdminProfil.css";

const AdminProfil = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageDialog, setImageDialog] = useState(false);
  const [visibleModifier, setVisibleModifier] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userData, setUserData] = useState({
    profileImage: "/default-avatar.png",
    username: "",
    email: "",
    password: "",
  });

  const displayValue = (value) => (value ? value : "—");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/apropos2");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3002/AdminProfil",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Données reçues du backend:", res.data);

        setUserData({
          profileImage: res.data.profileImage || "/default-avatar.png",
          username: res.data.username || "",
          email: res.data.email || "",
          password: res.data.password || "",
        });

        if (res.data.profileImage) setPreview(res.data.profileImage);
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        console.error("Détails de l'erreur:", err.response?.data);
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setImageDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const saveCroppedImage = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const res = await axios.post(
        "http://localhost:3002/upload-profile-image",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData((prev) => ({ ...prev, profileImage: res.data.profileImage }));
      setImageDialog(false);
      setSelectedFile(null);
      
      // Notification stylée
      alert("Image de profil mise à jour avec succès !");
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    if (newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        "http://localhost:3002/update-password",
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        alert("Mot de passe mis à jour avec succès !");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Erreur mise à jour mot de passe:", err);
      alert("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const maskPassword = (password) => {
    return "•".repeat(password.length > 0 ? 12 : 0);
  };

  return (
    <div className="profil-section">
      <div className="profil-container">
        {/* HEADER */}
        <div className="profile-header">
          <h1>Mon Profil Administrateur</h1>
          <p>Gérez vos informations personnelles et votre sécurité</p>
        </div>

        <div className="profile-content">
          {/* COLONNE GAUCHE - PHOTO ET INFORMATIONS */}
          <div className="left-column">
            {/* CARD PHOTO DE PROFIL */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Photo de Profil</h3>
              </div>
              <div className="card-body">
                <div className="profile-image-section">
                  <div className="image-container" onClick={handleAvatarClick}>
                    <Avatar
                      src={userData.profileImage}
                      name={userData.username || "Admin"}
                      size="150"
                      round={true}
                      className="profile-image"
                    />
                    <div className="image-overlay">
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
                  <p className="image-help-text">
                    Cliquez sur l'avatar pour changer la photo
                  </p>
                </div>
              </div>
            </div>

            {/* CARD INFORMATIONS PERSONNELLES */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Informations Personnelles</h3>
              </div>
              <div className="card-body">
                <div className="info-item">
                  <label>Nom d'utilisateur</label>
                  <div className="info-value">{displayValue(userData.username)}</div>
                </div>
                <div className="info-item">
                  <label>Adresse Email</label>
                  <div className="info-value">{displayValue(userData.email)}</div>
                </div>
                <div className="info-item">
                  <label>Rôle</label>
                  <div className="info-value role-badge">Administrateur</div>
                </div>
              </div>
            </div>
          </div>

        
          <div className="right-column">

    
            {/* CARD ACTIONS */}
            <div className="profile-card actions-card">
              <div className="card-header">
                <h3>Actions</h3>
              </div>
              <div className="card-body">
                <button
                  type="button"
                  onClick={() => setVisibleModifier(true)}
                  className="action-btn primary"
                >
                  <i className="pi pi-user-edit"></i>
                  Modifier le profil
                </button>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOG MODIFICATION */}
      <Dialog 
        visible={visibleModifier} 
        onHide={() => setVisibleModifier(false)} 
        style={{ width: "90vw", maxWidth: "600px" }}
        header={null}
        closable={false}
        className="modifier-dialog"
      >
        <ModifierAdmin onClose={() => setVisibleModifier(false)} />
      </Dialog>

      {/* DIALOG IMAGE */}
      <Dialog
        header={null}
        visible={imageDialog}
        onHide={() => setImageDialog(false)}
        style={{ width: "500px" }}
      >
        <div className="image-preview-dialog">
          {preview && (
            <>
              <div className="preview-image-container">
                <Avatar
                  src={preview}
                  name={userData.username || "Admin"}
                  size="200"
                  round={true}
                />
              </div>
              <p className="preview-text">
                Cette image remplacera votre photo de profil actuelle
              </p>
            </>
          )}
          <div className="dialog-actions">
            <button
              onClick={() => setImageDialog(false)}
              className="cancel-btn"
            >
              Annuler
            </button>
            <button
              onClick={saveCroppedImage}
              disabled={loading}
              className="confirm-btn"
            >
              {loading ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  Enregistrement
                </>
              ) : (
                "Confirmer l'image"
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminProfil;