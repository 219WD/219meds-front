import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faUserDoctor, faRocket } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../store/authStore";
import "./css/Hero.css";
import Medico from "../assets/medico.png";
import BlurText from "./BlurText";

const Hero = () => {
  const { user } = useAuthStore();
  const headlineRef = useRef(null);
  const ctaRef = useRef(null);
  const cardsRef = useRef([]);
  const subtitleRef = useRef(null);
  const descriptionRef = useRef(null);
  const particlesRef = useRef(null);
  
  cardsRef.current = [];

  const addCardRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const handleTitleAnimationComplete = () => {
    console.log('Título animado completamente!');
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(subtitleRef.current, { y: 20, opacity: 0, duration: 0.8 })
      .from(descriptionRef.current, { y: 20, opacity: 0, duration: 0.8 }, "-=0.4")
      .from(
        cardsRef.current,
        {
          opacity: 0,
          y: 60,
          stagger: 0.2,
          duration: 1.2,
        },
        "-=0.4"
      )
      .from(ctaRef.current, { y: 30, opacity: 0, duration: 0.8 }, "-=0.6");

    // Animación de partículas
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      gsap.fromTo(particles, 
        { y: 0, opacity: 0 },
        {
          y: -100,
          opacity: 1,
          duration: 3,
          stagger: 0.1,
          repeat: -1,
          ease: "none"
        }
      );
    }

    // floating animation para las tarjetas
    cardsRef.current.forEach((card, i) => {
      gsap.to(card, {
        y: "+=20",
        duration: 3 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.3,
      });
    });
  }, []);

  return (
    <section className="hero-escena">
      {/* Partículas flotantes */}
      <div className="particles-container" ref={particlesRef}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="hero-content">
        <h5 ref={subtitleRef} className="hero-badge">
          <FontAwesomeIcon icon={faRocket} className="badge-icon" />
          <span>La nueva era de la atención médica</span>
        </h5>
        
        {/* Título con efecto blur manteniendo los colores */}
        <div ref={headlineRef}>
          <BlurText
            delay={80}
            direction="top"
            onAnimationComplete={handleTitleAnimationComplete}
            duration={0.4}
            animationFrom={{ filter: 'blur(12px)', opacity: 0, y: 20 }}
            animationTo={[
              { filter: 'blur(6px)', opacity: 0.7, y: 5 },
              { filter: 'blur(0px)', opacity: 1, y: 0 }
            ]}
            className="hero-escena-title"
          >
            <span>Plataforma médica </span>
            <span className="title-gradient">inteligente</span>
            <span> para una atención </span>
            <span className="title-gradient">sin límites</span>
          </BlurText>
        </div>
        
        <p ref={descriptionRef} className="hero-description">
          Gestioná pacientes, turnos y tratamientos en una sola plataforma.<br />
          Tecnología médica que simplifica tu día a día, mejora la experiencia de tus pacientes<br />
          y potencia la productividad de tu equipo.
        </p>

        <div ref={ctaRef} className="hero-escena-cta">
          {user ? (
            <Link to="/perfil" className="btn-escena">
              <FontAwesomeIcon icon={faUserDoctor} />
              <span>Ir a mi panel</span>
              <FontAwesomeIcon icon={faArrowRight} className="arrow" />
            </Link>
          ) : (
            <Link to="/register" className="btn-escena">
              <FontAwesomeIcon icon={faUserDoctor} />
              <span>Comenzar ahora</span>
              <FontAwesomeIcon icon={faArrowRight} className="arrow" />
            </Link>
          )}
        </div>
      </div>

      <div className="escena-container">
        <div className="orb-background"></div>

        {/* Cards originales con el nuevo efecto 3D en hover */}
        <div className="floating-card" ref={addCardRef}>
          <h3>📅 Turnos Inteligentes</h3>
          <p>Gestioná y automatizá tus citas sin esfuerzo.</p>
        </div>

        <div className="floating-card" ref={addCardRef}>
          <h3>🩺 Historia Clínica</h3>
          <p>Accedé a la información completa de cada paciente en segundos.</p>
        </div>

        <div className="floating-card" ref={addCardRef}>
          <h3>💬 Comunicación Segura</h3>
          <p>Conectá pacientes y médicos en tiempo real.</p>
        </div>

        <div className="floating-card" ref={addCardRef}>
          <h3>📊 Panel de Datos</h3>
          <p>Decisiones clínicas respaldadas por datos.</p>
        </div>
      </div>

      <img className="img-hero" src={Medico} alt="" />
    </section>
  );
};

export default Hero;