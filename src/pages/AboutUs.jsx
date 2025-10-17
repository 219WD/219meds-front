import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './AboutUs.css';

// Importa las imágenes de la galería circular
import image1 from '../assets/about1.jfif';
import image2 from '../assets/about2.jfif';
import image3 from '../assets/about3.jfif';
import image4 from '../assets/about4.jfif';
import image5 from '../assets/about5.jfif';
import image6 from '../assets/about6.jfif';
import image7 from '../assets/about7.jfif';
import image8 from '../assets/about8.jfif';
import image9 from '../assets/about9.jfif';
import image10 from '../assets/about10.jfif';
import image11 from '../assets/about11.jfif';
import image12 from '../assets/about12.jfif';
import image13 from '../assets/about13.jfif';
import image14 from '../assets/about14.jfif';
import image15 from '../assets/about15.jfif';

// Importa las imágenes para las cards (reemplaza con tus propias imágenes)
import proLogo from '../assets/logo png.png';
import logo from '../assets/LOGOJAMROCK.png';
import img1 from '../assets/jamrock.png';
import img2 from '../assets/jamrock.png';
import img3 from '../assets/jamrock.png';
import img4 from '../assets/jamrock.png';
import img5 from '../assets/jamrock.png';
import img6 from '../assets/jamrock.png';

// Registra el plugin de ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutUs = () => {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const isGalleryOpenRef = useRef(false);
  const currentItemRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Ref para las secciones nuevas
  const heroRef = useRef(null);
  const mainRef = useRef(null);
  const logoRef = useRef(null);
  const copyLinesRef = useRef([]);
  const buttonRef = useRef(null);
  const rowsRef = useRef([]);

  const images = [
    image1, image2, image3, image4, image5,
    image6, image7, image8, image9, image10,
    image11, image12, image13, image14, image15
  ];

  const cardImages = [img1, img2, img3, img4, img5, img6];

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Inicializar galería circular
  useEffect(() => {
    const initializeGallery = () => {
      const items = itemsRef.current;
      const container = containerRef.current;
      const numberOfItems = items.length;
      const angleIncrement = (2 * Math.PI) / numberOfItems;
      
      const radius = isMobile ? 150 : 300;

      if (!container) return;

      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;

      const tl = gsap.timeline();

      items.forEach((item, index) => {
        const angle = index * angleIncrement;
        const initialRotation = (angle * 180 / Math.PI) - 90;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        gsap.set(item, { scale: 0 });

        tl.to(item, {
          left: x + 'px',
          top: y + 'px',
          rotation: initialRotation,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          delay: 1,
        }, index * 0.1);
      });
    };

    const timer = setTimeout(() => {
      initializeGallery();
    }, 100);

    return () => clearTimeout(timer);
  }, [isMobile]);

  // Inicializar animaciones de ScrollTrigger
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initScrollAnimations = () => {
      // Animación del logo
      gsap.to(logoRef.current, {
        scale: 1,
        duration: 0.5,
        ease: "power1.out",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top 25%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Animación de las líneas de texto
      copyLinesRef.current.forEach((line, index) => {
        if (line) {
          gsap.to(line, {
            y: 0,
            duration: 0.5,
            ease: "power1.out",
            delay: index * 0.1,
            scrollTrigger: {
              trigger: mainRef.current,
              start: "top 25%",
              toggleActions: "play reverse play reverse",
            },
          });
        }
      });

      // Animación del botón
      gsap.to(buttonRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power1.out",
        delay: 0.25,
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top 25%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Animaciones de las cards
      rowsRef.current.forEach((row, index) => {
        if (!row) return;

        const cardLeft = row.querySelector('.about-card-left');
        const cardRight = row.querySelector('.about-card-right');

        if (!cardLeft || !cardRight) return;

        const leftXValues = isMobile ? [-200, -250, -150] : [-800, -900, -400];
        const rightXValues = isMobile ? [200, 250, 150] : [800, 900, 400];
        const leftRotationValues = isMobile ? [-15, -10, -20] : [-30, -20, -35];
        const rightRotationValues = isMobile ? [15, 10, 20] : [30, 20, 35];
        const yValues = isMobile ? [50, -75, -200] : [100, -150, -400];

        gsap.to(cardLeft, {
          x: leftXValues[index],
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top center",
            end: "150% bottom",
            scrub: true,
            onUpdate: (self) => {
              const progress = self.progress;
              if (cardLeft && cardRight) {
                cardLeft.style.transform = `translateX(${
                  progress * leftXValues[index]
                }px) translateY(${progress * yValues[index]}px) rotate(${
                  progress * leftRotationValues[index]
                }deg)`;
                cardRight.style.transform = `translateX(${
                  progress * rightXValues[index]
                }px) translateY(${progress * yValues[index]}px) rotate(${
                  progress * rightRotationValues[index]
                }deg)`;
              }
            },
          },
        });
      });
    };

    // Pequeño delay para asegurar que los elementos estén renderizados
    const timer = setTimeout(() => {
      initScrollAnimations();
    }, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile]);

  const handleItemClick = (index, item) => {
    if (isGalleryOpenRef.current) {
      closeGallery();
      return;
    }

    isGalleryOpenRef.current = true;
    currentItemRef.current = item;

    const items = itemsRef.current;
    const container = containerRef.current;
    const numberOfItems = items.length;
    const angleIncrement = (2 * Math.PI) / numberOfItems;
    const radius = isMobile ? 150 : 300;

    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    const angle = index * angleIncrement;
    const initialRotation = (angle * 180 / Math.PI) - 90;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    item.originalPosition = { x, y, rotation: initialRotation };

    gsap.to(items.filter((_, i) => i !== index), {
      scale: 0,
      duration: 0.5,
      ease: "power2.in",
      stagger: 0.05
    });

    const expandedScale = isMobile ? 4.5 : 3;

    gsap.to(item, {
      left: "50%",
      top: "50%",
      x: "-50%",
      y: "-50%",
      rotation: 0,
      scale: expandedScale,
      duration: 1,
      ease: "power2.out",
      onComplete: function() {
        item.classList.add('about-item-expanded');
      }
    });

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        closeGallery();
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    const handleOutsideClick = (e) => {
      if (!item.contains(e.target)) {
        closeGallery();
      }
    };
    document.addEventListener('click', handleOutsideClick);

    item._closeListeners = { handleKeyPress, handleOutsideClick };
  };

  const closeGallery = () => {
    if (!isGalleryOpenRef.current || !currentItemRef.current) return;

    const item = currentItemRef.current;
    const items = itemsRef.current;

    item.classList.remove('about-item-expanded');

    gsap.to(item, {
      left: item.originalPosition.x + 'px',
      top: item.originalPosition.y + 'px',
      x: "0%",
      y: "0%",
      rotation: item.originalPosition.rotation,
      scale: 1,
      duration: 1,
      ease: "power2.out",
      onComplete: function() {
        gsap.to(items, {
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out"
        });
        
        isGalleryOpenRef.current = false;
        currentItemRef.current = null;
      }
    });

    if (item._closeListeners) {
      document.removeEventListener('keydown', item._closeListeners.handleKeyPress);
      document.removeEventListener('click', item._closeListeners.handleOutsideClick);
      delete item._closeListeners;
    }
  };

  const addToRefs = (el, index) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current[index] = el;
    }
  };

  const addCopyLineRef = (el, index) => {
    if (el) {
      copyLinesRef.current[index] = el;
    }
  };

  const addRowRef = (el, index) => {
    if (el) {
      rowsRef.current[index] = el;
    }
  };

  return (
    <div className="about-us-page">
      {/* Sección Hero con la galería circular */}
      <section className="about-hero" ref={heroRef}>
        <div className="about-hero-img">
          <img src={proLogo} alt="Pro Logo" />
        </div>
        
        <div className="about-container" ref={containerRef}>
          <div className="about-gallery">
            {images.map((image, index) => (
              <div
                key={index}
                className="about-item"
                ref={(el) => addToRefs(el, index)}
                onClick={() => handleItemClick(index, itemsRef.current[index])}
              >
                <img src={image} alt={`Team member ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Main con cards animadas */}
      <section className="about-main" ref={mainRef}>
        <div className="about-main-content">
          <div className="about-logo" ref={logoRef}>
            <img src={logo} alt="Logo" />
          </div>
          <div className="about-copy">
            <div className="about-line">
              <p ref={(el) => addCopyLineRef(el, 0)}>Nuestra política principal es</p>
            </div>
            <div className="about-line">
              <p ref={(el) => addCopyLineRef(el, 1)}>Cultivar conciencia, cosechar experiencia</p>
            </div>
            <div className="about-line">
              <p ref={(el) => addCopyLineRef(el, 2)}>dispensar, informar y capacitar</p>
            </div>
            <div className="about-line">
              <p ref={(el) => addCopyLineRef(el, 3)}>a nuestros asociados.</p>
            </div>
          </div>
          <div className="about-btn"> 
            <Link 
              to="/register" 
              className="about-btn-primary-modern"
              ref={buttonRef}
            >
              <FontAwesomeIcon icon={faUser} /> 
              <span>Unirse al Club</span>
              <FontAwesomeIcon icon={faArrowRight} className="about-arrow" />
            </Link>
          </div>
        </div>

        <div className="about-row" ref={(el) => addRowRef(el, 0)}>
          <div className="about-card about-card-left">
            <img src={cardImages[0]} alt="Card 1" />
          </div>
          <div className="about-card about-card-right">
            <img src={cardImages[1]} alt="Card 2" />
          </div>
        </div>

        <div className="about-row" ref={(el) => addRowRef(el, 1)}>
          <div className="about-card about-card-left">
            <img src={cardImages[2]} alt="Card 3" />
          </div>
          <div className="about-card about-card-right">
            <img src={cardImages[3]} alt="Card 4" />
          </div>
        </div>

        <div className="about-row" ref={(el) => addRowRef(el, 2)}>
          <div className="about-card about-card-left">
            <img src={cardImages[4]} alt="Card 5" />
          </div>
          <div className="about-card about-card-right">
            <img src={cardImages[5]} alt="Card 6" />
          </div>
        </div>
      </section>

      <section className="about-footer">
        <Link to="/register">Solicitar Unirse al Club</Link>
      </section>
    </div>
  );
};

export default AboutUs;