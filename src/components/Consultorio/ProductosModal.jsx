import React, { useState, useEffect } from "react";

const ProductosModal = ({
  showProductosModal,
  setShowProductosModal,
  productosDisponibles,
  handleProductSelect,
  selectedProducts,
}) => {
  const [quantities, setQuantities] = useState({});
  const [availableStock, setAvailableStock] = useState({});
  const [isAdding, setIsAdding] = useState({}); // Nuevo estado para rastrear si se está agregando un producto

  useEffect(() => {
    const updatedQuantities = {};
    const stockMap = {};

    productosDisponibles.forEach((producto) => {
      updatedQuantities[producto._id] = quantities[producto._id] || 0;
      stockMap[producto._id] = producto.stock;
    });

    setQuantities(updatedQuantities);
    setAvailableStock(stockMap);
  }, [productosDisponibles, showProductosModal]);

  const handleIncrement = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(
        (prev[productId] || 0) + 1,
        availableStock[productId] || 0
      ),
    }));
  };

  const handleDecrement = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const handleAddProduct = async (producto) => {
    if (isAdding[producto._id]) return; // Evitar múltiples clics
    setIsAdding((prev) => ({ ...prev, [producto._id]: true }));

    try {
      const quantity = quantities[producto._id] || 0;
      if (quantity > 0 && quantity <= (availableStock[producto._id] || 0)) {
        handleProductSelect({
          ...producto,
          cantidad: quantity,
        });
        setQuantities((prev) => ({
          ...prev,
          [producto._id]: 0,
        }));
      }
    } finally {
      setIsAdding((prev) => ({ ...prev, [producto._id]: false }));
    }
  };

  return (
    showProductosModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Seleccionar Productos</h3>
            <button
              className="close-modal"
              onClick={() => setShowProductosModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-content-productos">
            {productosDisponibles.length === 0 ? (
              <p className="no-products">No hay productos disponibles</p>
            ) : (
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock Disponible</th>
                    <th>Categoría</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosDisponibles.map((producto) => {
                    const currentAvailableStock =
                      availableStock[producto._id] || 0;
                    const currentQuantity = quantities[producto._id] || 0;

                    return (
                      <tr key={producto._id}>
                        <td data-label="Título">
                          {producto.title || "Sin título"}
                        </td>
                        <td data-label="Descripción">
                          {producto.description || "Sin descripción"}
                        </td>
                        <td data-label="Precio">${producto.price || 0}</td>
                        <td data-label="Stock">
                          {currentAvailableStock > 0 ? (
                            <span className="producto-stock">
                              {currentAvailableStock} disponibles
                            </span>
                          ) : (
                            <span className="producto-sinstock">Sin stock</span>
                          )}
                        </td>
                        <td>{producto.category || "Sin categoría"}</td>
                        <td data-label="Imagen">
                          {producto.image ? (
                            <img
                              src={producto.image}
                              alt={producto.title}
                              className="product-image"
                            />
                          ) : (
                            "Sin imagen"
                          )}
                        </td>
                        <td data-label="Acciones">
                          <div className="product-actions">
                            <button
                              className="btn-quantity btn-decrement"
                              onClick={() => handleDecrement(producto._id)}
                              disabled={currentQuantity <= 0}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3 10H17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <span className="quantity-display">
                              {currentQuantity}
                            </span>
                            <button
                              className="btn-quantity btn-increment"
                              onClick={() => handleIncrement(producto._id)}
                              disabled={
                                currentAvailableStock <= 0 ||
                                currentQuantity >= currentAvailableStock
                              }
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 3V17M3 10H17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              className="btn-add"
                              onClick={() => handleAddProduct(producto)}
                              disabled={
                                currentAvailableStock <= 0 ||
                                currentQuantity <= 0 ||
                                isAdding[producto._id]
                              }
                            >
                              {isAdding[producto._id]
                                ? "Agregando..."
                                : "Agregar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="modal-actions">
            <button
              className="btn-cancel"
              onClick={() => setShowProductosModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductosModal;
