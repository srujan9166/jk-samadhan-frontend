import React from 'react';
import { Edit, Wrench, Eye, Phone, MapPin, Mail, ArrowUp } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { StaggerContainer, StaggerItem } from './ScrollReveal';

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer id="contact" className="bg-[#0f2e5d] text-white text-xs border-t border-blue-900 relative pt-12 pb-6 text-left select-none font-sans">
      
      {/* Scroll Top Button - Styled as the orange circle arrow on the right side */}
      <div className="absolute right-8 bottom-16 sm:bottom-20 z-20">
        <button 
          onClick={handleScrollTop}
          className="w-12 h-12 rounded-full bg-[#ff5500] hover:bg-orange-600 border-2 border-white/20 text-white flex items-center justify-center shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="h-6 w-6 stroke-[3]" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Grid */}
        <StaggerContainer staggerChildren={0.2} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* LEFT COLUMN: Logo Box and 3 Stats Pills */}
          <StaggerItem className="lg:col-span-5 space-y-4">
            
            {/* White Brand Logo Box */}
            <div className="bg-white p-3 rounded-lg flex items-center gap-3 w-fit shadow-md border border-slate-100">
              <img 
                src={logoImg} 
                alt="JK Samadhan Logo" 
                className="w-8 h-8 object-contain" 
              />
              <div className="flex flex-col">
                <span className="font-display font-black text-xs text-[#0b2240] uppercase tracking-wide">JK Samadhan 2.0</span>
                <span className="text-[9px] text-[#138808] font-bold uppercase tracking-wider">JK Raabita</span>
              </div>
            </div>

            {/* Status Pills */}
            <div className="space-y-2">
              {/* Last Updated */}
              <div className="flex items-center gap-2.5 bg-[#071d3c] border border-blue-900/50 px-3.5 py-1.5 rounded text-[11px] font-mono w-fit min-w-[240px]">
                <Edit className="h-3.5 w-3.5 text-slate-300" />
                <span>Last Updated on :</span>
                <span className="ml-auto font-bold text-slate-200">May 13th, 2026</span>
              </div>

              {/* Build Version */}
              <div className="flex items-center gap-2.5 bg-[#071d3c] border border-blue-900/50 px-3.5 py-1.5 rounded text-[11px] font-mono w-fit min-w-[240px]">
                <Wrench className="h-3.5 w-3.5 text-slate-300" />
                <span>Build Version :</span>
                <span className="ml-auto font-bold text-slate-200">v2.7.13</span>
              </div>

              {/* Visitors */}
              <div className="flex items-center gap-2.5 bg-[#071d3c] border border-blue-900/50 px-3.5 py-1.5 rounded text-[11px] font-mono w-fit min-w-[240px]">
                <Eye className="h-3.5 w-3.5 text-slate-300" />
                <span>Visitors :</span>
                <span className="ml-auto font-bold text-slate-200">22,04,108</span>
              </div>
            </div>

          </StaggerItem>

          {/* RIGHT COLUMN: Contact Details */}
          <StaggerItem className="lg:col-span-7 space-y-6">
            
            {/* Header: Call Contact */}
            <div className="flex items-center flex-wrap gap-2 text-base sm:text-lg font-bold">
              <span>Contact Us :</span>
              <div className="flex items-center gap-1.5 text-white">
                <Phone className="h-5 w-5 text-white fill-white" />
                <span>Call- 1905</span>
              </div>
              <span className="font-normal text-slate-200 text-sm sm:text-base">For Filing Your Grievance.</span>
            </div>

            {/* Office Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Jammu Office */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm underline tracking-wide uppercase">
                  Jammu
                </h4>
                <div className="flex items-start gap-2 text-[11px] text-slate-200 leading-relaxed">
                  <MapPin className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                  <span>
                    Department of Public Grievances Civil Secretariat, Jammu -180001
                  </span>
                </div>
              </div>

              {/* Kashmir Office */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm underline tracking-wide uppercase">
                  Kashmir
                </h4>
                <div className="flex items-start gap-2 text-[11px] text-slate-200 leading-relaxed">
                  <MapPin className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                  <span>
                    Department of Public Grievances Church Lane, Sonwar, Srinagar -190001
                  </span>
                </div>
              </div>

            </div>

            {/* Separator line */}
            <hr className="border-blue-900/40" />

            {/* Support Email */}
            <div className="flex items-center gap-2 text-[11px] text-slate-200">
              <Mail className="h-4 w-4 text-white" />
              <span>jk-grievance[at]jk[dot]gov[dot]in</span>
            </div>

          </StaggerItem>

        </StaggerContainer>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="border-t border-blue-900/60 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-300">
          <span>
            ©2025, Website Developed by BISAG-N.
          </span>
          <span>
            © 2025 Content Owned by Government of J&K
          </span>
        </div>

      </div>
    </footer>
  );
}
