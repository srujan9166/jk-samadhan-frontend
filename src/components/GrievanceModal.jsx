import React, { useState } from 'react';
import { X, FileText, User, Mail, Phone, MapPin, Building, ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function GrievanceModal({ isOpen, onClose, mode = 'grievance' }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    address: '',
    department: '',
    category: '',
    subject: '',
    description: '',
    prevRefNum: '',
    isUrgent: false,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [refNum, setRefNum] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        district: '',
        address: '',
        department: '',
        category: '',
        subject: '',
        description: '',
        prevRefNum: '',
        isUrgent: false,
        agreeToTerms: false
      });
      setStep(1);
      setErrors({});
      setRefNum('');
    }
  }, [isOpen]);

  const districts = [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 
    'Kupwara', 'Budgam', 'Pulwama', 'Samba', 'Udhampur', 
    'Poonch', 'Rajouri', 'Reasi', 'Ramban', 'Doda', 
    'Kishtwar', 'Ganderbal', 'Bandipora', 'Shopian', 'Kulgam'
  ];

  const departments = [
    { id: 'pwd', name: 'Public Works Department (R&B)' },
    { id: 'pdd', name: 'Power Development Department (PDD)' },
    { id: 'phe', name: 'Jal Shakti (PHE) Department' },
    { id: 'health', name: 'Health & Medical Education' },
    { id: 'edu', name: 'School Education Department' },
    { id: 'revenue', name: 'Revenue Department' },
    { id: 'municipality', name: 'Housing & Urban Development' },
    { id: 'food', name: 'Food, Civil Supplies & Consumer Affairs' }
  ];

  const categories = {
    pwd: ['Road Repair', 'Bridge Construction', 'Building Maintenance', 'Other PWD Issues'],
    pdd: ['Power Outage', 'Faulty Transformer', 'Billing Grievance', 'New Connection Delay'],
    phe: ['Water Scarcity', 'Contaminated Water', 'Pipeline Leakage', 'Billing Issue'],
    health: ['Hospital Facilities', 'Staff Behaviour', 'Medicine Availability', 'Scheme Enrollment'],
    edu: ['School Infrastructure', 'Teacher Availability', 'Mid-Day Meal Quality', 'Scholarships'],
    revenue: ['Land Records', 'Demarcation Delay', 'Certificate Issuance', 'Staff Misconduct'],
    municipality: ['Garbage Collection', 'Street Light Malfunction', 'Drainage Blockage', 'Stray Animal Menace'],
    food: ['Ration Card Issue', 'Ration Quality', 'Dealer Misbehaviour', 'Black Marketing']
  };

  const validateStep = (currentStep) => {
    let newErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-+]/g, '').slice(-10))) {
        newErrors.phone = 'Enter a valid 10-digit phone number';
      }
      if (!formData.district) newErrors.district = 'Please select a district';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    } else if (currentStep === 2) {
      if (mode === 'appeal') {
        if (!formData.prevRefNum.trim()) {
          newErrors.prevRefNum = 'Original Grievance Reference Number is required for filing an appeal';
        } else if (!/^JK-\d{6}-\d{4}$/i.test(formData.prevRefNum.trim())) {
          newErrors.prevRefNum = 'Enter a valid Grievance Reference Number (e.g. JK-123456-2026)';
        }
      }
      if (!formData.department) newErrors.department = 'Please select a department';
      if (!formData.category) newErrors.category = 'Please select a category';
      if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length < 20) {
        newErrors.description = 'Please describe your concern in at least 20 characters';
      }
    } else if (currentStep === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must declare the information is true';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      // Simulate API submission
      const prefix = mode === 'appeal' ? 'JK-APL' : 'JK';
      const randomRef = prefix + '-' + Math.floor(100000 + Math.random() * 900000) + '-' + new Date().getFullYear();
      setRefNum(randomRef);
      setStep(4);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      district: '',
      address: '',
      department: '',
      category: '',
      subject: '',
      description: '',
      prevRefNum: '',
      isUrgent: false,
      agreeToTerms: false
    });
    setStep(1);
    setErrors({});
    setRefNum('');
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto motion-modal-overlay ${
      isOpen
        ? 'opacity-100 pointer-events-auto bg-slate-900/60 backdrop-blur-sm visible'
        : 'opacity-0 pointer-events-none bg-transparent backdrop-blur-none invisible'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden motion-modal-content transform flex flex-col max-h-[90vh] ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      }`}>
        {/* Header */}
        <div className="bg-gov-blue text-white px-6 py-4 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gov-saffron via-white to-gov-green"></div>
          <div className="flex items-center gap-3 mt-1">
            <FileText className="h-6 w-6 text-gov-saffron" />
            <div>
              <h3 className="font-display font-semibold text-lg">
                {mode === 'appeal' ? 'Lodge Public Appeal' : 'Lodge Public Grievance'}
              </h3>
              <p className="text-xs text-slate-300">
                {mode === 'appeal' 
                  ? 'Submit your administrative appeal against a resolved grievance response'
                  : 'Submit your concern directly to the respective department'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps indicator */}
        {step < 4 && (
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between text-xs font-semibold text-slate-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-gov-blue-medium font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-gov-blue-medium text-white' : 'bg-slate-200'}`}>1</span>
              Personal Details
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-gov-blue-medium font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-gov-blue-medium text-white' : 'bg-slate-200'}`}>2</span>
              {mode === 'appeal' ? 'Appeal Details' : 'Grievance Details'}
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-gov-blue-medium font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-gov-blue-medium text-white' : 'bg-slate-200'}`}>3</span>
              Declaration & Submit
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-left">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`pl-9 w-full rounded-lg border ${errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                      placeholder="e.g. Rajesh Kumar" 
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`pl-9 w-full rounded-lg border ${errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                      placeholder="10-digit number" 
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`pl-9 w-full rounded-lg border ${errors.email ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                    placeholder="e.g. rajesh@example.com" 
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      className={`pl-9 w-full rounded-lg border ${errors.district ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all bg-white appearance-none`}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {errors.district && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.district}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Postal Address *</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className={`w-full rounded-lg border ${errors.address ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                    placeholder="Ward, Block, Village/Town, Pincode" 
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.address}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {mode === 'appeal' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Original Grievance Reference Number *</label>
                  <input 
                    type="text" 
                    value={formData.prevRefNum}
                    onChange={(e) => setFormData({...formData, prevRefNum: e.target.value})}
                    className={`w-full rounded-lg border ${errors.prevRefNum ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all font-mono`}
                    placeholder="e.g. JK-482019-2026" 
                  />
                  {errors.prevRefNum && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.prevRefNum}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value, category: ''})}
                      className={`pl-9 w-full rounded-lg border ${errors.department ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all bg-white`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                    </select>
                  </div>
                  {errors.department && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {mode === 'appeal' ? 'Appeal Category *' : 'Grievance Category *'}
                  </label>
                  <select
                    value={formData.category}
                    disabled={!formData.department}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className={`w-full rounded-lg border ${errors.category ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all bg-white disabled:bg-slate-100 disabled:text-slate-400`}
                  >
                    <option value="">Select Category</option>
                    {formData.department && categories[formData.department]?.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.category}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {mode === 'appeal' ? 'Subject / Gist of Appeal *' : 'Subject / Gist of Grievance *'}
                </label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className={`w-full rounded-lg border ${errors.subject ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-2 text-sm outline-none transition-all`}
                  placeholder={mode === 'appeal' ? "Summarize your appeal in a line" : "Summarize your problem in a line (e.g. Water shortage in ward 4)"}
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {mode === 'appeal' ? 'Reason for Appeal / Detailed Description *' : 'Detailed Description *'}
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full rounded-lg border ${errors.description ? 'border-red-500 bg-red-50/20' : 'border-slate-300 focus:border-gov-blue-medium'} px-3 py-3 text-sm outline-none transition-all min-h-[120px]`}
                  placeholder={mode === 'appeal' 
                    ? "Provide complete details of why the previous resolution is unsatisfactory and what outcomes you expect from the appellate authority."
                    : "Provide complete details including historical context, exact location, and previous actions taken, if any."}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.description}</p>}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
                  className="rounded border-slate-300 text-gov-blue-medium focus:ring-gov-blue-medium h-4 w-4"
                />
                <label htmlFor="isUrgent" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Mark as Urgent (requires immediate attention / safety risk)
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-sm">
                <h4 className="font-semibold text-gov-blue border-b border-slate-200 pb-1.5 font-display">
                  {mode === 'appeal' ? 'Appeal Summary' : 'Grievance Summary'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500 block">Complainant:</span> <strong className="text-slate-800">{formData.name}</strong></div>
                  <div><span className="text-slate-500 block">Mobile No:</span> <strong className="text-slate-800">{formData.phone}</strong></div>
                  <div><span className="text-slate-500 block">District:</span> <strong className="text-slate-800">{formData.district}</strong></div>
                  <div><span className="text-slate-500 block">Department:</span> <strong className="text-slate-800">{departments.find(d => d.id === formData.department)?.name}</strong></div>
                  {mode === 'appeal' && (
                    <div className="col-span-2 mt-1"><span className="text-slate-500 block">Original Grievance Ref:</span> <strong className="text-slate-800 font-mono">{formData.prevRefNum}</strong></div>
                  )}
                </div>
                <div className="text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">Subject:</span>
                  <p className="font-semibold text-slate-800">{formData.subject}</p>
                </div>
              </div>

              <div className="bg-yellow-50/50 border border-yellow-200/60 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800 leading-relaxed">
                  <span className="font-bold block mb-1">Legal Declaration</span>
                  By submitting this {mode === 'appeal' ? 'appeal' : 'grievance'}, I hereby declare that the facts mentioned above are true to the best of my knowledge. I understand that submitting false reports or malicious complaints can lead to administrative or legal action under the Jammu & Kashmir Civil Services Conduct Rules.
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                    className="rounded border-slate-300 text-gov-blue-medium focus:ring-gov-blue-medium h-4 w-4 mt-0.5"
                  />
                  <label htmlFor="agreeToTerms" className="text-xs text-slate-700 cursor-pointer select-none">
                    I declare that all details provided in this form are correct and authentic. *
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.agreeToTerms}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-8 text-center space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="text-xl font-bold font-display text-slate-900">
                {mode === 'appeal' ? 'Appeal Registered Successfully' : 'Grievance Registered Successfully'}
              </h4>
              <p className="text-sm text-slate-500 max-w-md">
                Thank you, <strong className="text-slate-800">{formData.name}</strong>. Your {mode === 'appeal' ? 'appeal' : 'grievance'} has been registered on the JK Samadhan portal and forwarded to the Appellate Authority of the <strong>{departments.find(d => d.id === formData.department)?.name}</strong>.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm w-full my-4">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  {mode === 'appeal' ? 'Appeal Reference Number' : 'Grievance Reference Number'}
                </span>
                <span className="text-xl font-bold font-mono text-gov-blue select-all block mt-1">{refNum}</span>
                <span className="text-[10px] text-slate-500 block mt-2">
                  Please save this reference number to track the status of your {mode === 'appeal' ? 'appeal' : 'grievance'}. An SMS and Email confirmation have been sent to you.
                </span>
              </div>

              <div className="flex gap-3 pt-4 w-full justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-lg bg-gov-blue text-white text-sm font-semibold hover:bg-gov-blue-medium transition-all shadow-md hover:shadow-lg"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step < 4 && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-lg bg-gov-blue text-white text-sm font-semibold hover:bg-gov-blue-medium transition-all flex items-center gap-1 shadow-sm"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-gov-green text-white text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
              >
                {mode === 'appeal' ? 'Submit Appeal' : 'Submit Grievance'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
