import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Cards from "../components/Cards";
import Sugerencia from "../components/Sugerencia";
import Footer from "../components/Footer";
import Especial from "../components/Especial.jsx";
import useAuthStore from "../store/authStore.js";
import useCartStore from "../store/cartStore.js";
import ReprocanSection from "../components/ReprocanSection.jsx";
import AfterOfficeSection from "../components/AfterOfficeSection.jsx";
import FeaturesHighlight from "../components/FeaturesHighlight.jsx";
import RevenueSection from "../components/RevenueSection.jsx";
import FinalSection from "../components/FinalSection.jsx";
import useLoadingStore from "../store/loadingStore.js";

const HomeScreen = ({ addToCart }) => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;
  const isPartner = user?.isPartner;
  const fetchCart = useCartStore((state) => state.fetchCart);
  const { setLoading } = useLoadingStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        
        // Simular una pequeña carga inicial para mostrar el loader
        if (isInitialLoad) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setIsInitialLoad(false);
        }
        
        // Cargar el carrito
        await fetchCart();
        
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [fetchCart, setLoading, isInitialLoad]);

  // Si es la carga inicial, mostrar null mientras el loader está activo
  if (isInitialLoad) {
    return null;
  }

  return (
    <div className="container" translate="no">
      <Hero addToCart={addToCart} />
      <FeaturesHighlight />
      <RevenueSection />
      <FinalSection />
      {isLoggedIn && isPartner && (
        <>
          {/* <Cards onAddToCart={addToCart} /> */}
        </>
      )}
      <Footer />
    </div>
  );
};

export default HomeScreen;