import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "./css/Solicitud.css";
import API_URL from "../common/constants";

const Solicitud = () => {
  const [adress, setAdress] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Acceso correcto al estado
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const name = user?.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Verificamos user.id (no user._id) porque así viene del backend
    if (!user?.id) {
      setError("No se pudo obtener la información del usuario");
      console.error("El usuario no tiene ID:", user);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/partners/createPartner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,  // Usamos user.id (no user._id)
          adress,
          phone,
          dni,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error del servidor:", data);
        throw new Error(data.error || "Error al enviar solicitud");
      }

      navigate("/pendiente");
    } catch (err) {
      console.error("Error en la solicitud:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="solicitud-split-container">
      {/* Lado izquierdo - Hero */}
      <div className="solicitud-hero-side">
        <div className="solicitud-hero-content">
          <h1 className="solicitud-hero-title">
            Únete a Nuestra Comunidad
          </h1>
          <p className="solicitud-hero-subtitle">
            Completa tu perfil para acceder a consultas médicas especializadas, seguimiento personalizado y todos los beneficios de nuestro programa de salud integral.
          </p>
          <div className="solicitud-hero-features">
            <div className="solicitud-feature">
              <div className="solicitud-feature-icon">👨‍⚕️</div>
              <span>Consultas médicas especializadas</span>
            </div>
            <div className="solicitud-feature">
              <div className="solicitud-feature-icon">📱</div>
              <span>Seguimiento personalizado</span>
            </div>
            <div className="solicitud-feature">
              <div className="solicitud-feature-icon">🛡️</div>
              <span>Atención integral y confidencial</span>
            </div>
          </div>
        </div>
        
        {/* Partículas decorativas */}
        <div className="solicitud-hero-particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="solicitud-hero-particle"
              style={{
                width: `${Math.random() * 25 + 8}px`,
                height: `${Math.random() * 25 + 8}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 15 + 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="solicitud-form-side">
        <div className="solicitud-form-container">
          {/* Título del formulario - SIN ANIMACIÓN PARA VISIBILIDAD INMEDIATA */}
          <div className="solicitud-form-header">
            <h2 className="solicitud-form-title">Completar Perfil</h2>
            <p className="solicitud-form-subtitle">
              Necesitamos algunos datos adicionales para personalizar tu experiencia
            </p>
          </div>

          {/* Información del usuario */}
          {name && (
            <div className="solicitud-user-info">
              <p className="solicitud-user-welcome">
                Hola, <strong>{name}</strong>
              </p>
              <p className="solicitud-user-email">
                {user?.email}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form className="solicitud-form" onSubmit={handleSubmit}>
            {/* Dirección */}
            <div className="solicitud-input-group">
              <label htmlFor="adress" className="solicitud-input-label">
                Dirección Completa
              </label>
              <div className="solicitud-input-wrapper">
                <input
                  id="adress"
                  type="text"
                  value={adress}
                  onChange={(e) => setAdress(e.target.value)}
                  required
                  placeholder="Ingresa tu dirección completa"
                  className="solicitud-input"
                />
                <div className="solicitud-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="solicitud-input-group">
              <label htmlFor="phone" className="solicitud-input-label">
                Teléfono de Contacto
              </label>
              <div className="solicitud-input-wrapper">
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Ingresa tu número de teléfono"
                  className="solicitud-input"
                />
                <div className="solicitud-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* DNI */}
            <div className="solicitud-input-group">
              <label htmlFor="dni" className="solicitud-input-label">
                Documento de Identidad
              </label>
              <div className="solicitud-input-wrapper">
                <input
                  id="dni"
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                  placeholder="Ingresa tu número de DNI"
                  className="solicitud-input"
                />
                <div className="solicitud-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <button 
              type="submit" 
              className={`solicitud-submit-btn ${isLoading ? 'solicitud-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="solicitud-loading-indicator">
                  Procesando Solicitud...
                </span>
              ) : (
                'Completar Registro'
              )}
            </button>

            {/* Mensaje de error */}
            {error && (
              <div className="solicitud-error-message">
                {error}
              </div>
            )}
          </form>

          {/* Información adicional */}
          <div className="solicitud-additional-info">
            <p>
              <strong>Tu privacidad es importante:</strong> Toda la información proporcionada está protegida y será utilizada exclusivamente para brindarte el mejor servicio médico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solicitud;