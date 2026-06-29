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

    // Video play button
    const playBtn = document.getElementById('collage-play-btn');
    const closeBtn = document.getElementById('collage-video-close');
    const videoOverlay = document.getElementById('collage-video-overlay');
    const video = document.getElementById('collage-video') as HTMLVideoElement | null;

    if (playBtn && videoOverlay && video) {
      playBtn.addEventListener('click', () => {
        video.play();
        videoOverlay.classList.add('active');
        videoOverlay.style.pointerEvents = 'auto';
        playBtn.style.opacity = '0';
        playBtn.style.pointerEvents = 'none';
      });
    }

    if (closeBtn && videoOverlay && video && playBtn) {
      closeBtn.addEventListener('click', () => {
        video.pause();
        videoOverlay.classList.remove('active');
        videoOverlay.style.pointerEvents = 'none';
        playBtn.style.opacity = '0.9';
        playBtn.style.pointerEvents = 'auto';
      });
    }

    // Venue highlight rotation
    const venueRows = document.querySelectorAll('.garrix-venues-row');
    const highlightInterval = setInterval(() => {
      venueRows.forEach((row) => {
        const spans = row.querySelectorAll('span:not(.garrix-venues-dot)');
        // Remove existing highlights
        spans.forEach((s) => s.classList.remove('garrix-venues-highlight'));
        // Pick 2-3 random venues to highlight
        const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const indices = new Set<number>();
        while (indices.size < count && indices.size < spans.length) {
          indices.add(Math.floor(Math.random() * spans.length));
        }
        indices.forEach((i) => spans[i]?.classList.add('garrix-venues-highlight'));
      });
    }, 2500);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(highlightInterval);
    };
  }, []);

  return null;
}