import React from 'react';
import { UserCheck, FileText, LineChart, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { premiumEase, TextRevealGroup, TextRevealItem } from './ScrollReveal';

export default function StepsToLodge() {
  const steps = [
    {
      num: '01',
      title: 'Account Registration',
      desc: 'Access the citizen registration portal and establish a secure, verified account using your basic credentials.',
      icon: <UserCheck className="h-5 w-5 text-gov-green" />,
      badge: 'Stage 01'
    },
    {
      num: '02',
      title: 'Lodge Grievance',
      desc: 'Select the department, specify your grievance details, upload supporting documentation, and submit.',
      icon: <FileText className="h-5 w-5 text-gov-green" />,
      badge: 'Stage 02'
    },
    {
      num: '03',
      title: 'Real-Time Tracking',
      desc: 'Monitor the status of your petition stage-by-stage through your personalized dashboard.',
      icon: <LineChart className="h-5 w-5 text-gov-green" />,
      badge: 'Stage 03'
    },
    {
      num: '04',
      title: 'Resolution or Appeal',
      desc: 'Review the official administrative resolution, with the option to escalate your case if unsatisfied.',
      icon: <CheckCircle2 className="h-5 w-5 text-gov-green" />,
      badge: 'Stage 04'
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="py-24 bg-gradient-to-b from-[#e8edf4] to-[#f8fafc] border-t border-slate-200/50 text-center relative overflow-hidden"
    >
      {/* ── Premium Mesh Background Texture ── */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(rgba(16,185,129,0.05) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>
      
      {/* ── Glowing backdrop orbs to blend with Hero and AboutUs ── */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-emerald-100/40 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-sky-100/50 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-orange-50/60 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── Title Block ── */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <TextRevealGroup className="space-y-4">
            <TextRevealItem>
              <span className="text-[10px] font-extrabold text-gov-green uppercase tracking-widest bg-emerald-50/80 px-4 py-2 rounded-full border border-emerald-100/60">
                Process Overview
              </span>
            </TextRevealItem>
            <TextRevealItem>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 leading-tight tracking-tight mt-3">
                Steps to Lodge your Grievance
              </h2>
              <div className="w-16 h-[2px] bg-gov-green mx-auto mt-4 rounded-full"></div>
            </TextRevealItem>
            <TextRevealItem>
              <p className="text-slate-650 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
                Follow these simple stages to register, monitor, and resolve your grievances with Jammu & Kashmir authorities.
              </p>
            </TextRevealItem>
          </TextRevealGroup>
        </div>

        {/* ── Stepper Timeline Area ── */}
        
        {/* Desktop timeline layout (Horizontal) */}
        <div className="hidden lg:block relative mt-16 min-h-[380px]">
          
          {/* Connecting Progress Line */}
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-[2px] bg-slate-200 rounded-full overflow-hidden pointer-events-none z-0">
            <motion.div 
              className="h-full bg-gov-green rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.4, ease: premiumEase }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const delay = idx * 0.15;
              return (
                <motion.div
                  key={step.num}
                  className="flex flex-col items-center group relative text-left"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.8, delay, ease: premiumEase }}
                >
                  {/* Node Circle */}
                  <div className="relative z-20">
                    <div className="w-14 h-14 rounded-full bg-[#f8fafc] border border-slate-250 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:border-gov-green relative z-10 group-hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center transition-all duration-350 group-hover:bg-gov-green/5">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="w-full bg-[#f8fafc]/80 backdrop-blur-md border border-slate-250/70 p-8 rounded-2xl relative overflow-hidden transition-all duration-400 hover:shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:border-gov-green/40 hover:-translate-y-1.5 flex flex-col justify-between mt-8 min-h-[220px]">
                    
                    {/* Step backdrop number */}
                    <div className="absolute -right-2 -bottom-4 font-display font-bold text-7xl text-slate-200/40 group-hover:text-slate-300/50 transition-colors duration-400 pointer-events-none select-none z-0">
                      {step.num}
                    </div>

                    <div className="relative z-10">
                      <span className="text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-50/80 text-slate-500 border border-slate-200/60 group-hover:border-gov-green/20 group-hover:bg-gov-green/5 group-hover:text-gov-green transition-all duration-300">
                        {step.badge}
                      </span>
                      <h3 className="font-display font-bold text-base text-slate-800 mt-5 mb-2 group-hover:text-gov-green transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>

                    {/* Arrow right indicator for transition (hidden on last step) */}
                    {idx < 3 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hidden xl:block group-hover:translate-x-1 transition-transform duration-300 group-hover:text-gov-green">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet timeline layout (Vertical) */}
        <div className="block lg:hidden relative mt-12 pl-4 md:pl-8">
          
          {/* Vertical progress connection line */}
          <div className="absolute left-[27px] md:left-[35px] top-6 bottom-6 w-[2px] bg-slate-200 rounded-full overflow-hidden pointer-events-none z-0">
            <motion.div 
              className="w-full bg-gov-green rounded-full"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1.4, ease: premiumEase }}
              style={{ transformOrigin: 'top' }}
            />
          </div>

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const delay = idx * 0.12;
              return (
                <motion.div
                  key={step.num}
                  className="flex items-start gap-6 md:gap-8 group relative text-left"
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 0.8, delay, ease: premiumEase }}
                >
                  {/* Node Circle */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#f8fafc] border border-slate-250 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:border-gov-green relative z-10 group-hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center transition-all duration-350 group-hover:bg-gov-green/5">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="flex-1 bg-[#f8fafc]/80 backdrop-blur-md border border-slate-250/70 p-6 sm:p-7 rounded-2xl relative overflow-hidden transition-all duration-400 hover:shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:border-gov-green/40 hover:-translate-y-1">
                    
                    {/* Step backdrop number */}
                    <div className="absolute -right-2 -bottom-4 font-display font-bold text-7xl sm:text-8xl text-slate-200/40 group-hover:text-slate-300/50 transition-colors duration-400 pointer-events-none select-none z-0">
                      {step.num}
                    </div>

                    <div className="relative z-10">
                      <span className="text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-50/80 text-slate-500 border border-slate-200/60 group-hover:border-gov-green/20 group-hover:bg-gov-green/5 group-hover:text-gov-green transition-all duration-300">
                        {step.badge}
                      </span>
                      <h3 className="font-display font-bold text-base text-slate-800 mt-4 mb-2 group-hover:text-gov-green transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
