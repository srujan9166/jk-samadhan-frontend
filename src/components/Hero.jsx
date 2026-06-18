import React, { useState, useEffect, useRef } from 'react';
import { StaggerContainer, StaggerItem } from './ScrollReveal';
import slide3 from '../assets/slide3.png';
import slide5 from '../assets/slide5.jpg';
import logoImg from '../assets/logo.png';
import raabitaBannerImg from '../assets/raabita_banner.png';

const SLIDES = [slide3, slide5];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
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
          bgRef.current.style.transform = `translateY(${scrollY * 0.08}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden select-none bg-gov-gray"
      style={{ height: '100vh', minHeight: '600px' }}
    >
      {/* ── Sliding Background Carousel with Parallax ── */}
      <div
        ref={bgRef}
        className="absolute inset-x-0 bottom-0 top-[115px] z-0 will-change-transform"
        style={{
          transform: 'none',
        }}
      >
        <div
          className="flex w-[200%] h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 50}%)` }}
        >
          {SLIDES.map((slide, idx) => (
            <div key={idx} className="w-1/2 h-full relative flex-shrink-0 bg-slate-950 overflow-hidden">
              {/* Full cover background photo */}
              <img
                src={slide}
                alt={`Dal Lake Slide ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Layered Gradient Overlays ── */}
      <div className="absolute inset-x-0 bottom-0 top-[115px] z-10 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 top-[115px] z-10 bg-gradient-to-b from-black/25 via-transparent to-transparent" />

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
          paddingBottom: '80px',
          willChange: 'transform, opacity',
        }}
      >
        <div className="w-full max-w-7xl mx-auto">
          <StaggerContainer staggerChildren={0.15} className="flex flex-col items-start justify-center text-left max-w-3xl">
            {/* "Welcome To" Title */}
            <StaggerItem duration={0.9} y={40}>
              <h2 
                className="text-white font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
              >
                Welcome To
              </h2>
            </StaggerItem>

            {/* Branding Card: JK Samadhan 2.0 + JK Raabita */}
            <StaggerItem duration={1.0} y={50}>
              <div className="bg-[#f8fafc]/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 border border-slate-200/80 max-w-2xl transform hover:scale-[1.01] transition-transform duration-300">
                <img 
                  src={raabitaBannerImg} 
                  alt="JK Samadhan 2.0 | JK Raabita" 
                  className="h-12 sm:h-16 object-contain" 
                />
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* ── Carousel dots (raised slightly for ticker) ── */}
      <div className="absolute bottom-20 left-0 w-full z-20 flex justify-center gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === idx ? 'bg-white w-7' : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ── Bottom ticker bar ── */}
      <div
        className="absolute bottom-0 left-0 w-full z-20 overflow-hidden bg-gradient-to-r from-emerald-500/90 to-green-600/95 backdrop-blur-md border-t border-emerald-400/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-4.5 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          {['Transparency', 'Accountability', 'Accessibility', 'Responsiveness'].map(
            (word, i, arr) => (
              <React.Fragment key={word}>
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-white hover:scale-105 transition-transform duration-300 cursor-default">
                  {word}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-gov-saffron font-black text-sm select-none mx-1">|</span>
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

