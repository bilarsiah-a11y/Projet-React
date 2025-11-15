// ...existing code...
import axios from "axios";

const API_BASE = "http://localhost:3002/Statistiques";

export const statistiqueService = {
  getStatistiquesRegion: async () => {
    const res = await axios.get(`${API_BASE}/region`);
    return res.data;
  },
  getStatistiquesTitre: async () => {
    const res = await axios.get(`${API_BASE}/titre`);
    return res.data;
  },
  getStatistiquesDomaine: async () => {
    const res = await axios.get(`${API_BASE}/domaine`);
    return res.data;
  },
  getTotalDentistes: async () => {
    const res = await axios.get(`${API_BASE}/total`);
    return res.data;
  },
};

// Optionnel : export minimal pour Statistiques2 si nécessaire
export const CardsData = [
  {
    title: "Exemple",
    color: { backGround: "linear-gradient(180deg,#bb67ff 0%,#4484f3 100%)", boxShadow: "0px 10px 20px 0px #e0c6f5" },
    barValue: 75,
    Value: "75%",
    png: "FaUsers",
    series: [{ name: "Ex", data: [10, 20, 30] }],
  },
];