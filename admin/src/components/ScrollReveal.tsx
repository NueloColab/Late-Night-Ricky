'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // Scroll reveal animations
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, .reveal-bottom-right');
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

    // Parallax scroll effect for elements with data-speed
    const parallaxEls = document.querySelectorAll('[data-speed]');
    if (parallaxEls.length) {
      const onScroll = () => {
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-speed') || '0');
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          const offset = (centerY - viewCenter) * speed;
          (el as HTMLElement).style.transform = `translateY(${offset}px)`;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener('scroll', onScroll);
      };
    }

    return () => {};
  }, []);

  return null;
}