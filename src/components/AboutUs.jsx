import React from 'react';
import vaishnoDeviImg from '../assets/vaishno_devi.png';
import ScrollReveal from './ScrollReveal';

export default function AboutUs() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 text-left overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Styled Vaishno Devi Cutout Image */}
          <div className="lg:col-span-5 flex justify-center">
            <ScrollReveal className="w-full max-w-[400px]">
              <div className="relative aspect-[4/3] rounded-tl-[100px] rounded-br-[100px] rounded-tr-[24px] rounded-bl-[24px] overflow-hidden shadow-2xl border-4 border-slate-50 dark:border-slate-900">
                <img 
                  src={vaishnoDeviImg} 
                  alt="Vaishno Devi Temple Hills in J&K" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                />
                {/* Soft overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"></div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: About Us Content */}
          <div className="lg:col-span-7 space-y-6 relative">
            <ScrollReveal delay={200}>
              {/* Title */}
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                  About Us
                </h2>
                <div className="w-16 h-1 bg-gov-saffron rounded-full"></div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              {/* Official Logo Banner Badge */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 w-fit">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm text-gov-blue dark:text-white tracking-tighter">JK Samadhan 2.0</span>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                  <span className="font-display font-bold text-sm text-gov-saffron tracking-tighter flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gov-green"></span>
                    JK Raabita
                  </span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              {/* Paragraph Text */}
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Welcome To JK SAMADHAN-A Unified Grievance Redressal & Monitoring System, Empowering Citizens Of Jammu And Kashmir To Register And Track Grievances for Subsequent Redressal.
              </p>
            </ScrollReveal>

            {/* Decorative Hand Submission SVG (placed beside the text on desktop) */}
            <div className="hidden sm:block absolute right-4 bottom-2 opacity-15 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-32 h-32 text-gov-blue dark:text-slate-400">
                {/* Hand silhouette holding card */}
                <path d="M10,80 L30,55 L45,55 L35,80 Z" fill="currentColor" />
                <rect x="35" y="30" width="30" height="40" rx="4" fill="currentColor" transform="rotate(15 50 50)" />
                <path d="M60,50 C65,45 75,45 80,50 L90,65 L80,90 L40,90 Z" fill="currentColor" />
              </svg>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
