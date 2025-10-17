import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faMusic,
  faCouch,
} from "@fortawesome/free-solid-svg-icons";
import "./css/AfterOffice.css";
import afterOffice1 from "../assets/club-after-office.jpg";
import afterOffice2 from "../assets/club-after-office2.jpg";
import afterOffice3 from "../assets/club-after-office3.jpg";
import afterOffice4 from "../assets/club-after-office4.jpg";
const AfterOfficeSection = () => {
  return (
    <section className="after-office-section">
      <div className="after-office-container">
        <div className="after-office-content">
          <div className="after-office-images">
            <div className="image-grid">
              <div className="image-row">
                <div className="image-item">
                  <img src={afterOffice1} alt="After Office - Ambiente 1" />
                  <div className="image-overlay"></div>
                </div>
                <div className="image-item">
                  <img src={afterOffice2} alt="After Office - Ambiente 2" />
                  <div className="image-overlay"></div>
                </div>
              </div>
              <div className="image-row">
                <div className="image-item">
                  <img src={afterOffice3} alt="After Office - Ambiente 3" />
                  <div className="image-overlay"></div>
                </div>
                <div className="image-item">
                  <img src={afterOffice4} alt="After Office - Ambiente 4" />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="after-office-info">
            <h2 className="section-title">
              <span className="title-line accent">After Office</span>
              <span className="title-line">Viernes Especial</span>
            </h2>

            <div className="schedule-info">
              <div className="schedule-item">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="schedule-icon"
                />
                <span>Todos los Viernes</span>
              </div>
              <div className="schedule-item">
                <FontAwesomeIcon icon={faClock} className="schedule-icon" />
                <span>18:00 - 22:00 hs</span>
              </div>
            </div>

            <p className="after-office-description">
              Terminá la semana con la mejor energía en nuestro After Office
              especial. Disfrutá de un ambiente único con música, bebidas
              exclusivas y la mejor compañía.
            </p>

            <div className="features-grid">
              <div className="feature-item">
                <FontAwesomeIcon icon={faMusic} className="feature-icon" />
                <h4>Música en Vivo</h4>
                <p>DJ y artistas locales</p>
              </div>
              <div className="feature-item">
                <FontAwesomeIcon icon={faCouch} className="feature-icon" />
                <h4>Zona Relax</h4>
                <p>Un lugar para desconectarte y pasarla bien.</p>
              </div>
            </div>

            <button className="cta-button after-office-cta">
              Reservar tu lugar
              <FontAwesomeIcon icon={faCalendarAlt} className="cta-icon" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AfterOfficeSection;
