import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faShieldAlt,
  faCheckCircle,
  faMobileAlt,
  faStethoscope,
  faTooth,
  faSmile,
  faAppleAlt,
  faUserMd,
  faRunning,
  faUsers,
  faBox,
  faFileInvoice,
  faChartBar
} from "@fortawesome/free-solid-svg-icons";
import gsap from 'gsap';
import './css/FinalSection.css';

const FinalSection = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const particlesRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo(cardsRef.current,
      { y: 60, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)'
      },
      '-=0.4'
    );

    // Animación de partículas
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      gsap.fromTo(particles, 
        { y: 0, opacity: 0, rotation: 0 },
        {
          y: -120,
          opacity: 0.7,
          rotation: 180,
          duration: 7,
          stagger: 0.2,
          repeat: -1,
          ease: "none"
        }
      );
    }

  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const specialties = [
    { icon: faStethoscope, name: 'Dermatología', color: '#5B5BFB' },
    { icon: faTooth, name: 'Odontología', color: '#1860b0' },
    { icon: faSmile, name: 'Estética', color: '#0a2e5c' },
    { icon: faAppleAlt, name: 'Nutrición', color: '#5B5BFB' },
    { icon: faUserMd, name: 'Clínica general', color: '#1860b0' },
    { icon: faRunning, name: 'Kinesiología', color: '#0a2e5c' }
  ];

  const features = [
    {
      icon: faTrophy,
      title: 'Ideal para:',
      items: specialties,
      color: '#5B5BFB'
    },
    {
      icon: faShieldAlt,
      title: 'Seguridad y control total',
      items: [
        { icon: faUsers, text: 'Accesos por rol (médico, secretaria, administrador)' },
        { icon: faBox, text: 'Control de stock con alertas de vencimiento' },
        { icon: faFileInvoice, text: 'Vencimiento de matrículas de profesionales y tratamientos' },
        { icon: faChartBar, text: 'Reportes automáticos para tener siempre el pulso de tu negocio' }
      ],
      color: '#1860b0'
    },
    {
      icon: faCheckCircle,
      title: 'En resumen',
      items: [
        { text: 'Gestión integral de turnos, pacientes y productos' },
        { text: 'E-commerce integrado para vender más' },
        { text: 'Control de stock y vencimientos' },
        { text: 'Plataforma segura y fácil de usar' },
        { text: 'Todo en un solo sistema' }
      ],
      color: '#0a2e5c'
    }
  ];

  return (
    <section className="final-section" ref={containerRef}>
      {/* Partículas */}
      <div className="final-particles" ref={particlesRef}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="final-particle">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        ))}
      </div>

      <div className="final-container">
        {/* Background Elements */}
        <div className="final-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>

        {/* Header */}
        <div className="final-header">
          <h2 className="final-title" ref={titleRef}>
            La plataforma completa para{' '}
            <span className="title-gradient">tu consultorio médico</span>
          </h2>
          
          <p className="final-subtitle">
            Todo lo que necesitás para gestionar y hacer crecer tu práctica médica en un solo lugar
          </p>
        </div>

        {/* Features Grid */}
        <div className="final-features">
          {features.map((feature, index) => (
            <div
              key={index}
              className="final-feature"
              ref={addToRefs}
              style={{ '--accent-color': feature.color }}
            >
              <div className="feature-header">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon-bg"></div>
                  <FontAwesomeIcon 
                    icon={feature.icon} 
                    className="feature-icon"
                  />
                </div>
                
                <div className="feature-titles">
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
              </div>
              
              <div className="feature-content">
                {feature.title === 'Ideal para:' ? (
                  <div className="specialties-grid">
                    {feature.items.map((specialty, specialtyIndex) => (
                      <div key={specialtyIndex} className="specialty-item">
                        <FontAwesomeIcon 
                          icon={specialty.icon} 
                          className="specialty-icon"
                          style={{ color: specialty.color }}
                        />
                        <span>{specialty.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="feature-items">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="feature-item">
                        {item.icon ? (
                          <FontAwesomeIcon 
                            icon={item.icon} 
                            className="item-icon"
                            style={{ color: feature.color }}
                          />
                        ) : (
                          <FontAwesomeIcon 
                            icon={faCheckCircle} 
                            className="item-icon"
                            style={{ color: '#10b981' }}
                          />
                        )}
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA Section */}
        <div className="final-cta-section">
          <div className="cta-content">
            <FontAwesomeIcon icon={faMobileAlt} className="cta-main-icon" />
            <h3 className="cta-title">Transformá tu consultorio hoy</h3>
            <p className="cta-description">
              Más tiempo para tus pacientes. Menos tiempo perdido en tareas administrativas.
            </p>
            <p className="cta-brand">
              <strong>219Meds</strong> — la herramienta que hace crecer tu consultorio.
            </p>
            <button className="cta-button-large">
              <span>Agendá tu demo gratuita</span>
              <div className="cta-arrow">→</div>
            </button>
            <p className="cta-note">
              Descubrí cómo trabajás mejor cuando todo está conectado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalSection;