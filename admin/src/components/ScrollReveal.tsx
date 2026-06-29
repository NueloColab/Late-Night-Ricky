'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade');
    if (!els.length) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger children if they have data-delay
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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    
    els.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return null;
}