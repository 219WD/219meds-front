import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const BlurText = ({
  children,
  delay = 200,
  className = '',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = "power3.out",
  onAnimationComplete,
  duration = 0.35
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!inView || !containerRef.current) return;

    const defaultFrom = direction === 'top' 
      ? { filter: 'blur(10px)', opacity: 0, y: -30 } 
      : { filter: 'blur(10px)', opacity: 0, y: 30 };

    const defaultTo = [
      { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ];

    const from = animationFrom || defaultFrom;
    const to = animationTo || defaultTo;

    // Obtener todos los elementos span dentro del contenedor
    const spans = containerRef.current.querySelectorAll('span');
    
    if (spans.length === 0) return;

    const tl = gsap.timeline({
      onComplete: onAnimationComplete
    });

    spans.forEach((span, index) => {
      // Set initial state
      gsap.set(span, from);

      // Create animation for each step
      to.forEach((step, stepIndex) => {
        tl.to(span, {
          ...step,
          duration: duration,
          delay: stepIndex === 0 ? (index * delay) / 1000 : 0,
          ease: easing
        }, stepIndex === 0 ? `>-${duration}` : `>0`);
      });
    });
  }, [inView, delay, direction, animationFrom, animationTo, easing, duration, onAnimationComplete]);

  return (
    <div ref={ref} className={className}>
      <div ref={containerRef} style={{ display: 'inline' }}>
        {children}
      </div>
    </div>
  );
};

export default BlurText;