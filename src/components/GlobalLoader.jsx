import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import useLoadingStore from "../store/loadingStore";

const GlobalLoader = ({ text = "Cargando..." }) => {
  const isLoading = useLoadingStore((state) => state.isLoading);
  const loaderRef = useRef(null);
  const particlesRef = useRef([]);
  const textRef = useRef(null);
  const logoRef = useRef(null);

  // Crear partículas para el loader
  useEffect(() => {
    if (!isLoading) return;

    const createParticles = () => {
      const particles = [];
      const container = loaderRef.current;
      
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'loader-particle';
        particle.style.width = `${Math.random() * 6 + 4}px`;
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 60 + 200}, 100%, 65%)`;
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        particles.push(particle);
        container.appendChild(particle);
      }
      
      return particles;
    };

    particlesRef.current = createParticles();

    return () => {
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [isLoading]);

  // Animaciones GSAP
  useEffect(() => {
    if (!isLoading || !loaderRef.current) return;

    const tl = gsap.timeline();

    // Animación de entrada
    tl.fromTo(loaderRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    )
    .fromTo(logoRef.current,
      { 
        scale: 0,
        rotation: -180,
        opacity: 0 
      },
      { 
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1, 0.8)"
      },
      "-=0.2"
    )
    .fromTo(textRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.5)" },
      "-=0.5"
    )
    .fromTo(particlesRef.current,
      {
        scale: 0,
        x: () => Math.random() * 100 - 50,
        y: () => Math.random() * 100 - 50
      },
      {
        scale: 1,
        x: 0,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "elastic.out(1, 0.5)"
      },
      "-=0.8"
    );

    // Animación continua de las partículas
    const particleAnimation = gsap.to(particlesRef.current, {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: "none",
      stagger: {
        each: 0.2,
        from: "center"
      }
    });

    // Animación del logo (pulso sutil)
    const logoPulse = gsap.to(logoRef.current, {
      scale: 1.05,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Animación del texto (efecto brillo)
    const textGlow = gsap.to(textRef.current, {
      textShadow: "0 0 20px rgba(91, 91, 251, 0.8)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      particleAnimation.kill();
      logoPulse.kill();
      textGlow.kill();
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      ref={loaderRef}
      className="global-loader"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.95) 0%, rgba(24, 96, 176, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        fontFamily: '"Archivo", sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Partículas de fondo */}
      <div 
        className="loader-bg-particles"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 80%, rgba(91, 91, 251, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(24, 96, 176, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(10, 185, 129, 0.05) 0%, transparent 50%)
          `
        }}
      />
      
      <div 
        className="loader-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Logo animado */}
        <div 
          ref={logoRef}
          className="loader-logo"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #5B5BFB, #1860b0)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              0 0 40px rgba(91, 91, 251, 0.4),
              0 0 80px rgba(91, 91, 251, 0.2),
              inset 0 2px 10px rgba(255, 255, 255, 0.1)
            `,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Elemento interno del logo */}
          <div 
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '10px',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
            }}
          />
          
          {/* Efecto de brillo interno */}
          <div 
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              transform: 'rotate(45deg)',
              animation: 'shimmer 3s infinite linear'
            }}
          />
        </div>

        {/* Texto */}
        <div 
          ref={textRef}
          className="loader-text"
          style={{
            color: '#ffffff',
            fontSize: '1.2rem',
            fontWeight: '600',
            letterSpacing: '1px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff, #a0a0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            padding: '10px 20px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          {text}
        </div>

        {/* Barra de progreso sutil */}
        <div 
          className="loader-progress"
          style={{
            width: '200px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '30%',
              background: 'linear-gradient(90deg, #5B5BFB, #10b981)',
              borderRadius: '2px',
              animation: 'progressMove 2s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        @keyframes progressMove {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(250%); }
          100% { transform: translateX(-100%); }
        }
        
        .loader-particle {
          animation: float 4s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoader;