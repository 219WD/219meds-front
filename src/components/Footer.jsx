import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt, faPhone, faHeart, faRocket } from '@fortawesome/free-solid-svg-icons';
import './css/Footer.css';
import Logo from '../assets/219Meds.png';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Wave Divider */}
        <div className="footer-wave"></div>
        
        <div className="footer-content">
          {/* Main Footer Grid */}
          <div className="footer-grid">
            {/* Logo y Descripción */}
            <div className="footer-section">
              <div className="footer-brand">
                <div className="footer-logo">
                  <img
                    src={Logo}
                    alt="Legen Logo"
                    className="footer-image"
                  />
                </div>
                <p className="footer-text">
                  La nueva era de la atención médica digital
                </p>
                <p className="footer-mission">
                  Transformando la atención médica con tecnología innovadora al servicio de los profesionales de la salud.
                </p>
              </div>
            </div>

            {/* Enlaces de Navegación */}
            <div className="footer-section">
              <h3 className="footer-title">Navegación</h3>
              <ul className="footer-list">
                <li><Link to="/#hero" className="footer-link">Inicio</Link></li>
                <li><Link to="/#quienes-somos" className="footer-link">¿Quiénes somos?</Link></li>
                <li><Link to="/#nuestro-enfoque" className="footer-link">Nuestro enfoque</Link></li>
                <li><Link to="/#investigacion" className="footer-link">Investigación</Link></li>
              </ul>
            </div>

            {/* Servicios */}
            <div className="footer-section">
              <h3 className="footer-title">Servicios</h3>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Gestión de Turnos</a></li>
                <li><a href="#" className="footer-link">Historias Clínicas</a></li>
                <li><a href="#" className="footer-link">E-commerce Médico</a></li>
                <li><a href="#" className="footer-link">Control de Stock</a></li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="footer-section">
              <h3 className="footer-title">Contacto</h3>
              <div className="footer-contact-info">
                <div className="footer-contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                  <span>San Miguel de Tucumán, Tucumán • Argentina</span>
                </div>
                <div className="footer-contact-item">
                  <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                  <span>3816 67-1884</span>
                </div>
                <div className="footer-contact-item">
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                  <span>219meds.soporte@gmail.com</span>
                </div>
              </div>
              
              <div className="footer-social">
                <a href="https://www.instagram.com/219labs/" className="footer-social-icon" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://wa.me/543816671884?text=Hola%20219Meds!" className="footer-social-icon" aria-label="WhatsApp">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>
                <a href="#" className="footer-social-icon" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div className="footer-credits">
              <div className="footer-copy">
                © 2025 Hecho con <FontAwesomeIcon icon={faHeart} className="heart-icon" /> por 
                <span className="lab-text"> 219Labs</span> • Todos los Derechos Reservados
              </div>
              <div className="footer-badge">
                <FontAwesomeIcon icon={faRocket} />
                <span>Innovando en salud digital</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;