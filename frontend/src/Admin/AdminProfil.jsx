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
              name={userData.username || "Admin"}
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
          <h3>Informations Admin</h3>
          <p><strong>Pseudonyme :</strong> {displayValue(userData.username)}</p>
          <p><strong>Email :</strong> {displayValue(userData.email)}</p>
          <p><strong>Mot de passe :</strong> {displayValue(userData.password)}</p>
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
        </div>
      </div>

      {/* DIALOG MODIFICATION */}
      <Dialog visible={visibleModifier} onHide={() => setVisibleModifier(false)} style={{ width: "70vw" }}>
        <ModifierAdmin onClose={() => setVisibleModifier(false)} />
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
                name={userData.username || "Admin"}
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
              cursor: "pointer",
            }}
          >
            {loading ? "Enregistrement..." : "Confirmer l'image"}
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminProfil;