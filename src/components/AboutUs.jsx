import React from 'react';
import { Shield, Eye, Zap, Award, ArrowUpRight } from 'lucide-react';
import aboutBg from '../assets/about_bg.jpg';
import ScrollReveal, { TextRevealGroup, TextRevealItem } from './ScrollReveal';

export default function AboutUs() {
  const pillars = [
    {
      icon: <Eye className="h-6 w-6 text-gov-saffron" />,
      title: "Complete Transparency",
      desc: "Track every step of your application's timeline with live administrative updates."
    },
    {
      icon: <Shield className="h-6 w-6 text-gov-blue-light" />,
      title: "Secure & Encrypted",
      desc: "All citizen files and personal details are protected using industry-standard security."
    },
    {
      icon: <Zap className="h-6 w-6 text-gov-green" />,
      title: "Direct Action",
      desc: "Your grievance is routed directly to the specific department's Nodal Officer."
    }
  ];

  return (
    <section 
      id="about" 
      className="py-24 border-y border-slate-200/50 text-left overflow-hidden relative"
      style={{
        backgroundColor: '#f1f5f9',
        backgroundImage: `
          radial-gradient(at 0% 0%, #ffeedb 0px, transparent 55%),
          radial-gradient(at 50% 100%, #e0f2fe 0px, transparent 65%),
          radial-gradient(at 100% 0%, #dcfce7 0px, transparent 55%)
        `
      }}
    >
      {/* Background image used as a very subtle, high-end background texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{
          backgroundImage: `url(${aboutBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Title and Portal Description */}
          <div className="lg:col-span-5 space-y-8">
            <TextRevealGroup className="space-y-4">
              <TextRevealItem>
                {/* Category tag */}
                <span className="text-[11px] font-extrabold text-gov-blue-light uppercase tracking-widest bg-blue-50/80 px-4 py-2 rounded-full border border-blue-100/60">
                  About the Portal
                </span>
              </TextRevealItem>

              <TextRevealItem>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-slate-800 leading-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gov-blue-light to-gov-saffron">JK Samadhan 2.0</span>
                </h2>
                <div className="w-20 h-1 bg-gov-saffron rounded-full mt-3"></div>
              </TextRevealItem>

              <TextRevealItem>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                  JK SAMADHAN-2.0 is the official Unified Grievance Redressal & Monitoring System of Jammu and Kashmir. Built to empower citizens, it provides a transparent and time-bound mechanism to submit, track, and resolve grievances directly with government authorities.
                </p>
              </TextRevealItem>
            </TextRevealGroup>

            {/* Sub-Brand info and action callout */}
            <ScrollReveal delay={0.3} className="bg-[#f8fafc]/80 backdrop-blur-md border border-slate-200/85 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#13b183]/10 border border-[#13b183]/20 flex items-center justify-center p-1">
                  <Award className="h-5 w-5 text-[#13b183]" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-800">Integrated with JK Raabita</h4>
                  <p className="text-[11px] text-slate-500">Jammu & Kashmir's unified state service tracking platform.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const element = document.querySelector('#contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gov-blue hover:bg-gov-blue-medium rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <span>Read Manual</span>
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </ScrollReveal>
          </div>

          {/* Right Column: Pillars (arranged in a grid or stack) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {pillars.map((pillar, index) => (
                <ScrollReveal 
                  key={index}
                  delay={0.15 * index}
                  className="bg-[#f8fafc]/70 backdrop-blur-md border border-slate-200/70 hover:border-slate-300/90 rounded-2xl p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-5"
                >
                  <div className="p-3 bg-slate-50 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100/80 text-center shrink-0">
                    {pillar.icon}
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="font-display font-bold text-base text-slate-800">
                      {pillar.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
