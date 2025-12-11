import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import ProfileDropdown from '../sections2/ProfileDropdown'; 
import { 
  FaTachometerAlt, 
  FaUserMd, 
  FaChartBar, 

} from "react-icons/fa";

const Sidebar = () => {
  return (
     <nav className="navbar">
      <div className="nav-container">

         <div>
          <h2>🦷SourireGuide</h2>
        </div>

         <ul className="nav-menu">
          <li><Link to="/apropos2" title="Dashboard"><FaTachometerAlt size={22} /></Link></li>
          <li><Link to="/listedentiste2" title="Dentistes"><FaUserMd size={22} /></Link></li>
          <li><Link to="/statistiques2" title="Statistiques"><FaChartBar size={22} /></Link></li>
        </ul>
        <ProfileDropdown />
      </div>
    </nav>
  );
};
export default Sidebar;