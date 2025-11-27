import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import Avatar from 'react-avatar';
import Modifier from "../Crud/Modifier";
import Ajouter from "../Crud/Ajouter";
import "../sections2Css/Profil.css";

const Profil = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [visibleAjouter, setVisibleAjouter] = useState(false);
  const [visibleModifier, setVisibleModifier] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [userData, setUserData] = useState({
    profileImage: "/default-avatar.png",
    username: "",
    email: "",
  });

  const [profildata, setProfilData] = useState({
    id: "",
    Nom: "",
    Prenom: "",
    Date: "",
    Lieu: "",
    genre: "",
    Adresse: "",
    NumOrdre: "",
    Contact: "",
    AutreContact: "",
    Titre: "",
    Domaine: "",
    Region: "",
  });

  const [hasProfile, setHasProfile] = useState(false);

  const displayValue = (value) => (value ? value : "—");

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/apropos2");
      return;
    }

    setLoadingProfile(true);
    try {
      console.log("🔄 Début du chargement du profil...");
      
      const res = await axios.post(
        "http://localhost:3002/Profil",
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("✅ DONNÉES BRUTES REÇUES DU BACKEND:", res.data);
      console.log("🔍 Structure des données:", Object.keys(res.data));
      console.log("🎯 ID profil reçu:", res.data.id);
      console.log("👤 Nom reçu:", res.data.Nom);

      // Mettre à jour les données utilisateur
      setUserData({
        profileImage: res.data.profileImage || "/default-avatar.png",
        username: res.data.username || "",
        email: res.data.email || "",
      });

      // CONDITION CRITIQUE - Vérifier si on a un ID de profil
      if (res.data.id) {
        console.log("🎯 PROFIL TROUVÉ - Mise à jour de l'interface");
        setHasProfile(true);
        setProfilData({
          id: res.data.id,
          Nom: res.data.Nom || "",
          Prenom: res.data.Prenom || "",
          Date: res.data.Date || "",
          Lieu: res.data.Lieu || "",
          genre: res.data.genre || "",
          Adresse: res.data.Adresse || "",
          NumOrdre: res.data.NumOrdre || "",
          Contact: res.data.Contact || "",
          AutreContact: res.data.AutreContact || "",
          Titre: res.data.Titre || "",
          Domaine: res.data.Domaine || "",
          Region: res.data.Region || "",
        });
      } else {
        console.log("❌ AUCUN PROFIL - Affichage du message vide");
        setHasProfile(false);
        setProfilData({
          id: "",
          Nom: "",
          Prenom: "",
          Date: "",
          Lieu: "",
          genre: "",
          Adresse: "",
          NumOrdre: "",
          Contact: "",
          AutreContact: "",
          Titre: "",
          Domaine: "",
          Region: "",
        });
      }

      if (res.data.profileImage) {
        setPreview(res.data.profileImage);
      }

    } catch (err) {
      console.error("❌ ERREUR COMPLÈTE:", err);
      console.error("📨 Réponse d'erreur:", err.response?.data);
      console.error("🔧 Message d'erreur:", err.message);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setHasProfile(false);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  // Recharger après modification/ajout
  useEffect(() => {
    if (!visibleAjouter && !visibleModifier) {
      fetchProfile();
    }
  }, [visibleAjouter, visibleModifier]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/apropos");
  };

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
      alert("Image mise à jour !");
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModifier = () => {
    if (!profildata.id) {
      alert("Aucun profil trouvé à modifier. Veuillez d'abord créer un profil.");
      return;
    }
    setVisibleModifier(true);
  };

  const handleOpenAjouter = () => {
    if (hasProfile) {
      alert("Vous avez déjà un profil. Utilisez 'Mettre à jour' pour le modifier.");
      return;
    }
    setVisibleAjouter(true);
  };

  if (loadingProfile) {
    return (
      <div className="profil-section">
        <div className="profil-container">
          <div className="loading-spinner">
            <p>Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-section">
      <div className="profil-container">
        <h1>Mon Profil</h1>

        {/* SECTION DEBUG - À GARDER TEMPORAIREMENT */}
        <div className="debug-section">
          <h4>🔍 Informations de Debug</h4>
          <div className="debug-grid">
            <div className="debug-item">
              <strong>Profil trouvé:</strong> {hasProfile ? "OUI ✅" : "NON ❌"}
            </div>
            <div className="debug-item">
              <strong>ID Profil:</strong> {profildata.id || "Aucun"}
            </div>
            <div className="debug-item">
              <strong>Nom:</strong> {profildata.Nom || "Aucun"}
            </div>
            <div className="debug-item">
              <strong>Données complètes:</strong> 
              <pre>{JSON.stringify(profildata, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* IMAGE DE PROFIL */}
        <div className="profile-image-section">
          <div className="image-container" onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
            <Avatar
              src={userData.profileImage}
              name={userData.username || `${profildata.Prenom} ${profildata.Nom}` || "Utilisateur"}
              size="150"
              round={true}
              className="profile-image"
            />
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={onFileChange} 
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <p style={{ marginTop: "10px", color: "#666" }}>Cliquez sur l'avatar pour changer la photo</p>
        </div>

        {/* INFOS UTILISATEUR */}
        <div className="user-info-section">
          <h3>Informations personnelles</h3>
          <p><strong>Pseudonyme :</strong> {displayValue(userData.username)}</p>
          <p><strong>Email :</strong> {displayValue(userData.email)}</p>
        </div>

        {/* PROFIL DENTISTE */}
        <div className="profil-dentiste-section">
          <div className="section-header">
            <h3>Profil professionnel</h3>
            {!hasProfile && (
              <div className="alert alert-info">
                <p>Vous n'avez pas encore de profil professionnel. Cliquez sur "Ajouter infos" pour créer votre profil.</p>
              </div>
            )}
          </div>
          
          {hasProfile ? (
            <div className="info-grid">
              <div className="info-item">
                <strong>Nom :</strong> {displayValue(profildata.Nom)}
              </div>
              <div className="info-item">
                <strong>Prénom :</strong> {displayValue(profildata.Prenom)}
              </div>
              <div className="info-item">
                <strong>Date de naissance :</strong> {displayValue(profildata.Date)}
              </div>
              <div className="info-item">
                <strong>Lieu de naissance :</strong> {displayValue(profildata.Lieu)}
              </div>
              <div className="info-item">
                <strong>Genre :</strong> {displayValue(profildata.genre)}
              </div>
              <div className="info-item">
                <strong>Adresse :</strong> {displayValue(profildata.Adresse)}
              </div>
              <div className="info-item">
                <strong>Contact :</strong> {displayValue(profildata.Contact)}
              </div>
              <div className="info-item">
                <strong>Autre contact :</strong> {displayValue(profildata.AutreContact)}
              </div>
              <div className="info-item">
                <strong>Numéro d'ordre :</strong> {displayValue(profildata.NumOrdre)}
              </div>
              <div className="info-item">
                <strong>Titre :</strong> {displayValue(profildata.Titre)}
              </div>
              <div className="info-item">
                <strong>Domaine :</strong> {displayValue(profildata.Domaine)}
              </div>
              <div className="info-item">
                <strong>Région :</strong> {displayValue(profildata.Region)}
              </div>
            </div>
          ) : (
            <div className="no-profile">
              <p>Aucune information professionnelle disponible.</p>
            </div>
          )}
        </div>

        {/* BOUTONS */}
        <div className="button-actions">
          <button
            type="button"
            onClick={handleOpenModifier}
            disabled={!hasProfile}
            className={`btn-update ${!hasProfile ? 'btn-disabled' : ''}`}
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={handleOpenAjouter}
            disabled={hasProfile}
            className={`btn-add ${hasProfile ? 'btn-disabled' : ''}`}
          >
            {hasProfile ? "Profil déjà créé" : "Ajouter infos"}
          </button>
        </div>
      </div>

      {/* DIALOG AJOUT */}
      <Dialog 
        header="Créer votre profil professionnel"
        visible={visibleAjouter} 
        onHide={() => setVisibleAjouter(false)} 
        style={{ width: "70vw" }}
        className="custom-dialog"
      >
        <Ajouter onClose={() => setVisibleAjouter(false)} />
      </Dialog>

      {/* DIALOG MODIFICATION */}
      <Dialog 
        header="Modifier votre profil professionnel"
        visible={visibleModifier} 
        onHide={() => setVisibleModifier(false)} 
        style={{ width: "70vw" }}
        className="custom-dialog"
      >
        <Modifier 
          onClose={() => setVisibleModifier(false)}
          profilId={profildata.id}
          currentData={profildata}
        />
      </Dialog>

      {/* DIALOG IMAGE */}
      <Dialog
        header="Aperçu de l'image"
        visible={imageDialog}
        onHide={() => setImageDialog(false)}
        style={{ width: "60vw" }}
        className="custom-dialog"
      >
        <div style={{ textAlign: "center" }}>
          {preview && (
            <>
              <h4>Nouvelle image de profil</h4>
              <Avatar
                src={preview}
                name={userData.username || `${profildata.Prenom} ${profildata.Nom}` || "Utilisateur"}
                size="200"
                round={true}
                style={{
                  margin: "20px auto",
                  display: "block"
                }}
              />
              <p>Cette image remplacera votre photo de profil actuelle</p>
            </>
          )}
          <div className="dialog-actions">
            <button
              onClick={() => setImageDialog(false)}
              className="btn-cancel"
            >
              Annuler
            </button>
            <button
              onClick={saveCroppedImage}
              disabled={loading}
              className="btn-confirm"
            >
              {loading ? "Enregistrement..." : "Confirmer l'image"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Profil;