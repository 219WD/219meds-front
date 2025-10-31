import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCartShopping, 
  faStar,
  faComments,
  faBox,
  faTag
} from "@fortawesome/free-solid-svg-icons";
import "../components/css/Individual.css";
import NavBar from "../components/NavBar";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart";
import GlobalLoader from "../components/GlobalLoader"; // Importar el loader
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import useLoadingStore from "../store/loadingStore"; // Importar el store del loader
import API_URL from "../common/constants";
import ReseñasModal from "../components/Productos/ReseñasModal";
import "../components/Productos/css/resenasModal.css";

const Individual = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReseñasModal, setShowReseñasModal] = useState(false);

  const { token } = useAuthStore();
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
    fetchCart,
  } = useCartStore();

  // Store para controlar el loader global
  const { setLoading: setGlobalLoading, setLoadingText } = useLoadingStore();

  // Fetch producto individual
  useEffect(() => {
    const fetchProduct = async () => {
      setGlobalLoading(true);
      setLoadingText("Cargando producto...");
      try {
        const res = await fetch(`${API_URL}/products/getProducts/${id}`);
        if (!res.ok) throw new Error("Producto no encontrado");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };
    fetchProduct();
  }, [id, setGlobalLoading, setLoadingText]);

  // Fetch carrito si hay token
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        setGlobalLoading(true);
        setLoadingText("Cargando carrito...");
        try {
          await fetchCart();
        } finally {
          setGlobalLoading(false);
        }
      }
    };

    loadCart();
  }, [token, fetchCart, setGlobalLoading, setLoadingText]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    const normalizedProduct = {
      ...product,
      _id: product._id || product.id,
      id: product._id || product.id,
    };
    
    try {
      setGlobalLoading(true);
      setLoadingText("Agregando al carrito...");
      await addToCart(normalizedProduct);
      setGlobalLoading(false);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error al agregar al carrito");
      setGlobalLoading(false);
    }
  };

  const handleViewReseñas = () => {
    setShowReseñasModal(true);
  };

  // Función para renderizar estrellas
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStar} className="star half" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="star empty" />);
    }

    return stars;
  };

  // Mostrar loader global durante la carga inicial
  if (loading) return <GlobalLoader text="Cargando producto..." />;
  
  if (error) return (
    <div className="individual-page">
      <GlobalLoader text="Cargando..." />
      <NavBar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        toggleCartVisibility={toggleCartVisibility}
      />
      <div className="individual-error">
        <h2>¡Ups!</h2>
        <p>{error}</p>
        <Link to="/productos" className="error-button">Volver a Productos</Link>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="individual-page">
      <GlobalLoader text="Cargando..." />
      <NavBar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        toggleCartVisibility={toggleCartVisibility}
      />
      <div className="individual-error">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no está disponible.</p>
        <Link to="/productos" className="error-button">Explorar Productos</Link>
      </div>
    </div>
  );

  return (
    <div className="individual-page">
      {/* Loader global - se mostrará automáticamente cuando isLoading sea true */}
      <GlobalLoader />

      <NavBar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        toggleCartVisibility={toggleCartVisibility}
      />

      {isCartVisible && (
        <ShoppingCart
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          toggleCartVisibility={toggleCartVisibility}
        />
      )}

      <section className="individual-container">
        <section className="individual-content">
          {/* Columna Izquierda: Solo Imagen + Características */}
          <div className="left-column">
            <div className="individual-img-container">
              <img
                src={product.image}
                alt={product.title}
                className="individual-img"
              />
            </div>

            {/* Características debajo de la imagen */}
            <div className="additional-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <div className="feature-text">
                  <strong>Envío rápido</strong>
                  <span>Recibe tu pedido en 24-48h</span>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <div className="feature-text">
                  <strong>Garantía</strong>
                  <span>30 días de garantía</span>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">💳</span>
                <div className="feature-text">
                  <strong>Pago seguro</strong>
                  <span>Transacciones protegidas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Todo el contenido */}
          <div className="right-column">
            <div className="product-header">
              <h1>{product.title}</h1>
              <div className="price-rating-section">
                <p className="individual-price">${product.price?.toLocaleString()}</p>
                <div className="rating-display">
                  <div className="stars-container">
                    {renderStars(product.rating || 0)}
                    <span className="rating-value">({product.rating?.toFixed(1) || '0.0'})</span>
                  </div>
                  <span className="review-count">{product.numReviews || 0} reseñas</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="description-section">
              <h3>Descripción</h3>
              <p className="individual-description">{product.description}</p>
            </div>

            {/* Metadata */}
            <div className="individual-metadata">
              <div className="metadata-item">
                <FontAwesomeIcon icon={faTag} />
                <div>
                  <strong>Categoría:</strong> 
                  <span>{product.category}</span>
                </div>
              </div>
              <div className="metadata-item">
                <FontAwesomeIcon icon={faBox} />
                <div>
                  <strong>Disponibilidad:</strong> 
                  <span>{product.stock > 0 ? `${product.stock} unidades en stock` : 'Producto agotado'}</span>
                </div>
              </div>
              
              {/* Sección de reseñas integrada */}
              <div className="reviews-section">
                <div className="reviews-header">
                  <FontAwesomeIcon icon={faComments} />
                  <strong> Reseñas de clientes</strong>
                </div>
                {product.cartRatings && product.cartRatings.length > 0 ? (
                  <div className="reviews-preview">
                    <p>{product.cartRatings.length} clientes han opinado</p>
                    <button 
                      className="btn-ver-resenas"
                      onClick={handleViewReseñas}
                    >
                      Ver todas las reseñas
                    </button>
                  </div>
                ) : (
                  <p className="no-reviews">Este producto aún no tiene reseñas</p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="individual-buttons">
              <button
                className="add-to-cart-button-individual"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FontAwesomeIcon icon={faCartShopping} />
                {product.stock === 0 ? 'Producto Agotado' : 'Agregar al Carrito'}
              </button>
              <Link to="/productos" className="view-button-individual">
                Ver Más Productos
              </Link>
            </div>
          </div>
        </section>
      </section>

      {/* Modal de Reseñas */}
      {showReseñasModal && product && (
        <ReseñasModal
          producto={product}
          onClose={() => setShowReseñasModal(false)}
        />
      )}
    </div>
  );
};

export default Individual;