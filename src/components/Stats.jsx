import React, { useState, useEffect } from 'react';
import { Layers, FileText, CheckCircle, HeartHandshake } from 'lucide-react';

export default function Stats() {
  const [grievances, setGrievances] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [departments, setDepartments] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 50;
    const stepTime = duration / steps;

    const targetGrievances = 248210;
    const targetResolved = 234589;
    const targetDepartments = 54;
    const targetSatisfaction = 92;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      setGrievances(Math.min(Math.round((targetGrievances / steps) * currentStep), targetGrievances));
      setResolved(Math.min(Math.round((targetResolved / steps) * currentStep), targetResolved));
      setDepartments(Math.min(Math.round((targetDepartments / steps) * currentStep), targetDepartments));
      setSatisfaction(Math.min(Math.round((targetSatisfaction / steps) * currentStep), targetSatisfaction));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const statItems = [
    {
      id: 'grievances',
      label: 'Grievances Received',
      value: grievances,
      suffix: '+',
      icon: <FileText className="h-6 w-6 text-gov-saffron" />,
      colorClass: 'from-amber-500/10 to-transparent',
      borderClass: 'hover:border-gov-saffron/50'
    },
    {
      id: 'resolved',
      label: 'Cases Resolved',
      value: resolved,
      suffix: '+',
      icon: <CheckCircle className="h-6 w-6 text-gov-green" />,
      colorClass: 'from-emerald-500/10 to-transparent',
      borderClass: 'hover:border-gov-green/50'
    },
    {
      id: 'departments',
      label: 'Active Departments',
      value: departments,
      suffix: '',
      icon: <Layers className="h-6 w-6 text-gov-blue-light" />,
      colorClass: 'from-blue-500/10 to-transparent',
      borderClass: 'hover:border-gov-blue-light/50'
    },
    {
      id: 'satisfaction',
      label: 'Citizen Satisfaction',
      value: satisfaction,
      suffix: '%',
      icon: <HeartHandshake className="h-6 w-6 text-pink-500" />,
      colorClass: 'from-pink-500/10 to-transparent',
      borderClass: 'hover:border-pink-500/50'
    }
  ];

  return (
    <section id="about" className="py-12 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          
          {statItems.map((item) => (
            <div 
              key={item.id}
              className={`bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between relative overflow-hidden ${item.borderClass}`}
            >
              {/* Background Accent Gradient */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${item.colorClass} rounded-full pointer-events-none`}></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live Status
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl md:text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline">
                  {item.id === 'satisfaction' || item.id === 'departments' 
                    ? item.value 
                    : formatNumber(item.value)}
                  <span className="text-gov-saffron ml-0.5">{item.suffix}</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                  {item.label}
                </p>
              </div>

              {/* Decorative progress bar at the bottom */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.id === 'grievances' ? 'bg-gov-saffron w-full' :
                    item.id === 'resolved' ? 'bg-gov-green w-[94.5%]' :
                    item.id === 'departments' ? 'bg-gov-blue-light w-[80%]' :
                    'bg-pink-500 w-[92%]'
                  }`}
                ></div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
