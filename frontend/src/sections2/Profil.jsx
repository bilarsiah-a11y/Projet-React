// Profil.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import Avatar from 'react-avatar';
import Modifier from "../Crud/Modifier";
import Ajouter from "../Crud/Ajouter";
import AfficherProfil from "../Crud/AfficherProfil"; 
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

  // FONCTION ÉPURÉE POUR CHARGER LE PROFIL
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/apropos2");
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await axios.post(
        "http://localhost:3002/Users",
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("✅ Profil chargé:", res.data.hasProfil ? "OUI" : "NON");

      const hasValidProfile = res.data && res.data.hasProfil && res.data.Nom;

      if (hasValidProfile) {
        setHasProfile(true);
        setProfilData({
          id: res.data.id,
          Nom: res.data.Nom,
          Prenom: res.data.Prenom,
          Date: res.data.Date,
          Lieu: res.data.Lieu,
          genre: res.data.genre,
          Adresse: res.data.Adresse,
          NumOrdre: res.data.NumOrdre,
          Contact: res.data.Contact,
          AutreContact: res.data.AutreContact,
          Titre: res.data.Titre,
          Domaine: res.data.Domaine,
          Region: res.data.Region,
        });
      } else {
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

      setUserData({
        profileImage: res.data.profileImage || "/default-avatar.png",
        username: res.data.username || "",
        email: res.data.email || "",
      });

      if (res.data.profileImage) {
        setPreview(res.data.profileImage);
      }

    } catch (err) {
      console.error("❌ Erreur chargement profil:", err.message);
      setHasProfile(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = () => {
    console.log("🔄 Rechargement profil...");
    fetchProfile();
  };

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
      alert("Aucun profil trouvé à modifier.");
      return;
    }
    setVisibleModifier(true);
  };

  const handleOpenAjouter = () => {
    if (hasProfile) {
      alert("Vous avez déjà un profil. Utilisez 'Mettre à jour'.");
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

        {/* SECTION DEBUG (optionnelle - peut être supprimée)
        <div className="debug-section">
          <h4>🔍 Informations de Debug</h4>
          <div className="debug-grid">
            <div className="debug-item">
              <strong>Profil trouvé:</strong> {hasProfile ? "OUI ✅" : "NON ❌"}
            </div>
            <div className="debug-item">
              <strong>ID Profil:</strong> {profildata.id || "Aucun"}
            </div>
          </div>
        </div> */}

        {/* IMAGE DE PROFIL */}
        <div className="profile-image-section">
          <div className="image-container" onClick={handleAvatarClick}>
            <Avatar
              src={userData.profileImage}
              name={userData.username || "Utilisateur"}
              size="150"
              round={true}
            />
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={onFileChange} 
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <p>Cliquez sur l'avatar pour changer la photo</p>
        </div>

        {/* INFOS UTILISATEUR */}
        <div className="user-info-section">
          <h3>Informations personnelles</h3>
          <p><strong>Pseudonyme :</strong> {userData.username || "—"}</p>
          <p><strong>Email :</strong> {userData.email || "—"}</p>
        </div>

        {/* COMPOSANT D'AFFICHAGE SÉPARÉ */}
        <AfficherProfil 
          profildata={profildata}
          hasProfile={hasProfile}
        />

        {/* BOUTONS */}
        <div className="button-actions">
          <button
            onClick={handleOpenModifier}
            disabled={!hasProfile}
            className={`btn-update ${!hasProfile ? 'btn-disabled' : ''}`}
          >
            Mettre à jour
          </button>
          <button
            onClick={handleOpenAjouter}
            disabled={hasProfile}
            className={`btn-add ${hasProfile ? 'btn-disabled' : ''}`}
          >
            {hasProfile ? "Profil déjà créé" : "Ajouter infos"}
          </button>
        </div>
      </div>

      {/* MODALS */}
      <Dialog 
        header="Créer votre profil"
        visible={visibleAjouter} 
        onHide={() => setVisibleAjouter(false)} 
        style={{ width: "70vw" }}
      >
        <Ajouter 
          onClose={() => setVisibleAjouter(false)} 
          onSuccess={handleProfileUpdate}
        />
      </Dialog>

      <Dialog 
        header="Modifier votre profil"
        visible={visibleModifier} 
        onHide={() => setVisibleModifier(false)} 
        style={{ width: "70vw" }}
      >
        <Modifier 
          onClose={() => setVisibleModifier(false)}
          profilId={profildata.id}
          currentData={profildata} 
          onUpdate={handleProfileUpdate}
        />
      </Dialog>

      <Dialog
        header="Aperçu de l'image"
        visible={imageDialog}
        onHide={() => setImageDialog(false)}
        style={{ width: "60vw" }}
      >
        <div style={{ textAlign: "center" }}>
          {preview && (
            <>
              <h4>Nouvelle image de profil</h4>
              <Avatar
                src={preview}
                name={userData.username}
                size="200"
                round={true}
              />
              <p>Cette image remplacera votre photo de profil actuelle</p>
            </>
          )}
          <div className="dialog-actions">
            <button onClick={() => setImageDialog(false)} className="btn-cancel">
              Annuler
            </button>
            <button onClick={saveCroppedImage} disabled={loading} className="btn-confirm">
              {loading ? "Enregistrement..." : "Confirmer"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Profil;