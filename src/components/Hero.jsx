import React from 'react';
import { Landmark, Handshake } from 'lucide-react';
import heroBg from '../assets/jk_hero_bg.png';

export default function Hero({ onLodgeClick, onTrackClick }) {
  return (
    <section 
      id="home" 
      className="relative w-full min-h-[calc(100vh-170px)] md:h-[calc(100vh-170px)] overflow-hidden select-none font-sans flex flex-col justify-center py-8 md:py-12"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Jammu &amp; Kashmir Government Secretariat" 
          className="w-full h-full object-cover pointer-events-none select-none"
        />
        {/* Premium navy/dark-blue overlay that matches the primary color #164581 to reduce brightness and ensure high text contrast */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#164581]/90 via-[#0b2240]/80 to-[#164581]/90 z-10 mix-blend-multiply opacity-95" 
          aria-hidden="true"
        ></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-4">
        
        {/* Heading */}
        <h1 
          className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-medium tracking-normal leading-tight font-serif mb-8"
          style={{ 
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)' 
          }}
        >
          Welcome To
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full max-w-lg px-4">
          <button
            onClick={onLodgeClick}
            className="flex-1 px-8 py-4 bg-[#f06e30] hover:bg-[#d8581b] text-white font-bold rounded-xl shadow-lg transition-all duration-250 cursor-pointer text-base md:text-lg flex items-center justify-center gap-2.5 hover:scale-[1.02] border-0"
          >
            <Landmark className="h-5 w-5 text-white" />
            <span>JK Samadhan 2.0</span>
          </button>
          <button
            onClick={onTrackClick}
            className="flex-1 px-8 py-4 bg-[#164581] hover:bg-[#0f2e56] text-white font-bold rounded-xl shadow-lg transition-all duration-250 cursor-pointer text-base md:text-lg flex items-center justify-center gap-2.5 hover:scale-[1.02] border-0"
          >
            <Handshake className="h-5 w-5 text-[#ff9933]" />
            <span>JK Raabita</span>
          </button>
        </div>

      </div>

    </section>
  );
}

