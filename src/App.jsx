// App.jsx
import React from "react";
import { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import ShoppingCart from "./components/ShoppingCart/ShoppingCart.jsx";
import NavBar from "./components/NavBar.jsx";
import useCartStore from "./store/cartStore";
import PartnerRoute from "./routes/PartnerRoute";
import ChangePasswordForm from "./components/ChangePasswordForm";

const HomeScreen = lazy(() => import("./pages/HomeScreen"));
const Productos = lazy(() => import("./pages/Productos"));
const Individual = lazy(() => import("./pages/Individual"));
const Register = lazy(() => import("./components/Auth/Register"));
const Login = lazy(() => import("./components/Auth/Login"));
const Socio = lazy(() => import("./pages/Socio"));
const PerfilUsuario = lazy(() => import("./pages/PerfilUsuario.jsx"));
const PendienteSocio = lazy(() => import("./pages/PendienteYaSocio"));
const Solicitud = lazy(() => import("./pages/Solicitud"));
const SolicitudPendiente = lazy(() => import("./pages/SolicitudPendiente"));
const Clientes = lazy(() => import("./pages/Clientes.jsx"));
const Products = lazy(() => import("./components/Products"));
const EstadoDelEnvio = lazy(() => import("./components/EstadoDelEnvio"));
const Pedidos = lazy(() => import("./components/Pedidos"));
const Especialistas = lazy(() => import("./pages/Especialistas.jsx"));
const Turnos = lazy(() => import("./pages/Turnos.jsx"));
const TurnosPaciente = lazy(() => import("./pages/TurnosPaciente.jsx"));
const Consultorio = lazy(() => import("./pages/Consultorio.jsx"));
const Caja = lazy(() => import("./pages/Caja.jsx"));
const LoaderGsap = lazy(() => import("./components/LoaderGsap.jsx"));
const AboutUs = lazy(() => import("./pages/AboutUs.jsx"));

import Pacientes from "./pages/Pacientes.jsx";

import { Toaster } from "react-hot-toast";
import GlobalLoader from "./components/GlobalLoader.jsx";
import Dashboard from "./components/Dashboard.jsx";

// Componente simple para el fallback de Suspense
const SuspenseFallback = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 5, 10, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
    fontFamily: '"Zen Dots", sans-serif',
    color: '#00ff00',
    fontSize: '1.2rem'
  }}>
    <div>Cargando sección...</div>
  </div>
);

function App() {
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
  } = useCartStore();

  const location = useLocation(); // Hook para obtener la ruta actual
  const hideNavRoutes = [
    "/admin",
    "/products",
    "/pedidos",
    "/clientes",
    "/dashboard",
    "/perfil",
    "/especialistas",
    "/pacientes",
    "/turnos",
    "/turnos/paciente",
    "/consultorio",
    "/caja",
  ]; // rutas donde no se mostrará el NavBar

  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      <GlobalLoader />
      <Suspense fallback={<SuspenseFallback />}>
        <Toaster position="top-right" reverseOrder={false} />
        <Helmet>
          <title>Jamrock ONG de la Salud - Res. 344/2023-DPJ</title>
          <link rel="icon" type="image/png" href="/LOGOJAMROCK.png" />
          <meta
            name="description"
            content="Jamrock ONG de la Salud - Res. 344/2023-DPJ. Cultivadores Solidarios Weed and Dab Club, San Miguel de Tucumán. Promovemos el cultivo solidario y el acceso a terapias con cannabis medicinal."
          />
          <meta
            name="keywords"
            content="Cannabis medicinal, ONG de la Salud, Cultivo solidario, Weed and Dab Club, San Miguel de Tucumán, Terapias con cannabis"
          />
          <meta name="author" content="Jamrock ONG de la Salud" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Jamrock ONG de la Salud",
              address: {
                "@type": "PostalAddress",
                streetAddress: "San Miguel de Tucumán",
                addressLocality: "Tucumán",
                addressRegion: "T",
                postalCode: "4000",
                addressCountry: "AR",
              },
              telephone: "+549XXXXXXXXX",
              description:
                "Jamrock ONG de la Salud - Res. 344/2023-DPJ. Cultivadores Solidarios Weed and Dab Club, promoviendo el acceso a cannabis medicinal y el cultivo responsable en Argentina.",
              url: "https://jamrocksalud.org/",
            })}
          </script>
        </Helmet>

        {!shouldHideNav && (
          <NavBar
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            toggleCartVisibility={toggleCartVisibility}
          />
        )}

        {!shouldHideNav && isCartVisible && (
          <ShoppingCart
            cart={cart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
          />
        )}

        <Routes>
          <Route path="/" element={<HomeScreen addToCart={addToCart} />} />
          {/* Rutas protegidas solo para partners */}
          <Route
            path="/productos"
            element={
              <PartnerRoute>
                <Productos />
              </PartnerRoute>
            }
          />
          <Route
            path="/individual/:id"
            element={
              <PartnerRoute>
                <Individual />
              </PartnerRoute>
            }
          />

          {/* Resto de rutas públicas */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/socio" element={<Socio />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/pendiente" element={<PendienteSocio />} />
          <Route path="/solicitud" element={<Solicitud />} />
          <Route path="/solicitudPendiente" element={<SolicitudPendiente />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/products" element={<Products />} />
          <Route path="/estadoDelEnvio" element={<EstadoDelEnvio />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/especialistas" element={<Especialistas />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/turnos/paciente" element={<TurnosPaciente />} />
          <Route path="/consultorio" element={<Consultorio />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/loader" element={<LoaderGsap />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route
            path="/reset-password/:token"
            element={<ChangePasswordForm />}
          />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Suspense>
    </>
  );
}

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;