import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length === 0) {
      setFormSubmitted(true);
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setFormSubmitted(false);
  };

  return (
    <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-gov-blue-light uppercase tracking-widest bg-blue-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-slate-800">
            Support Center
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Get in Touch
          </h2>
          <div className="w-16 h-1 bg-gov-saffron mx-auto rounded-full"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Have general queries regarding grievance procedures? Contact our support staff or write directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Contact Details
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Our support team handles technical and procedural inquiries. For filing grievances, please use the online lodging portal.
              </p>
            </div>

            <div className="space-y-4">
              {/* Helpline */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-xl flex gap-4 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-amber-50 dark:bg-slate-900 rounded-lg text-gov-saffron self-start">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Toll-Free Helpline</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white text-lg">14430</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Available 9:30 AM to 5:30 PM (Mon-Sat)</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-xl flex gap-4 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-blue-50 dark:bg-slate-900 rounded-lg text-gov-blue-light self-start">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Email Support</span>
                  <a href="mailto:support-samadhan@jk.gov.in" className="font-semibold text-gov-blue-medium dark:text-blue-400 text-sm hover:underline">
                    support-samadhan@jk.gov.in
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Response within 24-48 working hours</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-xl flex gap-4 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-emerald-50 dark:bg-slate-900 rounded-lg text-gov-green self-start">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-xs space-y-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Jammu Secretariat</span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">Department of Grievances, Civil Secretariat, Jammu, Pin-180001</p>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-900 pt-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Srinagar Secretariat</span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">Department of Grievances, Civil Secretariat, Srinagar, Pin-190001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-6 md:p-8 shadow-sm">
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                    Send a Message
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name *</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full rounded-lg border ${errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                        placeholder="Name" 
                      />
                      {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full rounded-lg border ${errors.email ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                        placeholder="Email" 
                      />
                      {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject *</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className={`w-full rounded-lg border ${errors.subject ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                      placeholder="What is this regarding?" 
                    />
                    {errors.subject && <p className="text-[10px] text-red-500 mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Message *</label>
                    <textarea 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className={`w-full rounded-lg border ${errors.message ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2.5 text-sm outline-none transition-all min-h-[120px]`}
                      placeholder="Type details..." 
                    />
                    {errors.message && <p className="text-[10px] text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gov-blue hover:bg-gov-blue-medium text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Send Message <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Message Received</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Your inquiry has been submitted. Our technical support staff will follow up via email if needed.
                  </p>
                  <button 
                    onClick={handleReset}
                    className="mt-4 px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
