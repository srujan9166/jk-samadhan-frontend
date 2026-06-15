import React from 'react';
import { Eye, Clock, ShieldCheck, Server, Smartphone, Lock } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem, TextRevealGroup, TextRevealItem } from './ScrollReveal';

export default function Features() {
  const features = [
    {
      title: 'Transparent Workflow',
      desc: 'Every action taken by officers is recorded and visible to citizens. No hidden steps or unexplained delays.',
      icon: <Eye className="h-5 w-5 text-gov-saffron" />
    },
    {
      title: 'Real-Time Tracking',
      desc: 'Check live progress and read administrative logs on your grievance at any time, 24/7.',
      icon: <Clock className="h-5 w-5 text-gov-blue-light" />
    },
    {
      title: 'Multi-Department Support',
      desc: 'Seamlessly routed across 54+ departments including PHE, PDD, R&B, Revenue, and Municipalities.',
      icon: <Server className="h-5 w-5 text-gov-green" />
    },
    {
      title: 'Secure Data Handling',
      desc: 'Citizen data is encrypted using modern protocols to ensure complete confidentiality and security.',
      icon: <Lock className="h-5 w-5 text-indigo-500" />
    },
    {
      title: 'Mobile-Friendly Access',
      desc: 'Optimized for mobile browsers so you can file grievances and upload photo evidence on the go.',
      icon: <Smartphone className="h-5 w-5 text-pink-500" />
    }
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Summary & Image/Badge Showcase */}
          <TextRevealGroup className="lg:col-span-5 space-y-6 text-left">
            <TextRevealItem>
              <span className="text-xs font-bold text-gov-green uppercase tracking-widest bg-emerald-50 dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-slate-800">
                Key Features
              </span>
            </TextRevealItem>
            <TextRevealItem>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
                Designed for Speed, Security, and Clarity
              </h2>
              <div className="w-16 h-1 bg-gov-saffron rounded-full mt-2"></div>
            </TextRevealItem>
            <TextRevealItem>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                JK Samadhan leverages digital infrastructure to replace slow manual paperwork with a secure, automated database system. Our priority is public satisfaction through transparent monitoring.
              </p>
            </TextRevealItem>
 
            {/* Showcase Security Card */}
            <TextRevealItem>
              <div className="bg-gradient-to-br from-gov-blue to-slate-900 text-white rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                <div className="flex gap-4">
                  <div className="p-3 bg-white/10 rounded-xl flex-shrink-0 self-start">
                    <ShieldCheck className="h-6 w-6 text-gov-saffron" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-sm text-white">SSL Encrypted Portal</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All file attachments and personal identification records are transmitted over an encrypted channels to protect privacy.
                    </p>
                  </div>
                </div>
              </div>
            </TextRevealItem>
          </TextRevealGroup>
 
          {/* Right Side: Features Grid */}
          <StaggerContainer staggerChildren={0.15} className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <StaggerItem 
                key={idx}
                className="h-full"
              >
                <div 
                  className="h-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gov-blue-light/25 group text-left"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

        </div>
      </div>
    </section>
  );
}
