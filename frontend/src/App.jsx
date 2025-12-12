// import React from 'react';
// import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

// // Composants publique
// import NavbarPub from './components/NavbarPub';
// import ContentArea from './components/ContentArea';
// import Connexion from './sections/Connexion';
// import Inscription from './sections/Inscription.jsx';
// import ListeDentistes from './sections/ListeDentistes';
// import Apropos from './sections/Apropos';
// import Statistiques from './sections/Statistiques';
// import Footer from './components/Footer';

// // Composants utilisateur
// import Profil from './sections2/Profil';
// import Apropos2 from './sections2/Apropos2';  
// import ListeDentiste2 from './sections2/ListeDentistes2.jsx';
// import Statistiques2 from './sections2/Statistiques2';
// import AutreArea from './composant/AutreArea';
// import NavbarPrivee from './composant/NavbarPrivee';

// // Admin composant
// import RequireAdmin from './Admin/RequireAdmin';
// import AdminBar from './AdminComponent/AminBar.jsx';
// import AdminHome from './Admin/AdminHome';
// import AdminListe from './Admin/AdminListe';
// import AdminStatistique from './Admin/AdminStatistique';
// import AdminValide from './Admin/AdminValide';
// import AdminProfil from './Admin/AdminProfil';

// // CSS
//  import './App.css';


// // ================= Layouts Wrappers =================

// // Layout Public (Navbar + Footer)
// const PublicLayout = () => (
//   <div className="navbar-layout">
//     <NavbarPub />
//     <div className="main-content">
//       <Outlet />
//     </div>
//     <Footer />
//   </div>
// );

// // Layout Utilisateur (Sidebar + Footer)
// const UserLayout = () => (
//   <div className="sidebar-layout">
//     <NavbarPrivee />
//     <div className="main-content">
//       <Outlet />
//     </div>
//     <Footer />
//   </div>
// );

// // Layout Admin (AdminBar + Footer)
// const AdminLayout = () => (
//   <RequireAdmin>
//     <div className="sidebar-layout">
//       <AdminBar />
//       <div className="main-content">
//         <Outlet />
//       </div>
//       <Footer />
//     </div>
//   </RequireAdmin>
// );


// // ================= Token =================
// const getToken = () => {
//   try {
//     const stored = localStorage.getItem('token');
//     if (!stored || stored === 'null' || stored === 'undefined') return null;

//     try {
//       return JSON.parse(stored);
//     } catch {
//       return stored;
//     }
//   } catch (error) {
//     console.error('Erreur lors de la lecture du token:', error);
//     localStorage.removeItem('token');
//     return null;
//   }
// };

// // ================= Protéger routes utilisateur =================
// const RequireAuth = ({ children }) => {
//   const token = getToken();
//   const location = useLocation();

//   if (!token) {
//     return <Navigate to="/connexion" state={{ from: location }} replace />;
//   }
//   return children;
// };


// // ================= App =================
// function App() {
//   return (
//     <BrowserRouter>
//       <ErrorBoundary>
//         <Routes>

//           {/* === PUBLIC === */}
//           <Route element={<PublicLayout />}>
//             <Route path="/" element={<ContentArea />} />
//             <Route path="/contentarea" element={<ContentArea />} />
//             <Route path="/connexion" element={<Connexion />} />
//             <Route path="/inscription" element={<Inscription />} />
//             <Route path="/listedentistes" element={<ListeDentistes />} />
//             <Route path="/apropos" element={<Apropos />} />
//             <Route path="/statistiques" element={<Statistiques />} />
//           </Route>

//           {/* === UTILISATEUR === */}
//           <Route
//             element={
//               <RequireAuth>
//                 <UserLayout />
//               </RequireAuth>
//             }
//           >
//             <Route path="/autrearea" element={<AutreArea />} />
//             <Route path="/profil" element={<Profil />} />
//             <Route path="/listedentiste2" element={<ListeDentiste2 />} />
//             <Route path="/apropos2" element={<Apropos2 />} />
//             <Route path="/statistiques2" element={<Statistiques2 />} />
//           </Route>

//           {/* === ADMIN === */}
//           <Route element={<AdminLayout />}>
//             <Route path="/admin" element={<AdminHome />} />
//             <Route path="/admin/home" element={<AdminHome />} />
//             <Route path="/admin/liste" element={<AdminListe />} />
//             <Route path="/admin/statistique" element={<AdminStatistique />} />
//             <Route path="/admin/valide" element={<AdminValide />} />
//             <Route path="/admin/profil" element={<AdminProfil />} />
//           </Route>

//           {/* === DEFAULT REDIRECT === */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </ErrorBoundary>
//     </BrowserRouter>
//   );
// }

// // ================= Error Boundary =================
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null, errorInfo: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error('ERREUR CAPTURÉE:', error);
//     console.error('DÉTAILS:', errorInfo);
//     this.setState({ error, errorInfo });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="error-boundary">
//           <h1>Une erreur s'est produite</h1>
//           <div className="error-box">
//             <h3>Message d'erreur :</h3>
//             <pre>{this.state.error?.toString()}</pre>
//             <h3>Stack trace :</h3>
//             <pre>{this.state.errorInfo?.componentStack}</pre>
//           </div>
//           <button onClick={() => window.location.reload()}>Recharger la page</button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// export default App;




import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

// Composants publique
import NavbarPub from './components/NavbarPub';
import ContentArea from './components/ContentArea';
import Connexion from './sections/Connexion';
import Inscription from './sections/Inscription.jsx';
import ListeDentistes from './sections/ListeDentistes';
import Apropos from './sections/Apropos';
import Statistiques from './sections/Statistiques';
import Footer from './components/Footer';

// Composants utilisateur
import Profil from './sections2/Profil';
import Apropos2 from './sections2/Apropos2';  
import ListeDentiste2 from './sections2/ListeDentistes2.jsx';
import Statistiques2 from './sections2/Statistiques2';
import AutreArea from './composant/AutreArea';
import NavbarPrivee from './composant/NavbarPrivee';

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

// Layout Public (Navbar + Footer)
const PublicLayout = () => (
  <div className="public-layout">
    <NavbarPub />
    <div className="main-content public-main">
      <div className="outlet-wrapper">
        <Outlet />
      </div>
    </div>
    <Footer />
  </div>
);

// Layout Utilisateur (Sidebar + Footer)
const UserLayout = () => (
  <div className="user-layout">
    <NavbarPrivee />
    <div className="main-content user-main">
      <div className="outlet-wrapper">
        <Outlet />
      </div>
    </div>
    <Footer />
  </div>
);

// Layout Admin (AdminBar + Footer)
const AdminLayout = () => (
  <RequireAdmin>
    <div className="admin-layout">
      <AdminBar />
      <div className="main-content admin-main">
        <div className="outlet-wrapper">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  </RequireAdmin>
);

// ================= Token =================
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

// ================= Protéger routes utilisateur =================
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

          {/* === PUBLIC === */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<ContentArea />} />
            <Route path="/contentarea" element={<ContentArea />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/listedentistes" element={<ListeDentistes />} />
            <Route path="/apropos" element={<Apropos />} />
            <Route path="/statistiques" element={<Statistiques />} />
          </Route>

          {/* === UTILISATEUR === */}
          <Route
            element={
              <RequireAuth>
                <UserLayout />
              </RequireAuth>
            }
          >
            <Route path="/autrearea" element={<AutreArea />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/listedentiste2" element={<ListeDentiste2 />} />
            <Route path="/apropos2" element={<Apropos2 />} />
            <Route path="/statistiques2" element={<Statistiques2 />} />
          </Route>

          {/* === ADMIN === */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/liste" element={<AdminListe />} />
            <Route path="/admin/statistique" element={<AdminStatistique />} />
            <Route path="/admin/valide" element={<AdminValide />} />
            <Route path="/admin/profil" element={<AdminProfil />} />
          </Route>

          {/* === DEFAULT REDIRECT === */}
          <Route path="*" element={<Navigate to="/" replace />} />
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