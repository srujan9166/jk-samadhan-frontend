import React from 'react';
import heroSectionImg from '../assets/heroSection.jpg';
import raabitaBannerImg from '../assets/raabita_banner.png';

export default function Hero() {
  return (
    <section id="home" className="w-full bg-slate-50 select-none font-sans flex flex-col">
      {/* Banner Image Container */}
      <div className="w-full relative overflow-hidden border-b border-slate-200">
        <img 
          src={heroSectionImg} 
          alt="Citizen Centric Governance - Connecting Citizens &amp; Government" 
          className="w-full h-auto block object-cover"
          style={{ maxHeight: '600px' }}
        />
      </div>

      {/* Raabita Banner Row */}
      <div className="w-full bg-[#f8fafc] py-6 border-b border-slate-200 flex justify-center items-center px-4">
        <img 
          src={raabitaBannerImg} 
          alt="JK Raabita - Way to Connect" 
          className="h-14 md:h-20 w-auto object-contain"
        />
      </div>
    </section>
  );
}
