import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StaggerContainer, StaggerItem } from './ScrollReveal';
import jkVideo2 from '../assets/jk_video2.mp4';

const VIDEOS = [jkVideo2];
const SLIDE_DURATION = 8000; // ms per slide

// FIX #6: Constant outside component — stable reference, no re-creation on render
const SLIDE_TRANSITION = 'transform 1s cubic-bezier(0.77, 0, 0.18, 1), opacity 0.6s ease';

export default function Hero() {
  const contentRef = useRef(null);
  const videoRefs = useRef([]);
  const rafRef = useRef(null); // FIX #4: RAF ref for parallax

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);

  // FIX #8: Detect reduced motion once
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // FIX #4: Parallax with requestAnimationFrame to prevent scroll jank
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
          contentRef.current.style.opacity = String(Math.min(1, Math.max(0, 1 - scrollY / 600)));
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Play current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current) {
        vid.currentTime = 0;
        // FIX #8: Respect reduced motion — don't autoplay if user prefers it
        if (!reducedMotion) vid.play().catch(() => { });
      } else {
        vid.pause();
      }
    });
  }, [current, reducedMotion]);

  const goTo = useCallback(
    (index, dir = 1) => {
      if (transitioning) return;
      setDirection(dir);
      setTransitioning(true);
      setPrev(current);
      setCurrent(index);
      setTimeout(() => {
        setPrev(null);
        setTransitioning(false);
      }, 1000);
    },
    [current, transitioning]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % VIDEOS.length, 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + VIDEOS.length) % VIDEOS.length, -1);
  }, [current, goTo]);

  // FIX #1: Single timer effect — always uses the freshest goNext, no stale closures
  useEffect(() => {
    if (reducedMotion) return; // FIX #8: No auto-advance for reduced motion
    const id = setInterval(goNext, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [goNext, reducedMotion]);

  // Handlers no longer need to manage the timer — the effect above handles it
  const handleDot = (i) => goTo(i, i > current ? 1 : -1);
  const handlePrev = () => goPrev();
  const handleNext = () => goNext();

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden select-none"
      style={{ height: '100vh', minHeight: '600px' }}
    >
      {/* ── Video Slides ── */}
      {VIDEOS.map((src, i) => {
        let transform = 'translateX(110%) scale(1.05)';
        let opacity = 0;
        let zIndex = 0;

        if (i === current) {
          transform = 'translateX(0%) scale(1.05)';
          opacity = 1;
          zIndex = 2;
        } else if (i === prev) {
          transform = `translateX(${direction * -110}%) scale(1.05)`;
          opacity = 0.4;
          zIndex = 1;
        }

        return (
          <div
            key={i}
            className="absolute inset-0 will-change-transform"
            // FIX #6: Stable transition reference — no new object on every render
            style={{ transform, opacity, zIndex, transition: SLIDE_TRANSITION }}
          >
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              muted
              playsInline
              loop
              // FIX #5: Only eager-load current + next; defer others to save bandwidth
              preload={
                i === current || i === (current + 1) % VIDEOS.length
                  ? 'auto'
                  : 'none'
              }
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 35%' }}
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>
        );
      })}

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
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
        // FIX #7: Composite opacity changes too, not just transform
        style={{
          paddingTop: '130px',
          paddingBottom: '70px',
          willChange: 'transform, opacity',
        }}
      >
        <StaggerContainer staggerChildren={0.15} className="flex flex-col items-center justify-center">
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


      {/* ── Dot Indicators ── */}
      {VIDEOS.length > 1 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              disabled={transitioning}
              className="group relative flex items-center justify-center disabled:cursor-not-allowed"
              aria-label={`Go to slide ${i + 1}`}
              // FIX #10: Screen readers know which slide is active
              aria-current={i === current ? 'true' : undefined}
            >
              {i === current && (
                <svg className="absolute w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                  />
                  <circle
                    // FIX #2: key={current} forces remount so animation restarts each slide
                    key={current}
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8}`}
                    strokeLinecap="round"
                    style={{ animation: `dotProgress ${SLIDE_DURATION}ms linear forwards` }}
                  />
                </svg>
              )}
              <span
                className={`block rounded-full transition-all duration-300 ${ // FIX #3: duration-300 (valid Tailwind)
                  i === current
                    ? 'w-2.5 h-2.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/70'
                  }`}
              />
            </button>
          ))}
        </div>
      )}

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
        /* FIX #8: Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-animate-in {
            animation: none;
            opacity: 1;
          }
        }
        @keyframes dotProgress {
          from { stroke-dashoffset: ${2 * Math.PI * 8}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}
