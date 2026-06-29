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

    // Garrix-style parallax: elements with data-layer scroll at different speeds
    const layerEls = document.querySelectorAll('[data-layer]');
    if (layerEls.length) {
      const speeds: Record<string, number> = {
        layer4: -0.02,
        layer3: -0.04,
        layer2: -0.06,
        layer1: -0.08,
      };

      const onScroll = () => {
        layerEls.forEach((el) => {
          const layer = el.getAttribute('data-layer') || 'layer3';
          const speed = speeds[layer] || -0.04;
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          const offset = (centerY - viewCenter) * speed;
          (el as HTMLElement).style.transform = `translate3d(0, ${offset}px, 0)`;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Also handle data-speed parallax (legacy)
    const speedEls = document.querySelectorAll('[data-speed]');
    if (speedEls.length) {
      const onSpeedScroll = () => {
        speedEls.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-speed') || '0');
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          const offset = (centerY - viewCenter) * speed;
          (el as HTMLElement).style.transform = `translateY(${offset}px)`;
        });
      };
      window.addEventListener('scroll', onSpeedScroll, { passive: true });
      onSpeedScroll();
    }

    return () => {};
  }, []);

  return null;
}