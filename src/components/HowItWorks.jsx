import React from 'react';
import { UserPlus, FileEdit, ClipboardList, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Register/Login',
      desc: 'Create an account using your mobile number or email. Existing users can log in directly.',
      icon: <UserPlus className="h-6 w-6 text-white" />,
      bgColor: 'bg-gov-blue-light'
    },
    {
      num: '02',
      title: 'Submit Grievance',
      desc: 'Fill out the multi-step form detailing your concern, select the relevant department, and submit.',
      icon: <FileEdit className="h-6 w-6 text-white" />,
      bgColor: 'bg-gov-saffron'
    },
    {
      num: '03',
      title: 'Department Review',
      desc: 'Your grievance is forwarded to the designated Nodal Officer who verifies and assigns it to field experts.',
      icon: <ClipboardList className="h-6 w-6 text-white" />,
      bgColor: 'bg-indigo-600'
    },
    {
      num: '04',
      title: 'Resolution & Feedback',
      desc: 'The issue is resolved on the ground, a status report is uploaded, and you provide satisfaction feedback.',
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      bgColor: 'bg-gov-green'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900 relative">
      {/* Decorative timeline background line for large screens */}
      <div className="absolute top-[52%] left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-900 hidden lg:block pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-gov-saffron uppercase tracking-widest bg-amber-50 dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-amber-100 dark:border-slate-800">
            Process Workflow
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Four Steps to Redressal
          </h2>
          <div className="w-16 h-1 bg-gov-blue mx-auto rounded-full"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            How the JK Samadhan portal handles your submission from initial registration to final on-ground resolution.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-900 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-md relative group"
            >
              {/* Step indicator tag */}
              <span className="absolute top-4 right-4 font-mono font-bold text-slate-300 dark:text-slate-700 text-3xl group-hover:text-gov-saffron transition-colors">
                {step.num}
              </span>

              {/* Icon container */}
              <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center shadow-md mb-6 transform group-hover:rotate-6 transition-transform`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                {step.title}
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>

              {/* Connecting line indicators for card-level links */}
              {index < 3 && (
                <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-200 hidden lg:block z-20 pointer-events-none group-hover:bg-gov-saffron transition-colors"></div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
