import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCalendarAlt,
  faStar as solidStar,
  faBox,
  faTag,
  faCalendarDay,
  faBell,
  faComments // 🔥 NUEVO: icono para reseñas
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const VerProductoModal = ({ producto, onClose, onViewReseñas }) => { // 🔥 NUEVO: añade onViewReseñas prop
  if (!producto) return null;

  // 🔥 Función para renderizar estrellas
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={solidStar} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={solidStar} color="#FFD700" style={{opacity: 0.5}} />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={regularStar} color="#FFD700" />);
    }

    return stars;
  };

  // 🔥 Función para formatear fecha
  const formatFecha = (fechaString) => {
    if (!fechaString) return "No especificada";
    return new Date(fechaString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🔥 Función para obtener estado de vencimiento
  const getEstadoVencimiento = () => {
    if (!producto.fechaVencimiento) {
      return { texto: "Sin vencimiento", clase: "sin-vencimiento", icono: null };
    }

    const estado = producto.estadoVencimiento;
    const dias = producto.diasHastaVencimiento;

    switch (estado) {
      case 'vencido':
        return { 
          texto: `Vencido hace ${Math.abs(dias)} días`, 
          clase: "vencido", 
          icono: faExclamationTriangle 
        };
      case 'proximo-a-vencer':
        return { 
          texto: `Vence en ${dias} días`, 
          clase: "proximo", 
          icono: faCalendarAlt 
        };
      case 'vigente':
        return { 
          texto: `Vence en ${dias} días`, 
          clase: "vigente", 
          icono: faCalendarAlt 
        };
      default:
        return { texto: "-", clase: "", icono: null };
    }
  };

  const estadoVencimiento = getEstadoVencimiento();

  return (
    <div className="modal-overlay">
      <div className="modal-container ver-producto-modal">
        <div className="modal-header">
          <h2>Detalles del Producto</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="producto-detalles">
            {/* Información Principal */}
            <div className="detalle-seccion">
              <div className="detalle-imagen">
                {producto.image && (
                  <img src={producto.image} alt={producto.title} />
                )}
              </div>
              
              <div className="detalle-info-principal">
                <h3>{producto.title}</h3>
                <p className="descripcion">{producto.description}</p>
                
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Precio:</strong>
                    <span className="precio-destacado">${producto.price}</span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Stock:</strong>
                    <span className={`stock-destacado ${producto.stock === 0 ? 'sin-stock' : producto.stock < 10 ? 'poco-stock' : 'con-stock'}`}>
                      {producto.stock} unidades
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Categoría:</strong>
                    <span>{producto.category}</span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Estado:</strong>
                    <span className={`status-badge ${producto.isActive ? 'activo' : 'inactivo'}`}>
                      {producto.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="detalle-seccion">
              <h4>
                <FontAwesomeIcon icon={solidStar} color="#FFD700" /> 
                Calificación
              </h4>
              <div className="rating-detalle">
                <div className="rating-stars">
                  {renderStars(producto.rating || 0)}
                  <span className="rating-valor">({producto.rating ? producto.rating.toFixed(1) : '0.0'})</span>
                </div>
                <div className="rating-reviews">
                  {producto.numReviews || 0} reseña(s)
                </div>
                
                {/* 🔥 NUEVO: Botón Ver Reseñas */}
                {producto.cartRatings && producto.cartRatings.length > 0 && (
                  <button 
                    className="btn-ver-resenas"
                    onClick={() => onViewReseñas && onViewReseñas(producto)}
                  >
                    <FontAwesomeIcon icon={faComments} />
                    Ver Reseñas
                  </button>
                )}
              </div>
            </div>

            {/* Información de Vencimiento */}
            <div className="detalle-seccion">
              <h4>
                <FontAwesomeIcon icon={faCalendarDay} /> 
                Información de Vencimiento
              </h4>
              <div className="vencimiento-info">
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Fecha de Vencimiento:</strong>
                    <span>{formatFecha(producto.fechaVencimiento)}</span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Lote:</strong>
                    <span>{producto.lote || "No especificado"}</span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Alerta de Vencimiento:</strong>
                    <span>
                      <FontAwesomeIcon icon={faBell} /> 
                      {producto.alertaVencimiento || 30} días antes
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <strong>Estado:</strong>
                    <span className={`status-badge ${estadoVencimiento.clase}`}>
                      {estadoVencimiento.icono && <FontAwesomeIcon icon={estadoVencimiento.icono} />}
                      {estadoVencimiento.texto}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="detalle-seccion">
              <h4>
                <FontAwesomeIcon icon={faBox} /> 
                Información Adicional
              </h4>
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID del Producto:</strong>
                  <span className="product-id">{producto._id}</span>
                </div>
                
                <div className="info-item">
                  <strong>Fecha de Creación:</strong>
                  <span>{producto.createdAt ? new Date(producto.createdAt).toLocaleDateString('es-ES') : 'No disponible'}</span>
                </div>
                
                <div className="info-item">
                  <strong>Última Actualización:</strong>
                  <span>{producto.updatedAt ? new Date(producto.updatedAt).toLocaleDateString('es-ES') : 'No disponible'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerProductoModal;