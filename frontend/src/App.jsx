import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

// Composants publique
import Navbar from './components/Navbar';
import ContentArea from './components/ContentArea';
import Connexion from './sections/Connexion';
import Inscription from './sections/Inscription.jsx';
import ListeDentistes from './sections/ListeDentistes';
import Apropos from './sections/Apropos';
import Statistiques from './sections/Statistiques';

// Composants utilisateur
import Profil from './sections2/Profil';
import Apropos2 from './sections2/Apropos2';
import ListeDentiste2 from './sections2/ListeDentistes2.jsx';
import Statistiques2 from './sections2/Statistiques2';
import AutreArea from './composant/AutreArea';
import Sidebar from './composant/Sidebar';

// Admin composant
import RequireAdmin from './Admin/RequireAdmin';
import AdminBar from './AdminComponent/AminBar.jsx';
import AdminHome from './Admin/AdminHome';
import AdminListe from './Admin/AdminListe';
import AdminStatistique from './Admin/AdminStatistique';
import AdminValide from './Admin/AdminValide';
import AdminProfil from './Admin/AdminProfil';

// CSS
import './App.css';

// ================= Layouts Wrappers =================

// Layout Public en utilisant Navbar
const PublicLayout = () => (
  <div className="navbar-layout">
    <Navbar />
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

// Layout Utilisateur en utilisant avec Sidebar
const UserLayout = () => (
  <div className="sidebar-layout">
    <Sidebar />
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

// Layout Admin  en utilisant avec AdminBar
const AdminLayout = () => (
  <RequireAdmin>
    <div className="sidebar-layout">
      <AdminBar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  </RequireAdmin>
);

// ================= Récupération de  Token =================
const getToken = () => {
  try {
    const stored = localStorage.getItem('token');
    if (!stored || stored === 'null' || stored === 'undefined') return null;
    try {
      return JSON.parse(stored);
    } catch {
      return stored;
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du token:', error);
    localStorage.removeItem('token');
    return null;
  }
};

// ================= Route Guard pour utilisateur connecté =================
const RequireAuth = ({ children }) => {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }
  return children;
};

// ================= App =================
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* === Routes Publiques === */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<ContentArea />} />
            <Route path="/contentarea" element={<ContentArea />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/listedentistes" element={<ListeDentistes />} />
            <Route path="/apropos" element={<Apropos />} />
            <Route path="/statistiques" element={<Statistiques />} />
          </Route>

          {/* === Routes Utilisateur protégées=== */}
          <Route element={
            <RequireAuth>
              <UserLayout />
            </RequireAuth>
          }>
            <Route path="/autrearea" element={<AutreArea />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/listedentiste2" element={<ListeDentiste2 />} />
            <Route path="/apropos2" element={<Apropos2 />} />
            <Route path="/statistiques2" element={<Statistiques2 />} />
          </Route>

          {/* === Routes Admin protégées par RequireAdmin === */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/liste" element={<AdminListe />} />
            <Route path="/admin/statistique" element={<AdminStatistique />} />
            <Route path="/admin/valide" element={<AdminValide />} />
            <Route path="/admin/profil" element={<AdminProfil />} />
          </Route>

          {/* === Redirection par défaut === */}
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* <Route path="/motPasseOublier" element={<MotPasseOublier />} /> */}
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// ================= Error Boundary =================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ERREUR CAPTURÉE:', error);
    console.error('DÉTAILS:', errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Une erreur s'est produite</h1>
          <div className="error-box">
            <h3>Message d'erreur :</h3>
            <pre>{this.state.error?.toString()}</pre>
            <h3>Stack trace :</h3>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </div>
          <button onClick={() => window.location.reload()}>Recharger la page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default App;