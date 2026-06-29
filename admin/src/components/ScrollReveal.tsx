'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // Handle legacy reveal classes
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade');
    if (els.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = entry.target.getAttribute('data-delay');
              if (delay) {
                setTimeout(() => {
                  entry.target.classList.add('visible');
                }, parseInt(delay));
              } else {
                entry.target.classList.add('visible');
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
      );
      
      els.forEach((el) => observer.observe(el));
    }

    // Handle Reach section v2 animations
    const reachEls = document.querySelectorAll('[data-reach-animate]');
    if (reachEls.length) {
      const reachObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reach-visible');
              reachObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      
      reachEls.forEach((el) => reachObserver.observe(el));
      
      return () => reachObserver.disconnect();
    }
  }, []);

  return null;
}