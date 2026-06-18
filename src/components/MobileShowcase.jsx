import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, Info, ChevronRight, Apple, Play, User, Lock, Eye } from 'lucide-react';
import logoImg from '../assets/logo.png';
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
    <section className="relative py-20 overflow-hidden text-left bg-transparent">

      {/* ── Light Theme Gradient Background ── */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#f5f8ff] via-[#edf2f7] to-[#fff3ed]" />

      {/* ── Diagonal Stripes Texture Overlay ── */}
      <div 
        className="absolute inset-0 z-0 opacity-12 pointer-events-none" 
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, #0284c7 0px, #0284c7 1px, transparent 1px, transparent 12px)
          `,
        }}
      />

      {/* ── Subtle radial glows for depth ── */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-200/25 rounded-full blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-blue-200/25 rounded-full blur-[100px] z-0 pointer-events-none" />

      {/* ── Content wrapper sits above background ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-12">
          <TextRevealGroup>
            <TextRevealItem>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0c408f] flex items-center gap-2">
                Visit our Mobile Application
                <span className="text-blue-600 text-xl font-mono">»»»»»</span>
              </h2>
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
                <div className="flex gap-2.5 z-10 w-full sm:w-auto font-sans">
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
                          ? 'bg-[#0c408f] border-[#0c408f] text-white shadow-md'
                          : 'bg-[#f8fafc]/90 border-slate-200 text-[#0c408f] hover:bg-slate-100/80 shadow-xs'
                      }`}
                    >
                      <span className="font-semibold text-xs sm:text-sm pr-4">{tab.label}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-[#13b183]' : 'text-slate-400'}`} />
                    </button>
                  </StaggerItem>
                );
              })}
            </div>

          </StaggerContainer>

          {/* Right Column: Phone Mockup Frame */}
          <ScrollReveal delay={0.2} className="lg:col-span-5 flex justify-center relative">
            
            {/* Background capsule outline from the screenshot */}
            <div className="absolute w-[330px] h-[610px] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[50px] -z-10 opacity-70 border-[8px] border-slate-200/50 shadow-md translate-y-2" />

            {/* Floating Logo Badge */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 lg:left-6 lg:translate-x-0 z-30 pointer-events-none">
              <div className="bg-[#f8fafc]/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-250 px-4 py-2 flex items-center gap-3 animate-float whitespace-nowrap pointer-events-auto">
                {/* Left Logo */}
                <div className="flex items-center gap-2">
                  <img src={logoImg} alt="JK Samadhan" className="h-6 w-6 object-contain" />
                  <div className="text-left">
                    <span className="font-display font-extrabold text-[10px] text-slate-800 tracking-tight block">JK Samadhan 2.0</span>
                    <span className="text-[5px] font-bold text-slate-400 uppercase tracking-wider block">Govt of Jammu & Kashmir</span>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="h-6 w-px bg-slate-200" />
                
                {/* Right Logo */}
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinejoin="round" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#cbd5e1" strokeWidth="4" />
                      <line x1="24" y1="35" x2="76" y2="65" stroke="#cbd5e1" strokeWidth="4" />
                      <line x1="24" y1="65" x2="76" y2="35" stroke="#cbd5e1" strokeWidth="4" />
                      <circle cx="50" cy="20" r="10" fill="#ef4444" />
                      <circle cx="76" cy="35" r="10" fill="#3b82f6" />
                      <circle cx="76" cy="65" r="10" fill="#10b981" />
                      <circle cx="50" cy="80" r="10" fill="#f59e0b" />
                      <circle cx="24" cy="65" r="10" fill="#8b5cf6" />
                      <circle cx="24" cy="35" r="10" fill="#06b6d4" />
                      <circle cx="50" cy="50" r="6" fill="#ffffff" stroke="#64748b" strokeWidth="3" />
                    </svg>
                  </div>
                  <span className="font-display font-black text-[10px] text-[#0b2240] tracking-tight">JK Raabita</span>
                </div>
              </div>
            </div>

            {/* Light Mockup Frame */}
            <div className="relative w-[280px] h-[560px] bg-slate-100/90 rounded-[40px] p-3 shadow-2xl border-4 border-slate-250 flex flex-col overflow-hidden">
              
              {/* Phone Speaker Notch */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 bg-slate-50 rounded-[30px] overflow-hidden relative flex flex-col text-slate-800 text-[11px] border border-slate-100">
                
                {/* Status Bar */}
                <div className="h-6 px-4 pt-1.5 flex justify-between text-[9px] text-slate-500 bg-transparent z-10 select-none font-mono">
                  <span>1:04 PM</span>
                  <div className="flex gap-1">
                    <span>5G</span>
                    <span>59%</span>
                  </div>
                </div>

                {/* DYNAMIC SCREEN INTERACTION CONTENT */}
                
                {/* 1. Splash Screen */}
                {activeTab === 'splash' && (
                  <div className="flex-1 bg-gradient-to-b from-blue-50 to-slate-50/90 flex flex-col justify-between items-center p-6 text-center select-none animate-fadeIn text-slate-800">
                    <div className="mt-8 flex flex-col items-center gap-1.5">
                      {/* Logo Emblem */}
                      <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center p-1 border border-blue-500/20">
                        <img 
                          src={logoImg} 
                          alt="JK Samadhan Logo" 
                          className="w-10 h-10 object-contain" 
                        />
                      </div>
                      <div className="flex items-baseline">
                        <span className="font-display font-extrabold text-sm tracking-tight text-[#0b2240]">JK</span>
                        <span className="font-display font-extrabold text-sm tracking-tight text-[#ff9933]">Samadhan 2.0</span>
                      </div>
                      <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Government of Jammu & Kashmir</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      {/* Brand Logo Flower */}
                      <img 
                        src={logoImg} 
                        alt="JK Samadhan Logo" 
                        className="w-16 h-16 object-contain" 
                      />
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-800">Unified Grievance System</h4>
                        <p className="text-[8px] text-slate-500 mt-1 max-w-[160px] mx-auto">
                          Redressal & Monitoring Portal for all administrative departments.
                        </p>
                      </div>
                    </div>

                    <div className="mb-2 text-[7px] text-slate-450 font-medium">
                      Powered by NIC J&K State Centre
                    </div>
                  </div>
                )}

                {/* 2. Login Screen */}
                {activeTab === 'login' && (
                  <div className="flex-1 bg-slate-50/95 flex flex-col p-4 justify-between animate-fadeIn text-slate-800">
                    <div className="space-y-4 mt-6">
                      
                      {/* Inside Mockup Banner */}
                      <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-slate-50 border border-slate-100 rounded-xl shadow-xs">
                        <img src={logoImg} alt="JK Samadhan" className="h-4.5 w-4.5 object-contain" />
                        <span className="font-display font-extrabold text-[8px] text-slate-800 tracking-tight">JK Samadhan 2.0</span>
                        <span className="h-3 w-px bg-slate-200" />
                        {/* Raabita SVG */}
                        <div className="w-4 h-4">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinejoin="round" />
                            <line x1="50" y1="20" x2="50" y2="80" stroke="#cbd5e1" strokeWidth="4" />
                            <line x1="24" y1="35" x2="76" y2="65" stroke="#cbd5e1" strokeWidth="4" />
                            <line x1="24" y1="65" x2="76" y2="35" stroke="#cbd5e1" strokeWidth="4" />
                            <circle cx="50" cy="20" r="10" fill="#ef4444" />
                            <circle cx="76" cy="35" r="10" fill="#3b82f6" />
                            <circle cx="76" cy="65" r="10" fill="#10b981" />
                            <circle cx="50" cy="80" r="10" fill="#f59e0b" />
                            <circle cx="24" cy="65" r="10" fill="#8b5cf6" />
                            <circle cx="24" cy="35" r="10" fill="#06b6d4" />
                            <circle cx="50" cy="50" r="6" fill="#ffffff" stroke="#64748b" strokeWidth="3" />
                          </svg>
                        </div>
                        <span className="font-display font-black text-[8px] text-[#0e2a4a] tracking-tight">JK Raabita</span>
                      </div>

                      <div className="text-center space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Welcome !</span>
                        <h4 className="font-display font-extrabold text-xs text-slate-800">Citizen Login</h4>
                      </div>
                      
                      <div className="space-y-2.5 pt-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-400">
                            <User className="h-3.5 w-3.5" />
                          </span>
                          <input 
                            type="text" 
                            disabled 
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-[9px] outline-none text-slate-800 placeholder-slate-400"
                            placeholder="Enter Username" 
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-400">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                          <input 
                            type="password" 
                            disabled 
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-[9px] outline-none text-slate-800 placeholder-slate-400"
                            placeholder="Enter Password" 
                          />
                          <span className="absolute right-2.5 top-2.5 text-slate-450">
                            <Eye className="h-3 w-3" />
                          </span>
                        </div>
                      </div>

                      <button type="button" className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[9px] shadow-sm cursor-pointer">
                        Log In
                      </button>

                      <div className="flex justify-between items-center text-[7px] text-slate-500">
                        <a href="#" className="hover:underline">Forgot Password?</a>
                        <a href="#" className="text-[#ff9933] font-bold hover:underline">Register Now</a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-2 text-[7px] text-slate-400 font-bold uppercase">or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>
                      <button type="button" className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-[9px] cursor-pointer">
                        Login via SMS OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Lodge Form Screen */}
                {activeTab === 'lodge' && (
                  <div className="flex-1 bg-slate-50/95 flex flex-col p-4 animate-fadeIn overflow-y-auto text-slate-800">
                    <div className="space-y-3 mt-6">
                      <div className="border-b border-slate-100 pb-2">
                        <h4 className="font-display font-bold text-xs text-slate-800">Lodge Grievance</h4>
                        <p className="text-[7px] text-slate-500">Fill in details to submit concern</p>
                      </div>

                      <div className="space-y-2.5 text-left">
                        <div>
                          <label className="block text-[8px] text-slate-500 mb-1">Department</label>
                          <select disabled className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[8px] text-slate-650">
                            <option>Jal Shakti Department</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-500 mb-1">Category</label>
                          <select disabled className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[8px] text-slate-650">
                            <option>Pipeline Leakage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-500 mb-1">Subject</label>
                          <input 
                            type="text" 
                            disabled 
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[8px] text-slate-800 placeholder-slate-400"
                            placeholder="e.g. Water leak in lane 3" 
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-500 mb-1">Description</label>
                          <textarea 
                            disabled 
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[8px] text-slate-800 h-10 resize-none placeholder-slate-400"
                            placeholder="Explain details..." 
                          />
                        </div>
                      </div>

                      <button type="button" className="w-full py-1.5 bg-[#ff9933] hover:bg-amber-600 text-white font-bold rounded text-[9px] mt-2 shadow-xs cursor-pointer">
                        Submit Grievance
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Grievance List Screen */}
                {activeTab === 'list' && (
                  <div className="flex-1 bg-slate-50/95 flex flex-col p-4 animate-fadeIn overflow-y-auto text-slate-800">
                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="font-display font-bold text-xs text-slate-800">My Grievances</h4>
                          <p className="text-[7px] text-slate-500">History of submitted cases</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[7px] font-bold">Total: 3</span>
                      </div>

                      {/* Grievance Item 1 */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[8px] text-slate-700 font-bold">JK-482019</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 text-[6px] font-bold uppercase">Resolved</span>
                        </div>
                        <p className="text-[8px] text-slate-650 font-semibold truncate">Bemina Water Supply Shortage</p>
                        <span className="text-[6px] text-slate-400 block">Closed on May 18, 2026</span>
                      </div>

                      {/* Grievance Item 2 */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[8px] text-slate-700 font-bold">JK-992011</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 text-[6px] font-bold uppercase">In Progress</span>
                        </div>
                        <p className="text-[8px] text-slate-650 font-semibold truncate">Channi Himmat Transformer</p>
                        <span className="text-[6px] text-slate-400 block">Submitted on June 01, 2026</span>
                      </div>

                      {/* Grievance Item 3 */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[8px] text-slate-700 font-bold">JK-102948</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 text-[6px] font-bold uppercase">Submitted</span>
                        </div>
                        <p className="text-[8px] text-slate-650 font-semibold truncate">Potholes on Highway Lane</p>
                        <span className="text-[6px] text-slate-400 block">Submitted on June 05, 2026</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Detailed View Timeline Screen */}
                {activeTab === 'detail' && (
                  <div className="flex-1 bg-slate-50/95 flex flex-col p-4 animate-fadeIn overflow-y-auto text-slate-800">
                    <div className="space-y-3 mt-6">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[7px] text-slate-400 font-mono">CASE DETAILS</span>
                        <h4 className="font-mono font-bold text-xs text-slate-800">JK-482019-2026</h4>
                      </div>

                      <div className="bg-slate-50 rounded p-2 text-left space-y-1.5 text-[8px] text-slate-600">
                        <div>Dept: <strong className="text-slate-800">Jal Shakti Department</strong></div>
                        <div>Category: <strong className="text-slate-800">Water Supply Issue</strong></div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3 pl-2 border-l border-slate-200 ml-1 mt-2 text-left">
                        <div className="relative">
                          <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                          <div className="pl-2.5">
                            <span className="font-bold text-[8px] text-emerald-600">Grievance Resolved</span>
                            <p className="text-[6px] text-slate-500">Normal water flow restored in Bemina ward.</p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="pl-2.5">
                            <span className="font-bold text-[8px] text-slate-650">Action Initiated</span>
                            <p className="text-[6px] text-slate-500">Assigned to Assistant Engineer for pipeline review.</p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="pl-2.5">
                            <span className="font-bold text-[8px] text-slate-650">Submitted Online</span>
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
