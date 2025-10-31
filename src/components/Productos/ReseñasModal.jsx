import React from "react";

const ReseñasModal = ({ producto, onClose }) => {
  if (!producto) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container reseñas-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reseñas de {producto.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="reseñas-container">
            {(!producto.cartRatings || producto.cartRatings.length === 0) ? (
              <div className="sin-resenas">
                <p>Este producto aún no tiene reseñas.</p>
              </div>
            ) : (
              <div className="lista-resenas">
                {producto.cartRatings.map((review, index) => (
                  <div key={index} className="resena-card">
                    <div className="resena-header">
                      <div className="usuario-info">
                        <strong>{review.cartId?.userId?.name || 'Cliente'}</strong>
                        <span className="fecha-resena">
                          {new Date(review.ratedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="rating-resena">
                        {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                        <span>({review.stars})</span>
                      </div>
                    </div>
                    {review.comment && (
                      <div className="comentario-resena">
                        <p>"{review.comment}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

export default ReseñasModal;