import React from 'react';
import { UserCheck, FileText, LineChart, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { premiumEase, TextRevealGroup, TextRevealItem } from './ScrollReveal';

export default function StepsToLodge() {
  const steps = [
    {
      num: '01',
      title: 'Account Registration',
      desc: 'Navigate to the registration portal and create a secure citizen account with your basic personal details.',
      icon: <UserCheck className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-600',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      badge: 'Step 01'
    },
    {
      num: '02',
      title: 'Lodge Grievance',
      desc: 'Log in to select the department, enter grievance details, upload files, and submit to register your grievance.',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-amber-500 to-orange-600',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      badge: 'Step 02'
    },
    {
      num: '03',
      title: 'Real-Time Tracking',
      desc: 'Monitor the status and progress of your filed grievance through your interactive user dashboard.',
      icon: <LineChart className="h-6 w-6" />,
      color: 'from-emerald-500 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      badge: 'Step 03'
    },
    {
      num: '04',
      title: 'Resolve or Appeal',
      desc: 'Receive the official grievance resolution. If you remain unsatisfied, escalate your case with a direct appeal.',
      icon: <CheckCircle2 className="h-6 w-6" />,
      color: 'from-rose-500 to-pink-600',
      glowColor: 'rgba(244, 63, 94, 0.4)',
      badge: 'Step 04'
    }
  ];

  return (
    <section 
      id="how-it-works" 
      className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 border-b border-slate-200 dark:border-slate-900 text-center relative overflow-hidden"
    >
      {/* ── Background Mesh Grid & Glows ── */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(rgba(19,177,131,0.15) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gov-blue-light/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-gov-green/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── Title Block ── */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <TextRevealGroup className="space-y-4">
            <TextRevealItem>
              <span className="text-[11px] font-extrabold text-[#13b183] uppercase tracking-widest bg-[#13b183]/10 px-4 py-2 rounded-full border border-[#13b183]/20">
                Process Flow
              </span>
            </TextRevealItem>
            <TextRevealItem>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight mt-3">
                Steps to Lodge your Grievance
              </h2>
              <div className="w-16 h-1 bg-gov-saffron mx-auto mt-4 rounded-full"></div>
            </TextRevealItem>
            <TextRevealItem>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
                Follow these simple stages to register, monitor, and resolve your grievances with Jammu & Kashmir authorities.
              </p>
            </TextRevealItem>
          </TextRevealGroup>
        </div>

        {/* ── Stepper Timeline Area ── */}
        
        {/* Desktop timeline layout (Horizontal) */}
        <div className="hidden lg:block relative mt-16 min-h-[380px]">
          
          {/* Connecting Progress Line */}
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-[3px] bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden pointer-events-none z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-gov-blue-light via-[#13b183] to-gov-saffron rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.6, ease: premiumEase }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const delay = idx * 0.2;
              return (
                <motion.div
                  key={step.num}
                  className="flex flex-col items-center group relative text-left"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.8, delay, ease: premiumEase }}
                >
                  {/* Node Circle */}
                  <div className="relative z-20">
                    <motion.div 
                      className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none"
                      style={{ background: `linear-gradient(135deg, var(--color-gov-blue-light), var(--color-gov-green))` }}
                    />
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:border-transparent relative z-10">
                      <div className={`w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-white transition-all duration-300 group-hover:bg-gradient-to-br ${step.color} group-hover:shadow-[0_0_15px_${step.glowColor}]`}>
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="w-full bg-white/70 dark:bg-slate-900/35 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-7 rounded-3xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#13b183]/5 dark:hover:shadow-[#13b183]/2 hover:-translate-y-2 hover:border-[#13b183]/45 flex flex-col justify-between mt-8 min-h-[220px]">
                    
                    {/* Top hover accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#13b183]/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                    {/* Step backdrop number */}
                    <div className="absolute -right-4 -bottom-6 font-display font-black text-8xl text-slate-200/40 dark:text-slate-800/10 group-hover:text-[#13b183]/5 transition-colors duration-500 pointer-events-none select-none z-0">
                      {step.num}
                    </div>

                    <div className="relative z-10">
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 group-hover:border-[#13b183]/20 group-hover:bg-[#13b183]/10 group-hover:text-[#13b183] transition-all duration-300">
                        {step.badge}
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-6 mb-2.5 group-hover:text-[#13b183] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold transition-colors duration-300 group-hover:text-slate-700 dark:group-hover:text-slate-350">
                        {step.desc}
                      </p>
                    </div>

                    {/* Arrow right indicator for transition (hidden on last step) */}
                    {idx < 3 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 hidden xl:block group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="h-5 w-5" />
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
          <div className="absolute left-[31px] md:left-[39px] top-6 bottom-6 w-[3px] bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden pointer-events-none z-0">
            <motion.div 
              className="w-full bg-gradient-to-b from-gov-blue-light via-[#13b183] to-gov-saffron rounded-full"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1.6, ease: premiumEase }}
              style={{ transformOrigin: 'top' }}
            />
          </div>

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const delay = idx * 0.15;
              return (
                <motion.div
                  key={step.num}
                  className="flex items-start gap-6 md:gap-8 group relative text-left"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 0.8, delay, ease: premiumEase }}
                >
                  {/* Node Circle */}
                  <div className="relative z-10 shrink-0">
                    <motion.div 
                      className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none"
                      style={{ background: `linear-gradient(135deg, var(--color-gov-blue-light), var(--color-gov-green))` }}
                    />
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg transition-colors duration-300 group-hover:border-transparent relative z-10">
                      <div className={`w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-white transition-all duration-300 group-hover:bg-gradient-to-br ${step.color} group-hover:shadow-[0_0_15px_${step.glowColor}]`}>
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="flex-1 bg-white/70 dark:bg-slate-900/35 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#13b183]/5 dark:hover:shadow-[#13b183]/2 hover:-translate-y-1 hover:border-[#13b183]/45 flex flex-col justify-between">
                    
                    {/* Top hover accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#13b183]/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                    {/* Step backdrop number */}
                    <div className="absolute -right-4 -bottom-6 font-display font-black text-7xl sm:text-8xl text-slate-200/40 dark:text-slate-800/10 group-hover:text-[#13b183]/5 transition-colors duration-500 pointer-events-none select-none z-0">
                      {step.num}
                    </div>

                    <div className="relative z-10">
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 group-hover:border-[#13b183]/20 group-hover:bg-[#13b183]/10 group-hover:text-[#13b183] transition-all duration-300">
                        {step.badge}
                      </span>
                      <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-4 mb-2.5 group-hover:text-[#13b183] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-semibold transition-colors duration-300 group-hover:text-slate-700 dark:group-hover:text-slate-350">
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

