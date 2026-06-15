import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, Info, ChevronRight, Apple, Play } from 'lucide-react';
import logoImg from '../assets/logo.png';
import mobileBgVideo from '../assets/jk_mobile_section.mp4';
import ScrollReveal, { StaggerContainer, StaggerItem, TextRevealGroup, TextRevealItem } from './ScrollReveal';

export default function MobileShowcase() {
  const [activeTab, setActiveTab] = useState('splash');

  const tabs = [
    { id: 'splash', label: 'Splash Screen' },
    { id: 'login', label: 'Login Module - JK Samadhan & JK Rabita' },
    { id: 'lodge', label: 'Module to Lodge Grievance, Appeal & view all Grievance' },
    { id: 'list', label: 'All submitted Grievances' },
    { id: 'detail', label: 'Detailed view of submitted Grievances' }
  ];

  return (
    <section className="relative py-20 overflow-hidden text-left">

      {/* ── Video Background ── */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectPosition: 'center center' }}
      >
        <source src={mobileBgVideo} type="video/mp4" />
      </video>

      {/* ── Gradient Overlays (same style as Hero) ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0c1a3a]/70 via-transparent to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      {/* ── Content wrapper sits above video ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-12">
          <TextRevealGroup>
            <TextRevealItem>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2">
                Visit our Mobile Application
                <span className="text-[#13b183] text-xl font-mono">»»»»»</span>
              </h2>
              <div className="w-16 h-1 bg-[#13b183] mt-2 rounded-full"></div>
            </TextRevealItem>
          </TextRevealGroup>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Download & Selection Tabs */}
          <StaggerContainer className="lg:col-span-7 space-y-8">
            
            {/* Download Card */}
            <StaggerItem>
              <div className="bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1 z-10">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl">Download Our App</h3>
                  <p className="text-xs text-white/80 max-w-sm">
                    Get the JK Samadhan & JK Raabita app for quick grievance lodging and offline tracking directly on your mobile device.
                  </p>
                </div>

                {/* App Badge Buttons */}
                <div className="flex gap-2.5 z-10 w-full sm:w-auto">
                  <a 
                    href="#" 
                    className="flex-1 sm:flex-initial bg-black hover:bg-black/90 px-3.5 py-2 rounded-lg flex items-center gap-2 text-white border border-white/10 transition-all text-left"
                  >
                    <Apple className="h-5 w-5 fill-current" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">Download on the</span>
                      <span className="text-xs font-bold font-sans tracking-tight block -mt-0.5">App Store</span>
                    </div>
                  </a>
                  <a 
                    href="#" 
                    className="flex-1 sm:flex-initial bg-black hover:bg-black/90 px-3.5 py-2 rounded-lg flex items-center gap-2 text-white border border-white/10 transition-all text-left"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">GET IT ON</span>
                      <span className="text-xs font-bold font-sans tracking-tight block -mt-0.5">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>
            </StaggerItem>

            {/* Selection Buttons */}
            <div className="space-y-3">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <StaggerItem key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                        isActive
                          ? 'bg-[#0c408f]/80 border-[#13b183] text-white shadow-md backdrop-blur-sm'
                          : 'bg-white/8 border-white/15 text-white/80 hover:border-white/30 hover:bg-white/12 backdrop-blur-sm'
                      }`}
                    >
                      <span className="font-semibold text-xs sm:text-sm pr-4">{tab.label}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-[#13b183]' : 'text-white/40'}`} />
                    </button>
                  </StaggerItem>
                );
              })}
            </div>

          </StaggerContainer>

          {/* Right Column: Phone Mockup Frame */}
          <ScrollReveal delay={0.2} className="lg:col-span-5 flex justify-center">
            <div className="relative w-[280px] h-[560px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden">
              
              {/* Phone Speaker Notch */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 bg-slate-900 rounded-[30px] overflow-hidden relative flex flex-col text-white text-[11px]">
                
                {/* Status Bar */}
                <div className="h-6 px-4 pt-1.5 flex justify-between text-[9px] text-slate-400 bg-slate-950/40 z-10 select-none font-mono">
                  <span>12:00 PM</span>
                  <div className="flex gap-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* DYNAMIC SCREEN INTERACTION CONTENT */}
                
                {/* 1. Splash Screen */}
                {activeTab === 'splash' && (
                  <div className="flex-1 bg-gov-blue flex flex-col justify-between items-center p-6 text-center select-none animate-fadeIn">
                    <div className="mt-8 flex flex-col items-center gap-1.5">
                      {/* Logo Emblem */}
                      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center p-1 border border-white/20">
                        <img 
                          src={logoImg} 
                          alt="JK Samadhan Logo" 
                          className="w-10 h-10 object-contain" 
                        />
                      </div>
                      <div className="flex items-baseline">
                        <span className="font-display font-extrabold text-sm tracking-tight text-white">JK</span>
                        <span className="font-display font-extrabold text-sm tracking-tight text-gov-saffron">Samadhan 2.0</span>
                      </div>
                      <span className="text-[7px] text-slate-300 font-bold uppercase tracking-wider">Government of Jammu & Kashmir</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      {/* Brand Logo Flower */}
                      <img 
                        src={logoImg} 
                        alt="JK Samadhan Logo" 
                        className="w-16 h-16 object-contain" 
                      />
                      <div>
                        <h4 className="font-display font-bold text-xs">Unified Grievance System</h4>
                        <p className="text-[8px] text-slate-300 mt-1 max-w-[160px] mx-auto">
                          Redressal & Monitoring Portal for all administrative departments.
                        </p>
                      </div>
                    </div>

                    <div className="mb-2 text-[7px] text-slate-400">
                      Powered by NIC J&K State Centre
                    </div>
                  </div>
                )}

                {/* 2. Login Screen */}
                {activeTab === 'login' && (
                  <div className="flex-1 bg-slate-950 flex flex-col p-4 justify-between animate-fadeIn">
                    <div className="space-y-4 mt-6">
                      <div className="text-center space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-gov-saffron font-bold">Portal Login</span>
                        <h4 className="font-display font-extrabold text-xs text-white">JK Samadhan & JK Rabita</h4>
                      </div>
                      
                      <div className="space-y-2.5 pt-2">
                        <div>
                          <label className="block text-[8px] font-semibold text-slate-400 mb-1">Mobile Number</label>
                          <input 
                            type="text" 
                            disabled 
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[9px] outline-none text-slate-300"
                            placeholder="+91 Mobile Number" 
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-semibold text-slate-400 mb-1">Password</label>
                          <input 
                            type="password" 
                            disabled 
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[9px] outline-none text-slate-300"
                            placeholder="******" 
                          />
                        </div>
                      </div>

                      <button type="button" className="w-full py-1.5 bg-gov-blue-light hover:bg-blue-700 text-white rounded-lg font-semibold text-[9px]">
                        Log In
                      </button>

                      <div className="flex justify-between items-center text-[7px] text-slate-500">
                        <a href="#">Forgot Password?</a>
                        <a href="#" className="text-gov-saffron font-bold">Register Now</a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-800"></div>
                        <span className="flex-shrink mx-2 text-[7px] text-slate-600 font-bold uppercase">or</span>
                        <div className="flex-grow border-t border-slate-800"></div>
                      </div>
                      <button type="button" className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-lg font-semibold text-[9px]">
                        Login via SMS OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Lodge Form Screen */}
                {activeTab === 'lodge' && (
                  <div className="flex-1 bg-slate-950 flex flex-col p-4 animate-fadeIn overflow-y-auto">
                    <div className="space-y-3 mt-6">
                      <div className="border-b border-slate-900 pb-2">
                        <h4 className="font-display font-bold text-xs text-white">Lodge Grievance</h4>
                        <p className="text-[7px] text-slate-500">Fill in details to submit concern</p>
                      </div>

                      <div className="space-y-2.5 text-left">
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">Department</label>
                          <select disabled className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[8px] text-slate-400">
                            <option>Jal Shakti Department</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">Category</label>
                          <select disabled className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[8px] text-slate-400">
                            <option>Pipeline Leakage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">Subject</label>
                          <input 
                            type="text" 
                            disabled 
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[8px] text-slate-300"
                            placeholder="e.g. Water leak in lane 3" 
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">Description</label>
                          <textarea 
                            disabled 
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[8px] text-slate-300 h-10 resize-none"
                            placeholder="Explain details..." 
                          />
                        </div>
                      </div>

                      <button type="button" className="w-full py-1.5 bg-gov-saffron hover:bg-amber-600 text-slate-950 font-bold rounded text-[9px] mt-2">
                        Submit Grievance
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Grievance List Screen */}
                {activeTab === 'list' && (
                  <div className="flex-1 bg-slate-950 flex flex-col p-4 animate-fadeIn overflow-y-auto">
                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <div>
                          <h4 className="font-display font-bold text-xs text-white">My Grievances</h4>
                          <p className="text-[7px] text-slate-500">History of submitted cases</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50 text-[7px] font-bold">Total: 3</span>
                      </div>

                      {/* Grievance Item 1 */}
                      <div className="bg-slate-900 border border-slate-850 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[8px] text-slate-300 font-bold">JK-482019</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[6px] font-bold uppercase">Resolved</span>
                        </div>
                        <p className="text-[8px] text-slate-400 font-semibold truncate">Bemina Water Supply Shortage</p>
                        <span className="text-[6px] text-slate-500 block">Closed on May 18, 2026</span>
                      </div>

                      {/* Grievance Item 2 */}
                      <div className="bg-slate-900 border border-slate-850 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[8px] text-slate-300 font-bold">JK-992011</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[6px] font-bold uppercase">In Progress</span>
                        </div>
                        <p className="text-[8px] text-slate-400 font-semibold truncate">Channi Himmat Transformer</p>
                        <span className="text-[6px] text-slate-500 block">Submitted on June 01, 2026</span>
                      </div>

                      {/* Grievance Item 3 */}
                      <div className="bg-slate-900 border border-slate-850 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[8px] text-slate-300 font-bold">JK-102948</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 text-[6px] font-bold uppercase">Submitted</span>
                        </div>
                        <p className="text-[8px] text-slate-400 font-semibold truncate">Potholes on Highway Lane</p>
                        <span className="text-[6px] text-slate-500 block">Submitted on June 05, 2026</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Detailed View Timeline Screen */}
                {activeTab === 'detail' && (
                  <div className="flex-1 bg-slate-950 flex flex-col p-4 animate-fadeIn overflow-y-auto">
                    <div className="space-y-3 mt-6">
                      <div className="border-b border-slate-900 pb-2">
                        <span className="text-[7px] text-slate-500 font-mono">CASE DETAILS</span>
                        <h4 className="font-mono font-bold text-xs text-white">JK-482019-2026</h4>
                      </div>

                      <div className="bg-slate-900 rounded p-2 text-left space-y-1.5 text-[8px] text-slate-400">
                        <div>Dept: <strong className="text-slate-300">Jal Shakti Department</strong></div>
                        <div>Category: <strong className="text-slate-300">Water Supply Issue</strong></div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3 pl-2 border-l border-slate-800 ml-1 mt-2 text-left">
                        <div className="relative">
                          <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                          <div className="pl-2.5">
                            <span className="font-bold text-[8px] text-emerald-400">Grievance Resolved</span>
                            <p className="text-[6px] text-slate-500">Normal water flow restored in Bemina ward.</p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="pl-2.5">
                            <span className="font-bold text-[8px] text-slate-300">Action Initiated</span>
                            <p className="text-[6px] text-slate-500">Assigned to Assistant Engineer for pipeline review.</p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="pl-2.5">
                            <span className="font-bold text-[8px] text-slate-300">Submitted Online</span>
                            <p className="text-[6px] text-slate-500">Forwarded to Jal Shakti Cell.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
