import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, FileText, User, Mail, Phone, MapPin, Building, ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import geoService from '../../services/geoService';

export default function GrievanceModal({ 
  isOpen, 
  onClose, 
  mode = 'grievance', 
  onLoginRedirect, 
  onRegisterRedirect, 
  isLoggedIn, 
  user, 
  onGrievanceSubmit 
}) {
  const [step, setStep] = useState(1);
  const [isGated, setIsGated] = useState(true);
  const [refNum, setRefNum] = useState('');
  const [districtsList, setDistrictsList] = useState([]);

  const { register, handleSubmit, setValue, trigger, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
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
    }
  });

  const formValues = watch();

  // Load districts
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const divisions = await geoService.getDivisions();
        const allDistricts = [];
        for (const div of divisions) {
          const districtsData = await geoService.getDistricts(div.id);
          allDistricts.push(...districtsData);
        }
        setDistrictsList(allDistricts);
      } catch (err) {
        console.error('Error loading geo divisions/districts:', err);
      }
    };
    loadGeoData();
  }, []);

  // Sync logged in user profile values
  useEffect(() => {
    if (isOpen) {
      setIsGated(!isLoggedIn);
      setStep(1);
      setRefNum('');
      reset({
        name: isLoggedIn && user ? user.name : '',
        email: isLoggedIn && user ? user.email : '',
        phone: isLoggedIn && user ? (user.phone || user.mobile) : '',
        district: isLoggedIn && user ? (user.district || '') : '',
        address: isLoggedIn && user ? (user.address || '') : '',
        department: '',
        category: '',
        subject: '',
        description: '',
        prevRefNum: '',
        isUrgent: false,
        agreeToTerms: false
      });
    }
  }, [isOpen, isLoggedIn, user, reset]);

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

  const categoriesMap = {
    pwd: ['Road Repair', 'Bridge Construction', 'Building Maintenance', 'Other PWD Issues'],
    pdd: ['Power Outage', 'Faulty Transformer', 'Billing Grievance', 'New Connection Delay'],
    phe: ['Water Scarcity', 'Contaminated Water', 'Pipeline Leakage', 'Billing Issue'],
    health: ['Hospital Facilities', 'Staff Behaviour', 'Medicine Availability', 'Scheme Enrollment'],
    edu: ['School Infrastructure', 'Teacher Availability', 'Mid-Day Meal Quality', 'Scholarships'],
    revenue: ['Land Records', 'Demarcation Delay', 'Certificate Issuance', 'Staff Misconduct'],
    municipality: ['Garbage Collection', 'Street Light Malfunction', 'Drainage Blockage', 'Stray Animal Menace'],
    food: ['Ration Card Issue', 'Ration Quality', 'Dealer Misbehaviour', 'Black Marketing']
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'district', 'address'];
    } else if (step === 2) {
      fieldsToValidate = ['department', 'category', 'subject', 'description'];
      if (mode === 'appeal') {
        fieldsToValidate.push('prevRefNum');
      }
    }
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const onSubmitForm = (data) => {
    const prefix = mode === 'appeal' ? 'JK-APL' : 'JK';
    const randomRef = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;
    setRefNum(randomRef);
    setStep(4);
    if (onGrievanceSubmit) {
      onGrievanceSubmit({
        refNum: randomRef,
        type: mode,
        department: data.department,
        category: data.category,
        subject: data.subject,
        description: data.description,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'Pending',
        source: 'Web'
      });
    }
  };

  const handleResetAndClose = () => {
    reset();
    setStep(1);
    setRefNum('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="bg-[#164581] text-white px-6 py-4 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
          <div className="flex items-center gap-3 mt-1">
            <FileText className="h-6 w-6 text-orange-400" />
            <div>
              <h3 className="font-semibold text-lg">{mode === 'appeal' ? 'Lodge Higher Appeal' : 'Lodge Grievance'}</h3>
              <p className="text-xs text-slate-300">Unified Portal for Citizen Grievance Redressal</p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose} 
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isGated ? (
          /* Authentication warning gate */
          <div className="p-6 text-center space-y-6">
            <div className="flex justify-center text-amber-500">
              <AlertCircle className="h-16 w-16" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-lg text-slate-800">Authentication Required</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You must login to establish a verified session in order to file a formal grievance or appeal with government authorities.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button 
                onClick={onLoginRedirect} 
                className="px-6 py-2 bg-[#164581] text-white font-semibold rounded-lg text-xs hover:opacity-90 transition-opacity cursor-pointer border-0"
              >
                Sign In
              </button>
              <button 
                onClick={onRegisterRedirect} 
                className="px-6 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Register Now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 overflow-y-auto p-6 flex flex-col space-y-5">
            {/* Step Indicators */}
            {step < 4 && (
              <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                <span className={step === 1 ? 'text-[#164581] font-bold' : ''}>1. Petitioner Info</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
                <span className={step === 2 ? 'text-[#164581] font-bold' : ''}>2. Petition Details</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
                <span className={step === 3 ? 'text-[#164581] font-bold' : ''}>3. Declaration</span>
              </div>
            )}

            {/* Step 1: Petitioner Info */}
            {step === 1 && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Complainant Name</label>
                    <input 
                      type="text" 
                      {...register('name', { required: 'Name is required' })} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 outline-none"
                    />
                    {errors.name && <span className="text-[10px] text-red-650 block font-bold">{errors.name.message}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Verified Mobile</label>
                    <input 
                      type="text" 
                      {...register('phone', { required: 'Phone is required' })} 
                      className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-500 outline-none"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      {...register('email', { required: 'Email is required' })} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 outline-none"
                    />
                    {errors.email && <span className="text-[10px] text-red-650 block font-bold">{errors.email.message}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">District</label>
                    <select 
                      {...register('district', { required: 'District is required' })} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-850 outline-none"
                    >
                      <option value="">Select District</option>
                      {districtsList.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    {errors.district && <span className="text-[10px] text-red-650 block font-bold">{errors.district.message}</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Residential Address</label>
                  <textarea 
                    {...register('address', { required: 'Address is required' })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 h-20 resize-none outline-none"
                  />
                  {errors.address && <span className="text-[10px] text-red-650 block font-bold">{errors.address.message}</span>}
                </div>
              </div>
            )}

            {/* Step 2: Petition Details */}
            {step === 2 && (
              <div className="space-y-4 text-left">
                {mode === 'appeal' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Original Grievance Ref Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. JK-123456-2026"
                      {...register('prevRefNum', { required: 'Previous reference number is required' })} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 outline-none uppercase font-mono"
                    />
                    {errors.prevRefNum && <span className="text-[10px] text-red-650 block font-bold">{errors.prevRefNum.message}</span>}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Department</label>
                    <select 
                      {...register('department', { required: 'Department is required' })} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-850 outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    {errors.department && <span className="text-[10px] text-red-650 block font-bold">{errors.department.message}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Grievance Category</label>
                    <select 
                      {...register('category', { required: 'Category is required' })} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-850 outline-none"
                    >
                      <option value="">Select Category</option>
                      {formValues.department && (categoriesMap[departments.find(d => d.name === formValues.department)?.id] || []).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <span className="text-[10px] text-red-650 block font-bold">{errors.category.message}</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Short summary of the concern"
                    {...register('subject', { required: 'Subject is required' })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 outline-none"
                  />
                  {errors.subject && <span className="text-[10px] text-red-650 block font-bold">{errors.subject.message}</span>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Detailed Description</label>
                  <textarea 
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Must be at least 20 characters' }
                    })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 h-24 resize-none outline-none"
                  />
                  {errors.description && <span className="text-[10px] text-red-650 block font-bold">{errors.description.message}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Declaration */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-slate-650 text-xs font-medium leading-relaxed">
                  <Info className="h-5 w-5 text-[#164581] shrink-0 mt-0.5" />
                  <span>
                    By submitting this concern, you declare that all information provided is true and accurate. Submitting false statements or misleading documentation to government authorities is liable under legal action.
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-800 select-none">
                    <input 
                      type="checkbox" 
                      {...register('agreeToTerms', { required: 'You must agree to proceed' })} 
                      className="accent-[#164581] h-4 w-4 cursor-pointer shrink-0 mt-0.5"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      I declare that all details entered in this form are correct and true to my knowledge.
                    </span>
                  </label>
                  {errors.agreeToTerms && <span className="text-[10px] text-red-650 block font-bold">{errors.agreeToTerms.message}</span>}
                </div>
              </div>
            )}

            {/* Step 4: Success confirmation */}
            {step === 4 && (
              <div className="p-6 text-center space-y-6 animate-fadeIn">
                <div className="flex justify-center text-emerald-500">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-slate-850">Petition Filed Successfully</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your {mode === 'appeal' ? 'appeal' : 'grievance'} request has been registered in the database.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-xs mx-auto">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Reference Code</span>
                  <span className="block text-base font-black font-mono text-slate-750 mt-1">{refNum}</span>
                </div>
                <button 
                  type="button"
                  onClick={handleResetAndClose} 
                  className="px-6 py-2.5 bg-[#164581] text-white font-bold rounded-lg text-xs hover:opacity-90 cursor-pointer border-0 shadow-sm"
                >
                  Close & Back to Portal
                </button>
              </div>
            )}

            {/* Form Action Controls */}
            {step < 4 && (
              <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-6">
                {step > 1 ? (
                  <button 
                    type="button" 
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-[#164581] hover:opacity-95 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer border-0 flex items-center gap-1"
                  >
                    <span>Next Stage</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#ff9933] hover:bg-orange-600 text-white font-extrabold rounded-lg text-xs shadow-sm cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <span>File Formal Petition</span>
                    <ShieldCheck className="h-4.5 w-4.5 text-white" />
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
