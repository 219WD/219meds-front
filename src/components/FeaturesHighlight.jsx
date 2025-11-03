import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faFileMedical,
  faBell,
  faBoxes,
  faCashRegister,
  faClock,
  faRocket,
  faChartLine // Icono agregado para la nueva card
} from "@fortawesome/free-solid-svg-icons";
import gsap from 'gsap';
import './css/FeaturesHighlight.css';

const FeaturesHighlight = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const featuresRef = useRef([]);

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
    .fromTo(subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(featuresRef.current,
      { y: 60, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)'
      },
      '-=0.3'
    );

  }, []);

  const addToRefs = (el) => {
    if (el && !featuresRef.current.includes(el)) {
      featuresRef.current.push(el);
    }
  };

  // Función para enviar WhatsApp
  const sendWhatsApp = () => {
    const phoneNumber = '3816671884';
    const message = 'Quiero empezar a ahorrar tiempo con 219Meds';
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear el enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir en una nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  const features = [
    {
      icon: faCalendarAlt,
      title: 'Agenda Digital Inteligente',
      description: 'Creá, modificá y organizá turnos desde cualquier dispositivo.',
      color: '#5858FB'
    },
    {
      icon: faFileMedical,
      title: 'Historias Clínicas Online',
      description: 'Acceso rápido y seguro a toda la información de tus pacientes.',
      color: '#1860b0'
    },
    {
      icon: faBell,
      title: 'Gestión de Pacientes',
      description: 'Alertas automáticas por vencimiento de tratamientos, próximas citas, etc.',
      color: '#0a2e5c'
    },
    {
      icon: faBoxes,
      title: 'Control de Stock',
      description: 'Sabés exactamente qué productos tenés, cuánto vendiste y cuándo reponer.',
      color: '#5858FB'
    },
    {
      icon: faCashRegister,
      title: 'Sistema de Ventas Integrado',
      description: 'Vendé cremas, medicamentos o servicios directamente desde la plataforma.',
      color: '#1860b0'
    },
    // NUEVA CARD AGREGADA
    {
      icon: faChartLine,
      title: 'Reportes y Analytics',
      description: 'Métricas detalladas de tu consultorio para tomar mejores decisiones.',
      color: '#0a2e5c'
    }
  ];

  return (
    <section className="medical-platform" ref={containerRef}>
      <div className="platform-container">
        {/* Background Elements */}
        <div className="platform-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
          <div className="bg-grid"></div>
        </div>

        {/* Header */}
        <div className="platform-header">
          <div className="platform-badge"> 
            <FontAwesomeIcon icon={faClock} className="badge-icon-secondary" />
            <span>Transformá tu tiempo, potenciá tu práctica</span>
          </div>
          
          <h1 className="platform-title" ref={titleRef}>
            Lo que antes te llevaba <span className="title-gradient">horas</span>...<br />
            ahora lo hacés en <span className="title-gradient">minutos</span>
          </h1>
          
          <p className="platform-subtitle" ref={subtitleRef}>
            Todo lo que necesitás para gestionar tu consultorio en un solo lugar
          </p>
          
          <p className="platform-description">
            Automatizá tareas repetitivas, centralizá la información de tus pacientes y<br />
            dedicá más tiempo a lo que realmente importa: la atención médica de calidad.
          </p>
        </div>

        {/* Features Grid */}
        <div className="platform-features">
          {features.map((feature, index) => (
            <div
              key={index}
              className="platform-feature"
              ref={addToRefs}
              style={{ '--accent-color': feature.color }}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon-bg"></div>
                <FontAwesomeIcon 
                  icon={feature.icon} 
                  className="feature-icon"
                />
              </div>
              
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
              
              <div className="feature-connector"></div>
            </div>
          ))}
        </div>

        {/* CTA Section - ACTUALIZADO */}
        <div className="platform-cta">
          <button 
            className="cta-button-secondary"
            onClick={sendWhatsApp}
          >
            <span>Empezar a ahorrar tiempo ahora</span>
            <div className="cta-arrow">→</div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesHighlight;