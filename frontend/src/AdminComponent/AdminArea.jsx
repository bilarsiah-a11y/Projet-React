import React from 'react'
import AdminHome from './Admin/AdminHome';
import AdminListe from './Admin/AdminListe';
import AdminStatistique from './Admin/AdminStatistique';
import AdminSms from './Admin/AdminSms';
import AdminProfil from './Admin/AdminProfil'; 
import AdminValide from './Admin/AdminValide'; 
import AdminNotification from './Admin/AdminNotification';
import './AutreArea.css'

const AdminArea = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'admin/home':
        return <AdminHome />
      case 'admin/liste':
        return <AdminListe />
      case 'admin/statistique':
        return <AdminStatistique />
      case 'admin/sms':
        return <AdminSms />
      case 'admin/profil':
        return <AdminProfil />
      case 'admin/valide': 
        return <AdminValide />
      case 'admin/notifications': 
        return <AdminNotification />
      default:
        return <AdminHome />
    }
  }

  return (
    <main className="content-area">
      <div className="content-container">
        {renderSection()}
      </div>
    </main>
  )
}

export default AdminArea