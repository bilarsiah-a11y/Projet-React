

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import Avatar from 'react-avatar';
import AvatarEditor from "react-avatar-editor";
import { FaEdit, FaPlusCircle, FaSave, FaTimes, FaArrowRight, FaArrowLeft, FaCheck, FaSync } from "react-icons/fa";
import "../sections2Css/Profil.css";

const Profil = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // ÉTAPE DE CRÉATION/MODIFICATION
  const [step, setStep] = useState(1);
  const [showStepper, setShowStepper] = useState(false);

  // ÉDITEUR D'AVATAR - avec react-avatar-editor
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [userData, setUserData] = useState({
    profileImage: "/default-avatar.png",
    username: "",
    email: "",
  });

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    date: "",
    lieu: "",
    genre: "",
    adresse: "",
    numordre: "",
    contact: "",
    autreContact: "",
    titre: "",
    domaine: "",
    region: "",
  });

  const [hasProfile, setHasProfile] = useState(false);
  const [profileId, setProfileId] = useState("");

  // pourcentage de complétion
  const calculateCompletionPercentage = () => {
    const requiredFields = [
      "nom", "prenom", "date", "lieu", "genre", "adresse",
      "numordre", "contact", "titre", "domaine", "region"
    ];
    
    const filledFields = requiredFields.filter(field => formData[field] && formData[field].trim() !== "");
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  // Chargement du profil
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

      console.log("✅ Profil chargé:", res.data);

      const hasValidProfile = res.data && res.data.hasProfil && res.data.Nom;

      if (hasValidProfile) {
        setHasProfile(true);
        setProfileId(res.data.id);
        setFormData({
          nom: res.data.Nom || "",
          prenom: res.data.Prenom || "",
          date: res.data.Date || "",
          lieu: res.data.Lieu || "",
          genre: res.data.genre || "",
          adresse: res.data.Adresse || "",
          numordre: res.data.NumOrdre || "",
          contact: res.data.Contact || "",
          autreContact: res.data.AutreContact || "",
          titre: res.data.Titre || "",
          domaine: res.data.Domaine || "",
          region: res.data.Region || "",
        });
      } else {
        setHasProfile(false);
        setProfileId("");
        setFormData({
          nom: "",
          prenom: "",
          date: "",
          lieu: "",
          genre: "",
          adresse: "",
          numordre: "",
          contact: "",
          autreContact: "",
          titre: "",
          domaine: "",
          region: "",
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

  // Gestion des fichiers image
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setImageDialog(true);
        setScale(1);
        setRotation(0);
        setUploadProgress(0);
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
    setUploadProgress(30);
    const token = localStorage.getItem("token");

    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      
      setUploadProgress(60);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("profileImage", blob, selectedFile.name);

        setUploadProgress(80);
        
        const res = await axios.post(
          "http://localhost:3002/upload-profile-image",
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(80 + percentCompleted / 5);
            }
          }
        );

        setUploadProgress(100);
        
        setUserData(prev => ({ ...prev, profileImage: res.data.profileImage }));
        setImageDialog(false);
        setSelectedFile(null);
        setScale(1);
        setRotation(0);
        setUploadProgress(0);
        
        alert("Image de profil mise à jour avec succès !");
        setLoading(false);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'upload de l'image");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Gestion du stepper et création
  const handleCreateProfile = () => {
    setShowStepper(false);
    setStep(1);
    setIsEditing(true);
  };

  const handleEditProfile = () => {
    setShowStepper(false);
    setStep(1);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowStepper(false);
    setStep(1);
    fetchProfile();
    setScale(1);
    setRotation(0);
  };

  const nextStep = () => {
    if (step === 2) {
      if (!formData.nom || !formData.prenom || !formData.date || !formData.lieu || !formData.genre || !formData.adresse) {
        alert("Veuillez remplir tous les champs obligatoires de l'étape 2");
        return;
      }
    } else if (step === 3) {
      if (!formData.numordre || !formData.contact || !formData.titre || !formData.domaine || !formData.region) {
        alert("Veuillez remplir tous les champs obligatoires de l'étape 3");
        return;
      }
    }
    
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fonction d'ajout (création)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Token d'authentification manquant. Veuillez vous reconnecter.");
      setSaveLoading(false);
      return;
    }

    const requiredFields = [
      "nom", "prenom", "date", "lieu", "genre", "adresse",
      "numordre", "contact", "titre", "domaine", "region",
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);
    if (emptyFields.length > 0) {
      alert(`Veuillez remplir tous les champs obligatoires : ${emptyFields.join(', ')}`);
      setSaveLoading(false);
      return;
    }

    try {
      console.log("📤 Envoi données création:", formData);
      
      const response = await axios.post(
        `http://localhost:3002/Ajouter`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ Réponse création profil:", response.data);
      alert(response.data.message || "Profil créé avec succès !");
      
      setIsEditing(false);
      setShowStepper(false);
      setStep(1);
      fetchProfile();
      
    } catch (err) {
      console.error("❌ Erreur création :", err);
      
      if (err.response?.data?.message?.includes("existe déjà")) {
        alert("Un profil existe déjà. Passage en mode modification...");
        setHasProfile(true);
        setProfileId(err.response.data.profilId);
        fetchProfile();
      } else {
        alert(err.response?.data?.message || "Erreur lors de la création du profil");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Fonction de modification
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Token d'authentification manquant. Veuillez vous reconnecter.");
      setSaveLoading(false);
      return;
    }

    const requiredFields = [
      "nom", "prenom", "date", "lieu", "genre", "adresse",
      "numordre", "contact", "titre", "domaine", "region",
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);
    if (emptyFields.length > 0) {
      alert(`Veuillez remplir tous les champs obligatoires : ${emptyFields.join(', ')}`);
      setSaveLoading(false);
      return;
    }

    try {
      console.log("📤 Envoi données modification:", formData);
      
      const response = await axios.put(
        `http://localhost:3002/Modifier/${profileId}`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ Réponse modification:", response.data);
      alert(response.data.message || "Modification réussie !");
      
      setIsEditing(false);
      setShowStepper(false);
      setStep(1);
      fetchProfile();
      
    } catch (err) {
      console.error("❌ Erreur modification :", err);
      alert(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setSaveLoading(false);
    }
  };

  // Rendu conditionnel du bouton de soumission
  const renderSubmitButton = () => {
    if (hasProfile) {
      return (
        <button
          type="submit"
          disabled={saveLoading}
          className="btn-save-form"
        >
          <FaSave className="btn-icon" />
          {saveLoading ? "Mise à jour..." : "Mettre à jour le profil"}
        </button>
      );
    } else {
      return (
        <button
          type="submit"
          disabled={saveLoading}
          className="btn-save-form"
        >
          <FaPlusCircle className="btn-icon" />
          {saveLoading ? "Création..." : "Créer mon profil"}
        </button>
      );
    }
  };

  // Réinitialiser les modifications
  const resetAvatarEditor = () => {
    setScale(1);
    setRotation(0);
    setUploadProgress(0);
  };

  if (loadingProfile) {
    return (
      <div className="profil-section">
        <div className="profil-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-section">
      <div className="profil-container compact-view">
        <div className="profil-header">
          <h1 className="profil-title">Mon Profil</h1>
          
          {!isEditing && (
            <div className="profil-actions">
              {hasProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="btn-modifier-all"
                  title="Modifier le profil"
                >
                  <FaEdit className="btn-icon" />
                  Modifier
                </button>
              ) : (
                <button
                  onClick={handleCreateProfile}
                  className="btn-ajouter-all"
                  title="Créer un profil"
                >
                  <FaPlusCircle className="btn-icon" />
                  Créer un profil
                </button>
              )}
            </div>
          )}
        </div>

        {/* STEEPER INVISIBLE */}
        {/* Le stepper est masqué via CSS avec display: none */}

        <div className="profil-content">
          {isEditing ? (
            // MODE ÉDITION AVEC STEPS MASQUÉS
            <form onSubmit={hasProfile ? handleUpdateSubmit : handleCreateSubmit} className="modification-form">
              {/* EN-TÊTE DU FORMULAIRE */}
              <div className="form-header">
                <h2 className="form-title">
                  {hasProfile ? "Modifier votre profil" : "Créer votre profil"}
                </h2>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-cancel-form"
                  >
                    <FaTimes className="btn-icon" />
                    Annuler
                  </button>
                </div>
              </div>

              {/* ÉTAPE 1 : PHOTO DE PROFIL ET INFOS DE BASE */}
              {step === 1 && (
                <div className="form-step">
                  <h3 className="step-title">
                    <span className="step-number-badge">Étape 1</span>
                    Photo de profil et informations de base
                  </h3>
                  
                  <div className="profile-image-section">
                    <div className="image-container" onClick={handleAvatarClick}>
                      <Avatar
                        src={userData.profileImage}
                        name={userData.username || "Utilisateur"}
                        size="80"
                        round={true}
                      />
                      <div className="image-overlay">
                        <FaEdit size={16} />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onFileChange} 
                      ref={fileInputRef}
                      style={{ display: "none" }}
                    />
                    <p className="image-hint">Cliquez pour changer la photo</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Pseudonyme</label>
                      <input 
                        type="text" 
                        value={userData.username || ""}
                        className="form-input readonly"
                        readOnly
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={userData.email || ""}
                        className="form-input readonly"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="step-actions-compact">
                    <div className="buttons-group">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn-next-step"
                      >
                        Suivant <FaArrowRight className="btn-icon-right" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : INFORMATIONS PERSONNELLES */}
              {step === 2 && (
                <div className="form-step">
                  <h3 className="step-title">
                    <span className="step-number-badge">Étape 2</span>
                    Informations personnelles
                  </h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom *</label>
                      <input 
                        type="text" 
                        name="nom"
                        value={formData.nom} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                        placeholder="Votre nom"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Prénom *</label>
                      <input 
                        type="text" 
                        name="prenom"
                        value={formData.prenom} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Date de naissance *</label>
                      <input 
                        type="date" 
                        name="date"
                        value={formData.date} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Lieu de naissance *</label>
                      <input 
                        type="text" 
                        name="lieu"
                        value={formData.lieu} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                        placeholder="Ville de naissance"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Genre *</label>
                      <select 
                        name="genre"
                        value={formData.genre} 
                        onChange={handleInputChange}
                        className="form-select no-blue-focus"
                        required
                      >
                        <option value="">-- Sélectionnez votre genre --</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Adresse *</label>
                      <input 
                        type="text" 
                        name="adresse"
                        value={formData.adresse} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                        placeholder="Votre adresse complète"
                      />
                    </div>
                  </div>
                  
                  <div className="step-actions-compact">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-prev-step"
                    >
                      <FaArrowLeft className="btn-icon-left" /> Précédent
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-next-step"
                    >
                      Suivant <FaArrowRight className="btn-icon-right" />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : PROFIL PROFESSIONNEL */}
              {step === 3 && (
                <div className="form-step">
                  <h3 className="step-title">
                    <span className="step-number-badge">Étape 3</span>
                    Profil professionnel
                  </h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Numéro d'ordre *</label>
                      <input 
                        type="text" 
                        name="numordre"
                        value={formData.numordre} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                        placeholder="Votre numéro d'ordre"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact *</label>
                      <input 
                        type="tel" 
                        name="contact"
                        value={formData.contact} 
                        onChange={handleInputChange}
                        className="form-input no-blue-focus"
                        required 
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Autre contact (optionnel)</label>
                    <input 
                      type="text" 
                      name="autreContact"
                      value={formData.autreContact} 
                      onChange={handleInputChange}
                      className="form-input no-blue-focus"
                      placeholder="Autre numéro ou contact"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Titre professionnel *</label>
                      <select 
                        name="titre"
                        value={formData.titre} 
                        onChange={handleInputChange}
                        className="form-select no-blue-focus"
                        required
                      >
                        <option value="">-- Sélectionnez votre titre --</option>
                        <option value="Docteur">Docteur</option>
                        <option value="Professeur">Professeur</option>
                        <option value="Docteur Spécialiste">Docteur Spécialiste</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Mode d'exercice *</label>
                      <select 
                        name="domaine"
                        value={formData.domaine} 
                        onChange={handleInputChange}
                        className="form-select no-blue-focus"
                        required
                      >
                        <option value="">-- Sélectionnez votre domaine --</option>
                        <option value="Fonctionnaire">Fonctionnaire</option>
                        <option value="Privé">Privé</option>
                        <option value="Libéral">Libéral</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Région d'exercice *</label>
                    <select 
                      name="region"
                      value={formData.region} 
                      onChange={handleInputChange}
                      className="form-select no-blue-focus"
                      required
                    >
                      <option value="">-- Sélectionnez votre région --</option>
                      <option value="Alaotra Mangoro">Alaotra Mangoro</option>
                      <option value="Antsinanana">Antsinanana</option>
                      <option value="Anosy">Anosy</option>
                      <option value="Analanjirofo">Analanjirofo</option>
                      <option value="Atsimo Andrefana">Atsimo Andrefana</option>
                      <option value="Amoron'i Mania">Amoron'i Mania</option>
                      <option value="Atsimo Atsinanana">Atsimo Atsinanana</option>
                      <option value="Analamanga">Analamanga</option>
                      <option value="Androy">Androy</option>
                      <option value="Boeny">Boeny</option>
                      <option value="Betsiboka">Betsiboka</option>
                      <option value="Bongolava">Bongolava</option>
                      <option value="Diana">Diana</option>
                      <option value="Haute Matsiatra">Haute Matsiatra</option>
                      <option value="Itasy">Itasy</option>
                      <option value="Ihorombe">Ihorombe</option>
                      <option value="Melaky">Melaky</option>
                      <option value="Menabe">Menabe</option>
                      <option value="Sofia">Sofia</option>
                      <option value="Vakinankaratra">Vakinankaratra</option>
                      <option value="Vatovavy Fitovinany">Vatovavy Fitovinany</option>
                    </select>
                  </div>
                  
                  <div className="step-actions-compact">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-prev-step"
                    >
                      <FaArrowLeft className="btn-icon-left" /> Précédent
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-next-step"
                    >
                      Suivant <FaArrowRight className="btn-icon-right" />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : CONFIRMATION */}
              {step === 4 && (
                <div className="form-step">
                  <h3 className="step-title">
                    <span className="step-number-badge">Étape 4</span>
                    Confirmation et finalisation
                  </h3>
                  
                  <div className="confirmation-section">
                    <div className="completion-card">
                      <div className="completion-header">
                        <FaCheck className="completion-icon" />
                        <h4>Votre profil est prêt !</h4>
                      </div>
                      <p className="completion-percentage-text">
                        <strong>{completionPercentage}% complété</strong> - 
                        {completionPercentage === 100 
                          ? " Félicitations ! Votre profil est complet et visible par les patients."
                          : " Continuez à compléter pour maximiser votre visibilité."
                        }
                      </p>
                      
                      <div className="completion-details">
                        <h5>Récapitulatif de vos informations :</h5>
                        
                        <div className="info-summary">
                          <div className="summary-item">
                            <span className="summary-label">Nom complet :</span>
                            <span className="summary-value">{formData.prenom} {formData.nom}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Date de naissance :</span>
                            <span className="summary-value">{formData.date || "Non spécifié"}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Genre :</span>
                            <span className="summary-value">
                              {formData.genre === 'homme' ? 'Homme' : 
                               formData.genre === 'femme' ? 'Femme' : 'Non spécifié'}
                            </span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Adresse :</span>
                            <span className="summary-value">{formData.adresse || "Non spécifié"}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Titre professionnel :</span>
                            <span className="summary-value">{formData.titre || "Non spécifié"}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Mode d'exercice :</span>
                            <span className="summary-value">{formData.domaine || "Non spécifié"}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Région :</span>
                            <span className="summary-value">{formData.region || "Non spécifié"}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Numéro d'ordre :</span>
                            <span className="summary-value">{formData.numordre || "Non spécifié"}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Contact :</span>
                            <span className="summary-value">{formData.contact || "Non spécifié"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions-compact">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-prev-step"
                    >
                      <FaArrowLeft className="btn-icon-left" /> Précédent
                    </button>
                    <div className="form-submit-buttons">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-cancel-form"
                      >
                        <FaTimes className="btn-icon" />
                        Annuler
                      </button>
                      {renderSubmitButton()}
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            // MODE AFFICHAGE SIMPLE ET COMPACT
            <div className="affichage-content">
              {/* Photo et informations de base */}
              <div className="profile-header-section">
                <div className="profile-image-section">
                  <div className="image-container" onClick={handleAvatarClick}>
                    <Avatar
                      src={userData.profileImage}
                      name={userData.username || "Utilisateur"}
                      size="80"
                      round={true}
                    />
                  </div>
                </div>

                <div className="basic-info-section">
                  <h2 className="user-name">
                    {userData.username || "Utilisateur"}
                  </h2>
                  <p className="user-email">{userData.email || "—"}</p>
                  
                  {/* BARRE DE PROGRESSION VISIBLE EN AFFICHAGE */}
                  {hasProfile && (
                    <div className="completion-display">
                      <div className="completion-label">
                        Complétion du profil :
                        <span className={`completion-percentage ${completionPercentage === 100 ? 'complete' : ''}`}>
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="completion-bar">
                        <div 
                          className={`completion-fill ${completionPercentage === 100 ? 'complete' : ''}`} 
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      {completionPercentage === 100 ? (
                        <p className="completion-message success">✅ Profil 100% complet et visible</p>
                      ) : (
                        <p className="completion-message">
                          ⚠️ Complétez votre profil pour apparaître dans les recherches
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Séparateur */}
              <hr className="section-separator" />

              {/* AFFICHAGE DU PROFIL PROFESSIONNEL */}
              {hasProfile ? (
                <div className="profil-details-section">
                  <h2 className="profil-professionnel-title">
                    Profil professionnel
                    {formData.genre && (
                      <span className="gender-icon">
                        {formData.genre === 'homme' ? '👩‍⚕️' : formData.genre === 'femme' ? '👨‍⚕️' : ''}
                      </span>
                    )}
                  </h2>
                  
                  <div className="nom-complet">
                     <span className="nom">{formData.nom}</span>
                    <span className="prenom">{formData.prenom}</span>
                  
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Date de naissance :</span>
                      <span className="info-value">{formData.date || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Lieu de naissance :</span>
                      <span className="info-value">{formData.lieu || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Genre :</span>
                      <span className="info-value">
                        {formData.genre === 'homme' ? 'Homme' : 
                         formData.genre === 'femme' ? 'Femme' : '—'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Adresse :</span>
                      <span className="info-value">{formData.adresse || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Contact principal :</span>
                      <span className="info-value">{formData.contact || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Contact secondaire :</span>
                      <span className="info-value">{formData.autreContact || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Numéro d'ordre :</span>
                      <span className="info-value">{formData.numordre || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Titre professionnel :</span>
                      <span className="info-value">{formData.titre || "—"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mode d'exercice :</span>
                      <span className="info-value">
                        {formData.domaine === 'Fonctionnaire' ? 'Fonctionnaire' :
                         formData.domaine === 'Privé' ? 'Privé' :
                         formData.domaine === 'Libéral' ? 'Libéral' : '—'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Région d'exercice :</span>
                      <span className="info-value">{formData.region || "—"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-profile-section">
                  <div className="no-profile-message">
                    <div className="no-profile-icon">👨‍⚕️</div>
                    <h3>Vous n'avez pas encore de profil professionnel</h3>
                    <p>
                      Créez votre profil dentiste pour apparaître dans les recherches des patients, 
                      augmenter votre visibilité et recevoir plus de demandes de rendez-vous.
                    </p>
                    <button
                      onClick={handleCreateProfile}
                      className="btn-create-profile"
                    >
                      <FaPlusCircle className="btn-icon" />
                      Créer mon profil professionnel
                    </button>
                    <div className="no-profile-benefits">
                      <h4>Avantages d'avoir un profil complet :</h4>
                      <ul>
                        <li>✅ Apparaître dans les recherches des patients</li>
                        <li>✅ Être visible sur la carte des dentistes</li>
                        <li>✅ Recevoir des demandes de rendez-vous</li>
                        <li>✅ Augmenter votre crédibilité professionnelle</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL POUR L'IMAGE AVEC REACT-AVATAR-EDITOR */}
      <Dialog
        header="Éditeur d'avatar"
        visible={imageDialog}
        onHide={() => {
          setImageDialog(false);
          resetAvatarEditor();
        }}
        style={{ width: "90vw", maxWidth: "500px" }}
        className="image-modal"
        dismissableMask={true}
      >
        {/* Barre de progression HAUT */}
        <div className="image-progress-top">
          <div className="image-progress-text">
            <span>Préparation de l'image</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="image-progress-bar">
            <div 
              className="image-progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "15px" }}>
          {preview && (
            <>
              <h4>Ajustez votre photo de profil</h4>
              
              {/* Éditeur Avatar avec react-avatar-editor */}
              <div className="avatar-preview-container">
                <AvatarEditor
                  ref={editorRef}
                  image={preview}
                  width={200}
                  height={200}
                  border={20}
                  borderRadius={100}
                  color={[255, 255, 255, 0.6]}
                  scale={scale}
                  rotate={rotation}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              
              {/* Contrôles de l'éditeur */}
              <div className="avatar-editor">
                <div className="editor-controls">
                  
                  {/* Contrôle Zoom */}
                  <div className="control-group">
                    <span className="control-label">Zoom</span>
                    <div className="control-with-arrows">
                      <button 
                        className="control-arrow-btn"
                        onClick={() => setScale(Math.max(1, scale - 0.1))}
                        disabled={scale <= 1}
                      >
                        <FaArrowLeft />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="control-slider"
                      />
                      <button 
                        className="control-arrow-btn"
                        onClick={() => setScale(Math.min(3, scale + 0.1))}
                        disabled={scale >= 3}
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                    <div className="control-value-display">
                      <span className="value-number">{scale.toFixed(1)}x</span>
                    </div>
                  </div>
                  
                  {/* Contrôle Rotation */}
                  <div className="control-group">
                    <span className="control-label">Rotation</span>
                    <div className="control-with-arrows">
                      <button 
                        className="control-arrow-btn"
                        onClick={() => setRotation((rotation - 15 + 360) % 360)}
                      >
                        <FaArrowLeft />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="control-slider"
                      />
                      <button 
                        className="control-arrow-btn"
                        onClick={() => setRotation((rotation + 15) % 360)}
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                    <div className="control-value-display">
                      <span className="value-number">{rotation}°</span>
                    </div>
                  </div>
                  
                  {/* Bouton Réinitialiser */}
                  <div className="control-group" style={{justifyContent: 'center', marginTop: '10px'}}>
                    <button
                      type="button"
                      onClick={resetAvatarEditor}
                      className="btn-cancel"
                      style={{padding: '6px 12px', fontSize: '12px'}}
                    >
                      <FaSync /> Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Barre de progression BAS */}
          <div className="image-progress-bottom">
            <div className="image-progress-text">
              <span>Progression de l'enregistrement</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="image-progress-bar">
              <div 
                className="image-progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="dialog-actions">
            <button 
              onClick={() => {
                setImageDialog(false);
                resetAvatarEditor();
              }} 
              className="btn-cancel"
            >
              <FaTimes /> Annuler
            </button>
            <button 
              onClick={saveEditedImage} 
              disabled={loading} 
              className="btn-confirm"
            >
              {loading ? (
                <>
                  <span className="action-spinner"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave /> Confirmer
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Profil;
