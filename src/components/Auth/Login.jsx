import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import withGlobalLoader from "../../utils/withGlobalLoader";
import ForgotPasswordModal from "../ForgotPasswordModal";
import API_URL from "../../common/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Referencias para GSAP
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const formContainerRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const emailGroupRef = useRef(null);
  const passwordGroupRef = useRef(null);
  const forgotRef = useRef(null);
  const buttonRef = useRef(null);
  const signinRef = useRef(null);
  const errorRef = useRef(null);
  const particlesRef = useRef([]);
  const passwordInputRef = useRef(null);

  // Función para el efecto hacker
  const togglePasswordVisibility = () => {
    if (!password) return; // Si no hay contraseña, no hacer nada

    const input = passwordInputRef.current;
    const originalType = input.type;
    const originalValue = password;

    // Efecto de decodificación hacker
    if (!showPassword) {
      // Mostrando la contraseña - efecto de decodificación
      input.type = "text";

      // Crear efecto de texto aleatorio
      let iterations = 0;
      const maxIterations = 8;
      const characters =
        "01!@#$%&*abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

      const interval = setInterval(() => {
        const randomText = Array.from(
          { length: originalValue.length },
          () => characters[Math.floor(Math.random() * characters.length)]
        ).join("");

        setPassword(randomText);
        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(interval);
          setPassword(originalValue);
          // Pequeña animación final
          gsap.fromTo(
            input,
            { scale: 1.02 },
            { scale: 1, duration: 0.1, ease: "power2.out" }
          );
        }
      }, 40); // Muy rápido - 40ms por iteración
    } else {
      // Ocultando la contraseña - efecto más simple
      input.type = "password";
      gsap.fromTo(
        input,
        { scale: 0.98 },
        { scale: 1, duration: 0.1, ease: "power2.out" }
      );
    }

    setShowPassword(!showPassword);
  };

  // Crear partículas
  useEffect(() => {
    const createParticles = () => {
      const particles = [];
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement("div");
        particle.className = "auth-hero-particle";
        particle.style.width = `${Math.random() * 8 + 4}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.6 + 0.2;
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particles.push(particle);
      }
      return particles;
    };

    if (containerRef.current) {
      const heroSide = containerRef.current.querySelector(".auth-hero-side");
      const particles = createParticles();
      particles.forEach((particle) => heroSide.appendChild(particle));
      particlesRef.current = particles;
    }
  }, []);

  // Animación principal con GSAP
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animación del contenedor principal
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 }
    )
      // Animación del lado hero
      .fromTo(
        heroContentRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" },
        "-=0.3"
      )
      // Animación de partículas
      .fromTo(
        particlesRef.current,
        { scale: 0, rotation: 0 },
        {
          scale: 1,
          rotation: 360,
          duration: 0.7,
          stagger: 0.1,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.8"
      )
      // Animación del formulario
      .fromTo(
        formContainerRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" },
        "-=1"
      )
      // Animación en cascada de los elementos del formulario
      .fromTo(
        logoRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        "-=0.5"
      )
      .fromTo(
        titleRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        "-=0.4"
      )
      .fromTo(
        subtitleRef.current,
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2 },
        "-=0.3"
      )
      .fromTo(
        [emailGroupRef.current, passwordGroupRef.current],
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.15,
          ease: "back.out(1.3)",
        },
        "-=0.2"
      )
      .fromTo(
        forgotRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2 },
        "-=0.3"
      )
      .fromTo(
        buttonRef.current,
        { y: 25, opacity: 0, scale: 0.4 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "elastic.out(1, 0.8)",
        },
        "-=0.2"
      )
      .fromTo(
        signinRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        "-=0.3"
      );
  }, []);

  // Animación para errores
  useEffect(() => {
    if (error && errorRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        errorRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        }
      );
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Animación del botón
    if (buttonRef.current) {
      const tl = gsap.timeline();
      tl.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.in",
      }).to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "elastic.out(1, 0.5)",
      });
    }

    try {
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/login/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login fallido");
        }

        login(data.token, data.user);

        // Animación de éxito
        const tl = gsap.timeline();
        tl.to(formContainerRef.current, {
          y: -50,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
        }).to(
          heroContentRef.current,
          {
            x: -100,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => {
              if (data.user.isAdmin) {
                navigate("/admin");
              } else if (data.user.isPartner) {
                navigate("/");
              } else {
                navigate("/solicitud");
              }
            },
          },
          "-=0.3"
        );
      });
    } catch (err) {
      setError(err.message);
      // Animación de error
      if (formContainerRef.current) {
        gsap.to(formContainerRef.current, {
          x: 10,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
          ease: "power1.inOut",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container" ref={containerRef}>
      {/* Lado izquierdo - Hero */}
      <div className="auth-hero-side">
        <div className="auth-hero-particles" />
        <div className="auth-hero-content" ref={heroContentRef}>
          <h1 className="auth-hero-title">Bienvenido de vuelta</h1>
          <p className="auth-hero-subtitle">
            Accedé a tu consultorio médico y continuá transformando la
            experiencia de tus pacientes
          </p>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="auth-form-side">
        <div className="auth-form-container" ref={formContainerRef}>
          <div className="auth-form-logo" ref={logoRef}>
            <div className="auth-logo-text">219Meds</div>
          </div>

          <h2 className="auth-form-title" ref={titleRef}>
            Iniciar Sesión
          </h2>
          <p className="auth-form-subtitle" ref={subtitleRef}>
            Ingresá a tu cuenta para gestionar tu consultorio
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group" ref={emailGroupRef}>
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="auth-input-icon"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="auth-input-group" ref={passwordGroupRef}>
              <label htmlFor="password">Contraseña</label>
              <div className="auth-input-wrapper">
                <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                <input
                  ref={passwordInputRef}
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={!password || isSubmitting}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="auth-eye-icon"
                  />
                </button>
              </div>
            </div>

            <div className="auth-forgot" ref={forgotRef}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isSubmitting) setShowForgotModal(true);
                }}
                style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              className={`auth-sign-btn ${isSubmitting ? "auth-loading" : ""}`}
              type="submit"
              ref={buttonRef}
              disabled={isSubmitting}
            >
              {isSubmitting ? "" : "Iniciar Sesión"}
            </button>

            {error && (
              <p className="auth-error" ref={errorRef}>
                {error}
              </p>
            )}

            <p className="auth-signin" ref={signinRef}>
              ¿No tenés una cuenta?
              <Link
                to="/register"
                style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
              >
                Registrate
              </Link>
            </p>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Login;
