import React, { useState, useEffect } from "react";
import "./css/NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShoppingCart, 
  faBars, 
  faTimes,
  faUser,
  faSignOutAlt,
  faCannabis
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoSinFondo from "../assets/logo png.png";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import { gsap } from "gsap";

const NavBar = ({ cartCount, toggleCartVisibility }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!user;
  const isPartner = user?.isPartner;

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para animaciones GSAP
  useEffect(() => {
    gsap.fromTo('.logoNav', 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.nav-item', 
      { y: -30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
      }
    );
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'unset';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    closeMenu();
  };

  const handleNavClick = () => {
    closeMenu();
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <Link to="/" onClick={handleNavClick}>
              <img src={LogoSinFondo} alt="Jamrock Logo" className="logoNav" />
            </Link>
          </div>

          <nav className={`nav ${isMenuOpen ? "mobile-nav open" : ""}`}>
            {/* Solo visible si el usuario es partner */}
            {user?.isPartner && (
              <Link to="/productos" className="nav-item" onClick={handleNavClick}>
                <FontAwesomeIcon icon={faCannabis} className="nav-icon" />
                Productos
              </Link>
            )}

            <Link to="/aboutus" className="nav-item" onClick={handleNavClick}>
              Acerca de Nosotros
            </Link>

            {!user ? (
              <>
                <Link to="/register" className="nav-item nav-button" onClick={handleNavClick}>
                  <FontAwesomeIcon icon={faUser} className="nav-icon" />
                  Registro
                </Link>
                <Link to="/login" className="nav-item nav-button primary" onClick={handleNavClick}>
                  Iniciar Sesión
                </Link>
              </>
            ) : (
              <>
                {user.isAdmin ? (
                  <Link to="/admin" className="nav-item" onClick={handleNavClick}>
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/perfil" className="nav-item" onClick={handleNavClick}>
                    <FontAwesomeIcon icon={faUser} className="nav-icon" />
                    Mi Perfil
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-item logout-button">
                  <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
                  Cerrar Sesión
                </button>
              </>
            )}
          </nav>

          <div className="nav-actions">
            {isLoggedIn && isPartner && (
              <button className="cart-button" onClick={toggleCartVisibility}>
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
            )}

            <button 
              className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FontAwesomeIcon icon={faTimes} />
              ) : (
                <FontAwesomeIcon icon={faBars} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay para móvil */}
      {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default NavBar;