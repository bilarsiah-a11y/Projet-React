import React from 'react'
import Apropos from '../sections/Apropos'
import ListeDentistes from '../sections/ListeDentistes'
import Statistiques from '../sections/Statistiques'
import Connexion from '../sections/Connexion'
import Inscription from '../sections/Inscription'
import './AutreArea.css'


const AutreArea = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
    
      case 'apropos':
        return <Apropos />
      case 'dentistes':
        return <ListeDentistes />
      case 'statistiques':
        return <Statistiques />
      case 'connexion':
        return <Connexion />
      case 'inscription':
        return <Inscription />
      default:
        return <Apropos/>
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

export default AutreArea