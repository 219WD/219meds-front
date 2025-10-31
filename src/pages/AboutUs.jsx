import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faLightbulb,
  faRocket,
  faUsers,
  faShieldAlt,
  faCogs,
  faChartBar,
  faMobileAlt,
  faCloud,
  faHandshake,
  faMagic,
  faInfinity,
  faCheckCircle // ESTE FALTABA IMPORTAR
} from "@fortawesome/free-solid-svg-icons";
import gsap from 'gsap';
import './AboutUs.css';
import Footer from '../components/Footer';

const AboutUs = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const missionRef = useRef(null);
  const servicesRef = useRef([]);
  const statsRef = useRef([]);

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
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo(subtitleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo(missionRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(servicesRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)'
      },
      '-=0.3'
    )
    .fromTo(statsRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      },
      '-=0.2'
    );

  }, []);

  const addToServicesRefs = (el) => {
    if (el && !servicesRef.current.includes(el)) {
      servicesRef.current.push(el);
    }
  };

  const addToStatsRefs = (el) => {
    if (el && !statsRef.current.includes(el)) {
      statsRef.current.push(el);
    }
  };

  const services = [
    {
      icon: faUsers,
      title: 'Gestión Integral de Pacientes',
      description: 'Sistema completo de historias clínicas, turnos, tratamientos y seguimiento médico continuo.',
      features: ['Historial médico digital', 'Fichas personalizadas', 'Alertas automáticas', 'Comunicación directa']
    },
    {
      icon: faCogs,
      title: 'Automatización de Procesos',
      description: 'Eliminá tareas repetitivas y optimizá el flujo de trabajo de tu consultorio.',
      features: ['Turnos automáticos', 'Recordatorios inteligentes', 'Facturación integrada', 'Backups automáticos']
    },
    {
      icon: faChartBar,
      title: 'Analíticas Avanzadas',
      description: 'Métricas detalladas para tomar decisiones basadas en datos reales de tu práctica.',
      features: ['Dashboard interactivo', 'Reportes personalizados', 'KPIs de rendimiento', 'Tendencias del consultorio']
    },
    {
      icon: faMobileAlt,
      title: 'E-commerce Médico',
      description: 'Vendé productos, servicios y tratamientos directamente desde tu plataforma.',
      features: ['Catálogo digital', 'Pagos online', 'Stock inteligente', 'Ventas cruzadas']
    },
    {
      icon: faCloud,
      title: 'Plataforma Cloud',
      description: 'Acceso seguro desde cualquier dispositivo, en cualquier momento y lugar.',
      features: ['Sincronización en tiempo real', 'Acceso multiplataforma', 'Escalabilidad automática', 'Zero downtime']
    },
    {
      icon: faShieldAlt,
      title: 'Seguridad HIPAA Compliant',
      description: 'Protección de datos médicos con los más altos estándares de seguridad.',
      features: ['Encriptación end-to-end', 'Backups seguros', 'Accesos controlados', 'Auditoría completa']
    }
  ];

  const stats = [
    { number: '500+', label: 'Consultorios Transformados' },
    { number: '85%', label: 'Reducción Tiempo Admin' },
    { number: '40%', label: 'Aumento Ingresos' },
    { number: '99.9%', label: 'Uptime Garantizado' }
  ];

  return (
    <section className="about-us-section" ref={containerRef}>
      <div className="about-us-container">
        {/* Background Elements */}
        <div className="about-bg-elements">
          <div className="bg-orb orb-1"></div>
          <div className="bg-orb orb-2"></div>
          <div className="bg-orb orb-3"></div>
          <div className="floating-code">{'</>'}</div>
          <div className="circuit-pattern"></div>
        </div>

        {/* Header */}
        <div className="about-header">
          <div className="about-badge">
            <FontAwesomeIcon icon={faCode} className="badge-icon" />
            <span>Desarrollo de Software a Medida</span>
          </div>
          
          <h1 className="about-title" ref={titleRef}>
            De desarrolladores a{' '}
            <span className="title-gradient">transformadores</span> de consultorios
          </h1>
          
          <p className="about-subtitle" ref={subtitleRef}>
            Creamos 219Meds cuando descubrimos que podíamos simplificar 
            <strong> radicalmente</strong> la vida de los profesionales de la salud
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mission-section" ref={missionRef}>
          <div className="mission-content">
            <div className="mission-icon">
              <FontAwesomeIcon icon={faLightbulb} />
            </div>
            <div className="mission-text">
              <h2>Nuestra Misión</h2>
              <p>
                Como empresa de desarrollo de software, identificamos que los dueños de clínicas y consultorios 
                perdían <strong>horas valiosas</strong> en tareas administrativas repetitivas. Decidimos crear 
                un ecosistema completo que unifique <strong>turnos, pacientes, especialistas, productos y analíticas </strong> 
                en una interfaz única e intuitiva.
              </p>
              <p>
                No solo desarrollamos software - <strong>resolvemos problemas reales</strong> y liberamos tiempo 
                para que los profesionales se enfoquen en lo que realmente importa: la atención médica de calidad.
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-section">
          <div className="services-header">
            <FontAwesomeIcon icon={faRocket} className="section-icon" />
            <h2>Todo lo que necesitás, en un solo lugar</h2>
            <p>Diseñamos cada función pensando en simplificar tu día a día</p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card"
                ref={addToServicesRefs}
              >
                <div className="service-icon-wrapper">
                  <div className="service-icon-bg"></div>
                  <FontAwesomeIcon 
                    icon={service.icon} 
                    className="service-icon"
                  />
                </div>
                
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                  
                  <ul className="service-features">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="service-feature">
                        <FontAwesomeIcon icon={faCheckCircle} className="feature-check" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="service-glow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-item"
              ref={addToStatsRefs}
            >
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="value-section">
          <div className="value-content">
            <div className="value-icon">
              <FontAwesomeIcon icon={faMagic} />
            </div>
            <h2>Más que software, una revolución en tu consultorio</h2>
            <p>
              Integramos <strong>tecnología de punta</strong> con <strong>conocimiento médico</strong> para crear 
              herramientas que realmente funcionan. Desde la agenda digital hasta el e-commerce médico, 
              cada feature fue pensado para <strong>ahorrarte tiempo y aumentar tu productividad</strong>.
            </p>
            <div className="value-highlights">
              <div className="value-highlight">
                <FontAwesomeIcon icon={faInfinity} />
                <span>Escalable y adaptable</span>
              </div>
              <div className="value-highlight">
                <FontAwesomeIcon icon={faHandshake} />
                <span>Soporte personalizado</span>
              </div>
              <div className="value-highlight">
                <FontAwesomeIcon icon={faRocket} />
                <span>Implementación rápida</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="about-cta">
          <button className="cta-button-primary">
            <FontAwesomeIcon icon={faCode} />
            <span>Conocé nuestra solución completa</span>
            <div className="cta-arrow">→</div>
          </button>
          <p className="cta-note">
            Desarrollo 100% personalizado • Integración sin complicaciones • Soporte técnico dedicado
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;