'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // ── Scroll reveal animations (one-shot, no performance impact) ──
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, .reveal-bottom-right, .reveal-stagger');
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

    // ── Parallax: optimised with IntersectionObserver gate ──
    // Only runs the rAF loop while the collage section is in viewport
    const layerEls = document.querySelectorAll('[data-layer]');
    const speeds: Record<string, { y: number; x: number }> = {
      layer4: { y: -0.02, x: 0.01 },
      layer3: { y: -0.04, x: -0.015 },
      layer2: { y: -0.06, x: 0.02 },
      layer1: { y: -0.08, x: -0.025 },
    };

    const ghostEl = document.querySelector('.garrix-collage-ghost') as HTMLElement | null;
    const outlineEl = document.querySelector('.garrix-collage-ghost-outline') as HTMLElement | null;

    // Find the collage section to use as visibility gate
    const collageSection = document.querySelector('.garrix-collage-section') as HTMLElement | null
      || document.querySelector('[data-layer]')?.closest('section') as HTMLElement | null
      || document.querySelector('[data-layer]')?.parentElement as HTMLElement | null;

    let rafId: number | null = null;
    let ticking = false;
    let isVisible = false;

    // Gate: only process parallax while the section is on screen
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (!isVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          ticking = false;
        }
      },
      { threshold: 0, rootMargin: '200px 0px' } // 200px buffer so it starts just before entering view
    );

    if (collageSection) {
      visibilityObserver.observe(collageSection);
    } else {
      // No collage section found, fall back to always-visible
      isVisible = true;
    }

    const updateParallax = () => {
      ticking = false;
      if (!isVisible) return;

      // Batch all reads first
      const scrollY = window.scrollY;
      const viewCenter = window.innerHeight / 2;
      const rects: DOMRect[] = [];
      layerEls.forEach((el) => {
        rects.push(el.getBoundingClientRect());
      });

      // Then batch all writes
      layerEls.forEach((el, i) => {
        const layer = el.getAttribute('data-layer') || 'layer3';
        const speed = speeds[layer] || { y: -0.04, x: -0.015 };
        const rect = rects[i];
        const centerY = rect.top + rect.height / 2;
        const offsetY = (centerY - viewCenter) * speed.y;
        const offsetX = (centerY - viewCenter) * speed.x;
        (el as HTMLElement).style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });

      // Ghost text — pure scroll-based, no layout read needed
      if (ghostEl) {
        ghostEl.style.transform = `translateX(${Math.sin(scrollY * 0.002) * 15}px)`;
      }
      if (outlineEl) {
        outlineEl.style.transform = `translateX(${Math.cos(scrollY * 0.002) * -10}px)`;
      }
    };

    const onScroll = () => {
      if (!isVisible) return;
      if (!ticking) {
        rafId = requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial position

    // ── Chrome scroll jank fix: pause CSS animations during scrollbar drag ──
    // Chrome's compositor thread stalls when CSS keyframe animations run
    // simultaneously with scroll events from scrollbar drag. Safari handles
    // this fine. We pause all marquee animations during scroll and resume
    // shortly after scroll stops.
    let pauseTimeout: ReturnType<typeof setTimeout> | null = null;
    const animatedEls = document.querySelectorAll<HTMLElement>('[style*="animation: marquee"]');

    const pauseAnimations = () => {
      animatedEls.forEach((el) => {
        el.style.animationPlayState = 'paused';
      });
      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        animatedEls.forEach((el) => {
          el.style.animationPlayState = 'running';
        });
      }, 120);
    };

    window.addEventListener('scroll', pauseAnimations, { passive: true });

    // ── Video play button ──
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

    // ── Venue highlight rotation ──
    const venueRows = document.querySelectorAll('.garrix-venues-row');
    const highlightInterval = setInterval(() => {
      venueRows.forEach((row) => {
        const spans = row.querySelectorAll('span:not(.garrix-venues-dot)');
        spans.forEach((s) => s.classList.remove('garrix-venues-highlight'));
        const count = Math.floor(Math.random() * 2) + 2;
        const indices = new Set<number>();
        while (indices.size < count && indices.size < spans.length) {
          indices.add(Math.floor(Math.random() * spans.length));
        }
        indices.forEach((i) => spans[i]?.classList.add('garrix-venues-highlight'));
      });
    }, 2500);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', pauseAnimations);
      if (rafId) cancelAnimationFrame(rafId);
      if (pauseTimeout) clearTimeout(pauseTimeout);
      clearInterval(highlightInterval);
      visibilityObserver.disconnect();
    };
  }, []);

  return null;
}