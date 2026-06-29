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

    // Garrix-style parallax: vertical + horizontal movement on scroll
    const layerEls = document.querySelectorAll('[data-layer]');
    const speeds: Record<string, { y: number; x: number }> = {
      layer4: { y: -0.02, x: 0.01 },
      layer3: { y: -0.04, x: -0.015 },
      layer2: { y: -0.06, x: 0.02 },
      layer1: { y: -0.08, x: -0.025 },
    };

    const ghostEl = document.querySelector('.garrix-collage-ghost');
    const outlineEl = document.querySelector('.garrix-collage-ghost-outline');

    const onScroll = () => {
      // Photo parallax with horizontal drift
      layerEls.forEach((el) => {
        const layer = el.getAttribute('data-layer') || 'layer3';
        const speed = speeds[layer] || { y: -0.04, x: -0.015 };
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offsetY = (centerY - viewCenter) * speed.y;
        const offsetX = (centerY - viewCenter) * speed.x;
        (el as HTMLElement).style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });

      // Ghost text horizontal drift on scroll
      if (ghostEl) {
        const scrollY = window.scrollY;
        (ghostEl as HTMLElement).style.transform = `translateX(${Math.sin(scrollY * 0.002) * 15}px)`;
      }
      if (outlineEl) {
        const scrollY = window.scrollY;
        (outlineEl as HTMLElement).style.transform = `translateX(${Math.cos(scrollY * 0.002) * -10}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}