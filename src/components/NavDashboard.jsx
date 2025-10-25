import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBox,
  faCog,
  faSignOutAlt,
  faUser,
  faChartLine,
  faBoxesPacking,
  faTachometerAlt,
  faStethoscope,
  faUserDoctor,
  faCalendar,
  faCashRegister,
  faChevronDown,
  faChevronRight,
  faDashboard,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import logo from "../assets/219Meds.png";
import "./css/dashboard.css";

const NavDashboard = () => {
  const [expandedSections, setExpandedSections] = useState({
    admin: false,
    medical: false,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isAdmin = user?.isAdmin === true;
  const isMedico = user?.isMedico === true;
  const isPaciente = user?.isPaciente === true;
  const isSecretaria = user?.isSecretaria === true;

  console.log("User object:", user);
  console.log("Roles:", {
    isAdmin: user?.isAdmin,
    isMedico: user?.isMedico,
    isSecretaria: user?.isSecretaria,
    isPaciente: user?.isPaciente,
  });

  return (
    <>
      {/* Botón Toggle con estilo del NavBar */}
      <button 
        className="menu-toggle dashboard-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div className="nav-overlay active" onClick={toggleMobileMenu}></div>
      )}

      <div className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="profile-picture">
            <img src={logo} alt="User profile" />
          </div>

          {/* User Info */}
          <div className="user-info">
            <div className="user-role">
              {isAdmin
                ? "Administrador"
                : isMedico
                ? "Médico"
                : isSecretaria
                ? "Secretaria"
                : "Paciente"}
            </div>
            <div className="user-name">{user?.name || "Usuario"}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {/* Home */}
          <Link to="/" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
            <FontAwesomeIcon icon={faHome} className="menu-icon" />
            <span>Homescreen</span>
          </Link>

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="menu-section">
                <button
                  onClick={() => toggleSection("admin")}
                  className="menu-item menu-toggle"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="menu-icon" />
                  <span>Administración</span>
                  <FontAwesomeIcon
                    icon={expandedSections.admin ? faChevronDown : faChevronRight}
                    className="toggle-icon"
                  />
                </button>

                {expandedSections.admin && (
                  <div className="submenu">
                    <Link to="/admin" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faDashboard}
                        className="submenu-icon"
                      />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/pedidos" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon icon={faBox} className="submenu-icon" />
                      <span>Pedidos</span>
                    </Link>
                    <Link to="/clientes" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon icon={faUser} className="submenu-icon" />
                      <span>Clientes</span>
                    </Link>
                    <Link to="/products" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faBoxesPacking}
                        className="submenu-icon"
                      />
                      <span>Productos</span>
                    </Link>
                    <Link to="/analiticas" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faChartLine}
                        className="submenu-icon"
                      />
                      <span>Analíticas</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Medical Section */}
              <div className="menu-section">
                <button
                  onClick={() => toggleSection("medical")}
                  className="menu-item menu-toggle"
                >
                  <FontAwesomeIcon icon={faStethoscope} className="menu-icon" />
                  <span>Médico</span>
                  <FontAwesomeIcon
                    icon={
                      expandedSections.medical ? faChevronDown : faChevronRight
                    }
                    className="toggle-icon"
                  />
                </button>

                {expandedSections.medical && (
                  <div className="submenu">
                    <Link to="/especialistas" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faUserDoctor}
                        className="submenu-icon"
                      />
                      <span>Especialistas</span>
                    </Link>
                    <Link to="/pacientes" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon icon={faUser} className="submenu-icon" />
                      <span>Pacientes</span>
                    </Link>
                    <Link to="/turnos" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="submenu-icon"
                      />
                      <span>Turnos</span>
                    </Link>
                    <Link to="/consultorio" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faStethoscope}
                        className="submenu-icon"
                      />
                      <span>Consultorio</span>
                    </Link>
                    <Link to="/caja" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                      <FontAwesomeIcon
                        icon={faCashRegister}
                        className="submenu-icon"
                      />
                      <span>Caja</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Medico Section */}
          {isMedico && !isAdmin && (
            <div className="menu-section">
              <Link to="/turnos" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faCalendar} className="menu-icon" />
                <span>Turnos</span>
              </Link>
              <Link to="/pacientes" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faUser} className="menu-icon" />
                <span>Pacientes</span>
              </Link>
              <Link to="/consultorio" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faStethoscope} className="menu-icon" />
                <span>Consultorio</span>
              </Link>
            </div>
          )}

          {/* Paciente Section */}
          {isPaciente && !isAdmin && !isMedico && (
            <div className="menu-section">
              <Link to="/turnos/paciente" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faCalendar} className="menu-icon" />
                <span>Turnos</span>
              </Link>
              <Link to="/productos" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faBoxesPacking} className="submenu-icon" />
                <span>Productos</span>
              </Link>
            </div>
          )}

          {/* Secretaria Section */}
          {isSecretaria && !isAdmin && !isMedico && (
            <div className="menu-section">
              <Link to="/pedidos" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faBox} className="submenu-icon" />
                <span>Pedidos</span>
              </Link>
              <Link to="/clientes" className="submenu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faUser} className="submenu-icon" />
                <span>Clientes</span>
              </Link>
              <Link to="/turnos" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faCalendar} className="menu-icon" />
                <span>Turnos</span>
              </Link>
              <Link to="/products" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faBoxesPacking} className="menu-icon" />
                <span>Productos</span>
              </Link>
              <Link to="/caja" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faCashRegister} className="menu-icon" />
                <span>Caja</span>
              </Link>
            </div>
          )}

          {/* Common Items */}
          <div className="menu-section">
            <Link to="/perfil" className="menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              <FontAwesomeIcon icon={faCog} className="menu-icon" />
              <span>Perfil</span>
            </Link>

            <button onClick={handleLogout} className="menu-item">
              <FontAwesomeIcon icon={faSignOutAlt} className="menu-icon" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavDashboard;