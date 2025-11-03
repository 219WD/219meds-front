import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faComments,
  faBrain,
  faCheckCircle,
  faStar,
  faCreditCard,
  faCalendarCheck,
  faShieldAlt,
  faPlus,
  faChartLine,
  faGlobe // Icono agregado para la nueva card
} from "@fortawesome/free-solid-svg-icons";
import gsap from 'gsap';
import './css/RevenueSection.css';

const RevenueSection = () => {
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
        stagger: 0.2,
        ease: 'back.out(1.4)'
      },
      '-=0.4'
    );

    // Animación de partículas con signos + MÁS VISIBLES
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      gsap.fromTo(particles, 
        { y: 0, opacity: 0, rotation: 0 },
        {
          y: -150,
          opacity: 0.8,
          rotation: 360,
          duration: 6,
          stagger: 0.3,
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
      icon: faStore,
      title: 'Consultorio + E-commerce = Más ingresos sin más esfuerzo',
      description: 'Transformá tu consultorio en un canal de venta directa:',
      items: [
        { icon: faCheckCircle, text: 'Vendé productos recomendados después de cada consulta' },
        { icon: faCreditCard, text: 'Activá pagos online con integración automática' },
        { icon: faCalendarCheck, text: 'Reservas y compras sin llamar ni esperar' }
      ],
      color: '#5B5BFB'
    },
    {
      icon: faComments,
      title: 'Lo que tus pacientes sienten también importa',
      description: 'Experiencia del paciente mejorada:',
      items: [
        { icon: faStar, text: 'Calificación de productos: obtené feedback real para saber qué funciona mejor' },
        { icon: faChartLine, text: 'Historial de compras y consultas para ofrecer un servicio más personalizado' },
        { icon: faComments, text: 'Comunicación clara y ordenada que genera confianza y fideliza' }
      ],
      color: '#1860b0'
    },
    {
      icon: faBrain,
      title: 'Diseñado para profesionales, no para técnicos',
      description: 'Simplicidad y eficiencia:',
      items: [
        { icon: faCheckCircle, text: 'No necesitás saber de tecnología. 219Meds fue creado para que cualquier médico, secretaria o equipo pueda usarlo sin curva de aprendizaje' },
        { icon: faShieldAlt, text: 'Desde la agenda hasta la caja: todo es simple, rápido y seguro' }
      ],
      color: '#0a2e5c'
    },
    // NUEVA CARD AGREGADA - LANDING PAGE INCLUIDA
    {
      icon: faGlobe,
      title: 'Landing Page Profesional Incluida',
      description: 'Tu consultorio visible 24/7 para que los pacientes encuentren todo lo que necesitan:',
      items: [
        { icon: faCheckCircle, text: 'Sitio web profesional listo para usar, sin costos adicionales' },
        { icon: faCalendarCheck, text: 'Turnos online las 24 horas desde cualquier dispositivo' },
        { icon: faStore, text: 'Catálogo de productos y servicios disponible para compra inmediata' },
        { icon: faShieldAlt, text: 'Registro seguro de pacientes con historial médico integrado' }
      ],
      color: '#5B5BFB'
    }
  ];

  return (
    <section className="revenue-section" ref={containerRef}>
      {/* Partículas con signos + MÁS VISIBLES */}
      <div className="plus-particles" ref={particlesRef}>
        {[...Array(20)].map((_, i) => ( // MÁS SIGNOS +
          <div key={i} className="plus-particle">
            <FontAwesomeIcon icon={faPlus} />
          </div>
        ))}
      </div>

      <div className="revenue-container">
        {/* Background Elements */}
        <div className="revenue-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>

        {/* Header */}
        <div className="revenue-header">
          <div className="revenue-badge">
            <FontAwesomeIcon icon={faStar} className="badge-icon" />
            <span>Potenciá tu práctica médica</span>
          </div>
          
          <h2 className="revenue-title" ref={titleRef}>
            Transformá tu consultorio en una{' '}
            <span className="title-gradient">experiencia completa</span>
          </h2>
          
          <p className="revenue-subtitle">
            Integrá gestión médica y ventas en una sola plataforma diseñada para el éxito de tu profesión
          </p>
        </div>

        {/* Features Grid */}
        <div className="revenue-features">
          {features.map((feature, index) => (
            <div
              key={index}
              className="revenue-feature"
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
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
              
              <ul className="feature-items">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="feature-item">
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className="item-icon"
                      style={{ color: feature.color }}
                    />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="revenue-stats">
          <div className="stat-card">
            <FontAwesomeIcon icon={faStore} className="stat-icon" />
            <div className="stat-content">
              <h4>+40%</h4>
              <p>Ingresos adicionales con venta de productos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <FontAwesomeIcon icon={faStar} className="stat-icon" />
            <div className="stat-content">
              <h4>4.8/5</h4>
              <p>Calificación promedio de pacientes</p>
            </div>
          </div>
          
          <div className="stat-card">
            <FontAwesomeIcon icon={faCalendarCheck} className="stat-icon" />
            <div className="stat-content">
              <h4>-60%</h4>
              <p>Tiempo en tareas administrativas</p>
            </div>
          </div>
        </div>

        {/* CTA Section - ACTUALIZADO */}
        <div className="revenue-cta">
          <button 
            className="cta-button-secondary"
            onClick={sendWhatsApp}
          >
            <span>Empezar a potenciar mi consultorio</span>
            <div className="cta-arrow">→</div>
          </button>
          <p className="cta-note">Sin contratos largos • Pagás una sola vez • Diseño 100% personalizado</p>
        </div>
      </div>
    </section>
  );
};

export default RevenueSection;