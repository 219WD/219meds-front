// App.jsx
import React, { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import ShoppingCart from "./components/ShoppingCart/ShoppingCart.jsx";
import NavBar from "./components/NavBar.jsx";
import useCartStore from "./store/cartStore";
import PartnerRoute from "./routes/PartnerRoute";
import ChangePasswordForm from "./components/ChangePasswordForm";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "./components/GlobalLoader.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Pacientes from "./pages/Pacientes.jsx";

// Páginas lazy
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

// Componente principal
function AppContent() {
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
  } = useCartStore();

  const location = useLocation();

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
  ];

  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  return (
    <>
      <GlobalLoader />

      <Suspense fallback={<></>}>
        <Toaster position="top-right" reverseOrder={false} />

        <Helmet>
          <title>219Meds - Plataforma de Gestión Médica y Farmacéutica</title>
          <link rel="icon" type="image/png" href="/219Meds.png" />

          <meta
            name="description"
            content="219Meds es una plataforma integral para clínicas, farmacias y profesionales de la salud. Gestioná pacientes, turnos, stock y analíticas en un solo lugar."
          />
          <meta
            name="keywords"
            content="219Meds, software médico, gestión clínica, sistema de turnos, farmacia, salud digital, analíticas médicas, historia clínica"
          />
          <meta name="author" content="219Meds" />
          <meta
            property="og:title"
            content="219Meds - Plataforma de Gestión Médica y Farmacéutica"
          />
          <meta
            property="og:description"
            content="Optimiza tu clínica o farmacia con 219Meds. Control de pacientes, stock, y estadísticas en tiempo real."
          />
          <meta
            property="og:image"
            content="https://219meds.com/og-image.jpg"
          />
          <meta property="og:url" content="https://219meds.com" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="219Meds - Plataforma de Gestión Médica y Farmacéutica"
          />
          <meta
            name="twitter:description"
            content="Software médico con herramientas para clínicas, farmacias y profesionales de la salud."
          />
          <meta
            name="twitter:image"
            content="https://219meds.com/og-image.jpg"
          />

          {/* Schema.org JSON-LD */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "219Meds",
              url: "https://219meds.com",
              logo: "https://219meds.com/logo219.png",
              sameAs: [
                "https://www.instagram.com/219meds",
                "https://www.facebook.com/219meds",
              ],
              description:
                "219Meds es una plataforma integral para gestión médica y farmacéutica, diseñada para clínicas, consultorios y farmacias.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "San Miguel de Tucumán",
                addressRegion: "Tucumán",
                addressCountry: "AR",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Atención al cliente",
                telephone: "+5493810000000",
                email: "contacto@219meds.com",
              },
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

          {/* Rutas públicas */}
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

// Wrapper principal
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
