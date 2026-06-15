import React from 'react';
import { Lightbulb, Mail, BarChart3, Settings } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem, TextRevealGroup, TextRevealItem } from './ScrollReveal';

export default function StepsToLodge() {
  const steps = [
    {
      num: 'Step 01',
      desc: 'Navigate to the registration button and create user login by filling in basic details.',
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      colorClass: 'bg-purple-600 border-purple-100 shadow-purple-600/20',
      labelColor: 'text-purple-600'
    },
    {
      num: 'Step 02',
      desc: 'Login and proceed to register your grievance by selecting the relevant category of grievance and click on submit to file the grievance.',
      icon: <Mail className="h-6 w-6 text-white" />,
      colorClass: 'bg-orange-500 border-orange-100 shadow-orange-500/20',
      labelColor: 'text-orange-500'
    },
    {
      num: 'Step 03',
      desc: 'Track the status of the grievance in the user dashboard.',
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      colorClass: 'bg-teal-500 border-teal-100 shadow-teal-500/20',
      labelColor: 'text-teal-500'
    },
    {
      num: 'Step 04',
      desc: 'Appeal in case the user is not satisfied with the resolution.',
      icon: <Settings className="h-6 w-6 text-white" />,
      colorClass: 'bg-rose-500 border-rose-100 shadow-rose-500/20',
      labelColor: 'text-rose-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-900 text-center relative overflow-hidden">
      {/* Faded winter landscape background effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1476&auto=format&fit=crop')` }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="mb-16 text-left">
          <TextRevealGroup>
            <TextRevealItem>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gov-blue-medium dark:text-blue-400 flex items-center gap-2">
                Steps To Lodge The Grievance
                <span className="text-gov-saffron text-xl font-mono">»»»»»</span>
              </h2>
              <div className="w-16 h-1 bg-gov-saffron mt-2 rounded-full"></div>
            </TextRevealItem>
          </TextRevealGroup>
        </div>

        {/* Stepper Timeline Area */}
        <div className="relative min-h-[350px] flex flex-col justify-center">
          
          {/* Curved Wavy SVG Timeline Line (Visible on desktop) */}
          <div className="absolute inset-x-0 top-[28%] h-24 hidden lg:block pointer-events-none z-0">
            <svg viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none" className="w-full h-full text-slate-300 dark:text-slate-700">
              {/* Smooth Sine Wave Wavy Path connecting steps */}
              <path 
                d="M 50,50 C 175,120 175,-20 300,50 C 425,120 425,-20 550,50 C 675,120 675,-20 800,50 C 880,85 920,85 950,50" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeDasharray="6,6"
              />
            </svg>
          </div>

          {/* Steps Grid */}
          <StaggerContainer staggerChildren={0.15} className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              // Alternating height offsets to mimic the wave path in the screenshot on desktop
              const offsetClass = idx % 2 === 0 ? 'lg:translate-y-6' : 'lg:-translate-y-6';

              return (
                <StaggerItem 
                  key={step.num}
                  className={`flex flex-col items-center space-y-4 group transition-all duration-300 ${offsetClass}`}
                >
                  {/* Step Node Circle */}
                  <div className={`w-16 h-16 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${step.colorClass}`}>
                    {step.icon}
                  </div>

                  {/* Step Label */}
                  <div className="text-center">
                    <span className={`font-display font-extrabold text-sm sm:text-base tracking-wide ${step.labelColor}`}>
                      {step.num}
                    </span>
                  </div>

                  {/* Description Box */}
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px] mx-auto text-center font-semibold bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:border-slate-900 group-hover:shadow-sm transition-shadow">
                    {step.desc}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

        </div>

      </div>
    </section>
  );
}
