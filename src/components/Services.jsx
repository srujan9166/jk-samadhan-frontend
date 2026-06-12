import React, { useState } from 'react';
import { PlusCircle, Search, Building2, MessageSquareText, HelpCircle, BellRing, Info, ChevronRight, X } from 'lucide-react';

export default function Services({ onLodgeClick, onTrackClick }) {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 'lodge',
      title: 'Lodge Grievance',
      desc: 'Submit your complaints regarding public services directly to administrative officers.',
      icon: <PlusCircle className="h-6 w-6 text-gov-saffron" />,
      action: onLodgeClick,
      badge: 'Popular',
      color: 'border-l-gov-saffron'
    },
    {
      id: 'track',
      title: 'Track Application',
      desc: 'Monitor the status of your grievance in real time using your unique reference number.',
      icon: <Search className="h-6 w-6 text-gov-blue-light" />,
      action: onTrackClick,
      color: 'border-l-gov-blue-light'
    },
    {
      id: 'directory',
      title: 'Department Directory',
      desc: 'Access contact details and nodal officers for all active departments in J&K government.',
      icon: <Building2 className="h-6 w-6 text-gov-green" />,
      action: () => setSelectedService({
        title: 'Department Directory Info',
        content: 'Directory features contact detail mappings for all 54+ administrative offices. For immediate queries, contact Jammu Secretariat (0191-2546123) or Srinagar Secretariat (0194-2506123).',
      }),
      color: 'border-l-gov-green'
    },
    {
      id: 'feedback',
      title: 'Public Feedback',
      desc: 'Rate resolved complaints and share suggestions on improving government portal redressal.',
      icon: <MessageSquareText className="h-6 w-6 text-pink-500" />,
      action: () => setSelectedService({
        title: 'Public Feedback Desk',
        content: 'We value your feedback. Once your grievance is resolved, you will receive an SMS survey. You can also file suggestions directly at support-samadhan@jk.gov.in.',
      }),
      color: 'border-l-pink-500'
    },
    {
      id: 'help',
      title: 'Help & Support',
      desc: 'Read user manuals, watch guide videos, and find quick tips to submit complaints.',
      icon: <HelpCircle className="h-6 w-6 text-indigo-500" />,
      action: () => setSelectedService({
        title: 'Help & Support Desk',
        content: 'Our citizen helpdesk is available from 9:30 AM to 5:30 PM on all working days. You can download the PDF User Manual from our Downloads section or call 14430.',
      }),
      color: 'border-l-indigo-500'
    },
    {
      id: 'notifications',
      title: 'Notifications & Updates',
      desc: 'Read official circulars, citizen awareness updates, and monthly portal newsletters.',
      icon: <BellRing className="h-6 w-6 text-amber-500" />,
      action: () => setSelectedService({
        title: 'Latest Updates',
        content: 'June 2026: Grievance redressal timeline reduced from 30 days to 15 days for critical civic issues. Over 22,000 cases resolved successfully last month.',
      }),
      color: 'border-l-amber-500'
    }
  ];

  return (
    <section id="services" className="py-20 bg-slate-50 dark:bg-slate-900/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-gov-blue-light uppercase tracking-widest bg-blue-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-slate-800">
            Citizen Services
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            What would you like to do today?
          </h2>
          <div className="w-16 h-1 bg-gov-saffron mx-auto rounded-full"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Select one of the online channels below to submit grievances, check processing status, or get direct support from administrators.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={service.action}
              className={`bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 border-l-4 ${service.color} rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  {service.badge && (
                    <span className="bg-gov-saffron/10 text-gov-saffron border border-gov-saffron/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {service.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-gov-blue-medium transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gov-blue-medium dark:text-blue-400 mt-6 group-hover:translate-x-1 transition-transform self-start">
                Proceed Now <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Detail Overlay Modal (for secondary services) */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-slate-100 dark:border-slate-800 animate-scaleUp">
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-gov-blue-light" />
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">{selectedService.title}</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedService.content}
              </p>
              <button 
                onClick={() => setSelectedService(null)}
                className="mt-6 w-full py-2 bg-gov-blue hover:bg-gov-blue-medium text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
