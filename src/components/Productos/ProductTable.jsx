import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPowerOff,
  faStar as solidStar,
  faEye,
  faExclamationTriangle,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const ProductTable = ({ productos, loading, onEdit, onDelete, onToggleEstado, onView }) => {
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

  // 🔄 VUELTA A LA VERSIÓN ANTERIOR: Función para renderizar el estado de vencimiento completo
  const renderEstadoVencimiento = (producto) => {
    if (!producto.fechaVencimiento) {
      return <span className="status-badge sin-vencimiento">Sin Vencimiento</span>;
    }

    const estado = producto.estadoVencimiento;
    const dias = producto.diasHastaVencimiento;

    switch (estado) {
      case 'vencido':
        return (
          <span className="status-badge vencido" title={`Vencido hace ${Math.abs(dias)} días`}>
            <FontAwesomeIcon icon={faExclamationTriangle} /> Vencido
          </span>
        );
      case 'proximo-a-vencer':
        return (
          <span className="status-badge proximo" title={`Vence en ${dias} días`}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Próximo
          </span>
        );
      case 'vigente':
        return (
          <span className="status-badge vigente" title={`Vence en ${dias} días`}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Vigente
          </span>
        );
      default:
        return <span className="status-badge">-</span>;
    }
  };

  // 🔄 VUELTA A LA VERSIÓN ANTERIOR: Función para formatear fecha
  const formatFecha = (fechaString) => {
    if (!fechaString) return "-";
    return new Date(fechaString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="no-productos">
        <p>No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="productos-table compact-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Lote</th> {/* 🔄 MANTENIDO */}
            <th>Vencimiento</th> {/* 🔄 VUELTA A LA VERSIÓN COMPLETA */}
            <th>Estado Vto.</th> {/* 🔄 VUELTA A LA VERSIÓN COMPLETA */}
            <th>Rating</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto._id} className={producto.estadoVencimiento === 'vencido' ? 'fila-vencida' : ''}>
              {/* Columna combinada de producto */}
              <td data-label="Producto" className="producto-info-cell">
                <div className="producto-compact-info">
                  {producto.image && (
                    <img src={producto.image} alt={producto.title} className="product-image-small" />
                  )}
                  <div className="producto-texto">
                    <div className="producto-titulo">{producto.title}</div>
                    <div className="producto-categoria">{producto.category}</div>
                    <div className="producto-descripcion">{producto.description}</div>
                  </div>
                </div>
              </td>
              
              <td data-label="Precio" className="precio-cell">
                <strong>${producto.price}</strong>
              </td>
              
              <td data-label="Stock" className="stock-cell">
                <span className={`stock-badge ${producto.stock === 0 ? 'sin-stock' : producto.stock < 10 ? 'poco-stock' : 'con-stock'}`}>
                  {producto.stock}
                </span>
              </td>
              
              <td data-label="Lote" className="lote-cell">
                {producto.lote || "-"}
              </td>
              
              {/* 🔄 VUELTA A LA VERSIÓN ANTERIOR: Columna completa de vencimiento */}
              <td data-label="Vencimiento" className="vencimiento-cell">
                {formatFecha(producto.fechaVencimiento)}
              </td>
              
              {/* 🔄 VUELTA A LA VERSIÓN ANTERIOR: Columna completa de estado de vencimiento */}
              <td data-label="Estado Vto." className="estado-vencimiento-cell">
                {renderEstadoVencimiento(producto)}
              </td>
              
              <td data-label="Rating" className="rating-cell">
                <div className="rating-compact">
                  {renderStars(producto.rating || 0)} 
                  <span className="rating-value">({producto.rating ? producto.rating.toFixed(1) : '0.0'})</span>
                </div>
              </td>
              
              <td data-label="Estado">
                <span className={`status-badge ${producto.isActive ? 'activo' : 'inactivo'}`}>
                  {producto.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              
              <td data-label="Acciones">
                <div className="action-buttons">
                  <button 
                    onClick={() => onView(producto)} 
                    className="btn btn-view" 
                    title="Ver detalles del producto"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button 
                    onClick={() => onEdit(producto)} 
                    className="btn btn-edit" 
                    title="Editar producto"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    onClick={() => onDelete(producto._id)} 
                    className="btn btn-delete" 
                    title="Eliminar producto"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => onToggleEstado(producto._id)}
                    className={`btn btn-toggle ${producto.isActive ? "activo" : "inactivo"}`}
                    title={producto.isActive ? "Desactivar producto" : "Activar producto"}
                  >
                    <FontAwesomeIcon icon={faPowerOff} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;