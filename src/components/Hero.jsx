import React, { useEffect, useRef } from 'react';
import { StaggerContainer, StaggerItem } from './ScrollReveal';
import heroBg from '../assets/hero_bg.jpg';

export default function Hero() {
  const contentRef = useRef(null);
  const bgRef = useRef(null);
  const rafRef = useRef(null);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
          contentRef.current.style.opacity = String(Math.min(1, Math.max(0, 1 - scrollY / 600)));
        }
        if (bgRef.current && !reducedMotion) {
          bgRef.current.style.transform = `translateY(${scrollY * 0.08}px) scale(1.05)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden select-none"
      style={{ height: '100vh', minHeight: '600px' }}
    >
      {/* ── Static Background Image with Parallax ── */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          transform: reducedMotion ? 'none' : 'scale(1.05)',
        }}
      >
        <img
          src={heroBg}
          alt="JK Samadhan Portal Background"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
        />
      </div>

      {/* ── Layered Gradient Overlays ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0c1a3a]/60 via-transparent to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* ── Shimmer overlay ── */}
      <div
        className="absolute inset-0 z-10 opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, rgba(19,177,131,0.25) 0%, transparent 65%), radial-gradient(ellipse at 20% 70%, rgba(12,64,143,0.30) 0%, transparent 60%)',
        }}
      />

      {/* ── Floating orb glows (skip if reduced motion) ── */}
      {!reducedMotion && (
        <div className="absolute z-10 pointer-events-none">
          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#13b183]/10 blur-3xl animate-pulse"
            style={{ animationDuration: '5s' }}
          />
          <div
            className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-[#0c408f]/15 blur-2xl animate-pulse"
            style={{ animationDuration: '8s', animationDelay: '2s' }}
          />
        </div>
      )}

      {/* ── Scanline texture ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        }}
      />

      {/* ── Main Content ── */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-20 flex items-center justify-start px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: '130px',
          paddingBottom: '70px',
          willChange: 'transform, opacity',
        }}
      >
        <div className="w-full max-w-7xl mx-auto">
          <StaggerContainer staggerChildren={0.15} className="flex flex-col items-start justify-center text-left max-w-3xl">
            <StaggerItem duration={0.9} y={40}>
              <p
                className="text-white/80 font-semibold text-lg sm:text-2xl md:text-3xl uppercase tracking-[0.25em] mb-3"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}
              >
                Welcome To
              </p>
            </StaggerItem>

            <StaggerItem duration={1.0} y={50}>
              <h1
                className="font-display font-black text-white leading-none tracking-tight mb-5"
                style={{
                  fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
                  textShadow: '0 4px 40px rgba(0,0,0,0.7)',
                }}
              >
                JK <span className="text-gov-saffron">Samadhan</span>
              </h1>
            </StaggerItem>

            <StaggerItem duration={1.1} y={30}>
              <p
                className="text-white/70 font-medium text-sm sm:text-base md:text-lg tracking-widest uppercase"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
              >
                Government of Jammu &amp; Kashmir
              </p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* ── Bottom ticker bar ── */}
      <div
        className="absolute bottom-0 left-0 w-full z-20 overflow-hidden"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.05), rgba(0,0,0,0.08))',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          {['Transparency', 'Accountability', 'Accessibility', 'Responsiveness'].map(
            (word, i, arr) => (
              <React.Fragment key={word}>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/75 hover:text-white transition-colors duration-300 cursor-default">
                  {word}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-white/25 font-light select-none">|</span>
                )}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate-in {
          opacity: 0;
          animation: heroFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-animate-in {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

