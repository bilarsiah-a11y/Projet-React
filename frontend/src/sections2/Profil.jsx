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

  const [userData, setUserData] = useState({
    profileImage: "/default-avatar.png",
    username: "",
    email: "",
  });

  const [profildata, setProfilData] = useState({
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
          "http://localhost:3002/Profil",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Données reçues du backend:", res.data);

        setUserData({
          profileImage: res.data.profileImage || "/default-avatar.png",
          username: res.data.username || "",
          email: res.data.email || "",
        });

        setProfilData({
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

  return (
    <div className="profil-section">
      <div className="profil-container">
        <h1>Mon Profil</h1>

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
        <h3>Profil complet</h3>
        <div className="info-item">
          <p><strong>Nom :</strong> {displayValue(profildata.Nom)}</p>
          <p><strong>Prénom :</strong> {displayValue(profildata.Prenom)}</p>
          <p><strong>Date de naissance :</strong> {displayValue(profildata.Date)}</p>
          <p><strong>Lieu de naissance :</strong> {displayValue(profildata.Lieu)}</p>
          <p><strong>Genre :</strong> {displayValue(profildata.genre)}</p>
          <p><strong>Adresse :</strong> {displayValue(profildata.Adresse)}</p>
          <p><strong>Contact :</strong> {displayValue(profildata.Contact)}</p>
          <p><strong>Autre contact :</strong> {displayValue(profildata.AutreContact)}</p>
          <p><strong>Numéro d'ordre :</strong> {displayValue(profildata.NumOrdre)}</p>
          <p><strong>Titre :</strong> {displayValue(profildata.Titre)}</p>
          <p><strong>Fonction :</strong> {displayValue(profildata.Domaine)}</p>
          <p><strong>Région :</strong> {displayValue(profildata.Region)}</p>
        </div>

        {/* BOUTONS */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setVisibleModifier(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={() => setVisibleAjouter(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ajouter infos
          </button>
        </div>
      </div>

      {/* DIALOG AJOUT */}
      <Dialog 
        header={null}
        visible={visibleAjouter} 
        onHide={() => setVisibleAjouter(false)} 
        style={{ width: "70vw" }}
      >
        <Ajouter onClose={() => setVisibleAjouter(false)} />
      </Dialog>

      {/* DIALOG MODIFICATION */}
      <Dialog 
        visible={visibleModifier} 
        onHide={() => setVisibleModifier(false)} 
        style={{ width: "70vw" }}
      >
        <Modifier onClose={() => setVisibleModifier(false)} />
      </Dialog>

      {/* DIALOG IMAGE */}
      <Dialog
        header="Aperçu de l'image"
        visible={imageDialog}
        onHide={() => setImageDialog(false)}
        style={{ width: "60vw" }}
      >
        <div style={{ textAlign: "center" }}>
          {/* Aperçu de l'image sélectionnée */}
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
          <button
            onClick={saveCroppedImage}
            disabled={loading}
            style={{
              marginTop: "15px",
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Enregistrement..." : "Confirmer l'image"}
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default Profil;