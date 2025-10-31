import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MenuCards from "../components/MenuCards";
import Footer from "../components/Footer";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart";
import GlobalLoader from "../components/GlobalLoader"; // Importar el loader
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import useProductStore from "../store/productStore";
import useLoadingStore from "../store/loadingStore"; // Importar el store del loader
import "../pages/css/Productos.css";

const Productos = () => {
  const { token } = useAuthStore();
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkoutCart,
    fetchCart,
  } = useCartStore();

  // 🔹 USAR getActiveProducts() en lugar de products directamente
  const { getActiveProducts, loading, error, fetchProducts } = useProductStore();
  const activeProducts = getActiveProducts(); // 🔹 Esto devuelve solo productos activos con stock > 0

  // Store para controlar el loader global
  const { setLoading, setLoadingText } = useLoadingStore();

  // Obtener productos del backend usando el store
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setLoadingText("Cargando productos...");
      try {
        await fetchProducts();
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts, setLoading, setLoadingText]);

  // Obtener carrito del backend solo si hay token
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        setLoading(true);
        setLoadingText("Cargando carrito...");
        try {
          await fetchCart();
        } finally {
          setLoading(false);
        }
      }
    };

    loadCart();
  }, [token, fetchCart, setLoading, setLoadingText]);

  const handleAddToCart = async (product) => {
    try {
      // 🔹 ESTA VERIFICACIÓN YA NO ES NECESARIA porque activeProducts solo tiene stock > 0
      // Pero la dejamos por seguridad
      if (product.stock <= 0) {
        alert("Este producto no tiene stock disponible");
        return;
      }

      const normalizedProduct = {
        ...product,
        _id: product._id || product.id,
        id: product._id || product.id,
      };
      
      setLoading(true);
      setLoadingText("Agregando al carrito...");
      await addToCart(normalizedProduct);
      setLoading(false);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert(error.message || "Error al agregar al carrito");
      setLoading(false);
    }
  };

  // Mostrar el loader global mientras carga
  if (loading) return <GlobalLoader text="Cargando productos..." />;
  
  if (error) return (
    <div className="productos-page-container">
      <NavBar />
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="productos-page-container">
      {/* Loader global - se mostrará automáticamente cuando isLoading sea true */}
      <GlobalLoader />

      {/* 🔹 PASAR activeProducts EN LUGAR DE products */}
      <MenuCards
        products={activeProducts} // 🔹 ESTA ES LA CORRECCIÓN IMPORTANTE
        onAddToCart={handleAddToCart}
        toggleCartVisibility={toggleCartVisibility}
      />

      {isCartVisible && (
        <ShoppingCart
          cart={cart}
          toggleCartVisibility={toggleCartVisibility}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          checkoutCart={checkoutCart}
        />
      )}

      <Footer />
    </div>
  );
};

export default Productos;