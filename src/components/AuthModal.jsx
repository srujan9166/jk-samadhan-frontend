import React, { useState, useEffect } from 'react';
import { X, Lock, Phone, User, CheckCircle2, ShieldCheck, Mail, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', or 'admin'
  const [step, setStep] = useState(1); // 1: Input details, 2: OTP verification, 3: Success
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVal, setCaptchaVal] = useState('NK4KG4');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [formData, setFormData] = useState({
    mobile: '',
    name: '',
    email: '',
    otp: '',
    username: '',
    password: '',
    // new registration fields
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    state: '',
    district: '',
    address: '',
    pincode: '',
    communicationLanguage: 'eng',
    captcha: ''
  });
  const [errors, setErrors] = useState({});

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRefreshCaptcha = () => {
    setCaptchaVal(generateCaptcha());
  };

  // Reset state when modal is opened or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setShowPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
      setCaptchaVal(generateCaptcha());
      setFormData({
        mobile: '',
        name: '',
        email: '',
        otp: '',
        username: '',
        password: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dob: '',
        state: '',
        district: '',
        address: '',
        pincode: '',
        communicationLanguage: 'eng',
        captcha: ''
      });
      setErrors({});
    }
  }, [isOpen, initialMode]);



  const validateLogin = () => {
    let err = {};
    if (!formData.mobile.trim()) {
      err.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/[\s-+]/g, '').slice(-10))) {
      err.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.password.trim()) {
      err.password = 'Password is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (validateLogin()) {
      setStep(2);
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP code' });
      return;
    }
    setStep(3);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    let err = {};
    if (!formData.username.trim()) {
      err.username = 'Admin Username is required';
    }
    if (!formData.password.trim()) {
      err.password = 'Password is required';
    }
    
    setErrors(err);
    if (Object.keys(err).length === 0) {
      setStep(3);
    }
  };

  const handleSendOTPRegistration = () => {
    let err = { ...errors };
    if (!formData.mobile.trim()) {
      err.mobile = 'Mobile number is required';
      setErrors(err);
      return;
    }
    if (!/^\d{10}$/.test(formData.mobile.replace(/[\s-+]/g, '').slice(-10))) {
      err.mobile = 'Enter a valid 10-digit mobile number';
      setErrors(err);
      return;
    }
    delete err.mobile;
    setErrors(err);
    setOtpSent(true);
    alert("Mock OTP sent to: +91 " + formData.mobile);
  };

  const handleVerifyOTPRegistration = () => {
    let err = { ...errors };
    if (!formData.otp || formData.otp.trim().length !== 6) {
      err.otp = 'Please enter valid 6-digit OTP';
      setErrors(err);
      return;
    }
    delete err.otp;
    setErrors(err);
    setOtpVerified(true);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    let err = {};
    if (!formData.firstName.trim()) err.firstName = 'First name is required';
    if (!formData.lastName.trim()) err.lastName = 'Last name is required';
    if (!formData.gender) err.gender = 'Gender selection is required';
    if (!formData.state) err.state = 'State selection is required';
    if (!formData.district) err.district = 'District selection is required';
    if (!formData.address.trim()) err.address = 'Address is required';
    if (!formData.pincode.trim()) {
      err.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      err.pincode = 'Enter a valid 6-digit pincode';
    }
    
    if (!formData.mobile.trim()) {
      err.mobile = 'Mobile number is required';
    }
    if (!otpVerified) {
      err.otp = 'Please verify your mobile number first';
    }
    
    if (!formData.captcha.trim()) {
      err.captcha = 'Captcha is required';
    } else if (formData.captcha.trim().toUpperCase() !== captchaVal.toUpperCase()) {
      err.captcha = 'Captcha does not match';
    }
    
    setErrors(err);
    if (Object.keys(err).length === 0) {
      setStep(3);
    }
  };

  const handleReset = () => {
    setFormData({
      mobile: '', name: '', email: '', otp: '', username: '', password: '',
      firstName: '', middleName: '', lastName: '', gender: '', dob: '',
      state: '', district: '', address: '', pincode: '', communicationLanguage: 'eng', captcha: ''
    });
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setErrors({});
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto motion-modal-overlay ${
      isOpen
        ? 'opacity-100 pointer-events-auto bg-slate-900/60 backdrop-blur-sm visible'
        : 'opacity-0 pointer-events-none bg-transparent backdrop-blur-none invisible'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden motion-modal-content transform flex flex-col ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      } ${
        mode === 'register' && step === 1 ? 'max-w-4xl' : 'max-w-3xl md:flex-row min-h-[460px]'
      } relative`}>
        
        {/* CITIZEN / ADMIN LOGIN SPLIT VIEW LAYOUT */}
        {(mode !== 'register' || step !== 1) && (
          <>
            {/* LEFT BRANDING PANE */}
            <div className="hidden md:flex md:w-[320px] bg-gradient-to-b from-[#0c408f] to-[#041a3f] text-white p-8 flex-col justify-center gap-8 relative overflow-hidden select-none">
              {/* Decorative wave background */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="-20" cy="50" r="120" fill="none" stroke="white" strokeWidth="1" />
                  <circle cx="-20" cy="50" r="160" fill="none" stroke="white" strokeWidth="1.5" />
                  <circle cx="-20" cy="50" r="200" fill="none" stroke="white" strokeWidth="2" />
                  <circle cx="-20" cy="50" r="240" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                  <circle cx="-20" cy="50" r="280" fill="none" stroke="white" strokeWidth="1" />
                  <circle cx="340" cy="400" r="120" fill="none" stroke="white" strokeWidth="1" />
                  <circle cx="340" cy="400" r="160" fill="none" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>

              {/* JK Samadhan Logo */}
              <div className="flex items-center gap-3.5 z-10">
                <img 
                  src={logoImg} 
                  alt="JK Samadhan Logo" 
                  className="w-11 h-11 object-contain" 
                  style={{ filter: 'brightness(0) invert(1)' }} 
                />
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-sm tracking-wide leading-none uppercase">JK Samadhan 2.0</span>
                  <span className="text-[7px] text-slate-300 font-bold uppercase tracking-wider mt-1.5">Government of Jammu & Kashmir</span>
                </div>
              </div>

              {/* JK Raabita Logo */}
              <div className="flex items-center gap-3.5 z-10">
                <svg viewBox="0 0 100 100" className="w-11 h-11 text-white fill-none stroke-current" strokeWidth="5.5">
                  <circle cx="50" cy="50" r="12" />
                  <circle cx="20" cy="40" r="7" />
                  <circle cx="45" cy="18" r="7" />
                  <circle cx="80" cy="35" r="7" />
                  <circle cx="70" cy="75" r="7" />
                  <circle cx="30" cy="75" r="7" />
                  <line x1="26" y1="42" x2="39" y2="47" />
                  <line x1="48" y1="25" x2="50" y2="38" />
                  <line x1="73" y1="38" x2="61" y2="46" />
                  <line x1="66" y1="70" x2="57" y2="59" />
                  <line x1="34" y1="70" x2="43" y2="59" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-sm tracking-wide uppercase leading-none">JK Raabita</span>
                  <span className="text-[7px] text-slate-300 font-bold uppercase tracking-wider mt-1.5">Unified Citizen Gateway</span>
                </div>
              </div>
            </div>

            {/* RIGHT FORM PANE */}
            <div 
              className="flex-1 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-white p-8 sm:p-10 flex flex-col justify-center relative min-h-[440px]"
            >
              {/* Close button */}
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Form Step 1: Input details */}
              {step === 1 && (
                <div className="w-full max-w-sm mx-auto">
                  <h3 className="text-lg font-bold text-[#0c408f] tracking-wide text-center uppercase mb-6">
                    {mode === 'login' ? 'Citizen Login' : 'Administrative Login'}
                  </h3>

                  {mode === 'admin' ? (
                    /* ADMINISTRATIVE LOGIN FORM */
                    <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                        <input 
                          type="text" 
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className={`w-full bg-[#f8fafc] border ${errors.username ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                          placeholder="Enter Email Address" 
                        />
                        {errors.username && <p className="text-[10px] text-red-500 mt-1">{errors.username}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className={`w-full bg-[#f8fafc] border ${errors.password ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                            placeholder="Password" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
                      </div>

                      <div className="text-right">
                        <button 
                          type="button" 
                          onClick={() => alert("Password reset functionality is under maintenance.")}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#13b183] hover:bg-[#0f966e] text-white font-bold rounded-lg text-sm transition-all shadow-sm cursor-pointer mt-4"
                      >
                        Next
                      </button>

                      <div className="text-center pt-4 border-t border-slate-100 mt-4">
                        <button 
                          type="button" 
                          onClick={() => { setMode('login'); setErrors({}); }} 
                          className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Are you a Citizen? Login here
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* CITIZEN LOGIN FORM */
                    <form onSubmit={handleSendOTP} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                        <input 
                          type="tel" 
                          value={formData.mobile}
                          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                          className={`w-full bg-[#f8fafc] border ${errors.mobile ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                          placeholder="Enter 10-digit Mobile Number" 
                        />
                        {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className={`w-full bg-[#f8fafc] border ${errors.password ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                            placeholder="Password" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
                      </div>

                      <div className="text-right">
                        <button 
                          type="button" 
                          onClick={() => alert("Password reset functionality is under maintenance.")}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#13b183] hover:bg-[#0f966e] text-white font-bold rounded-lg text-sm transition-all shadow-sm cursor-pointer mt-4"
                      >
                        Next
                      </button>

                      <div className="flex flex-col gap-2 items-center pt-4 border-t border-slate-100 mt-4">
                        <button 
                          type="button" 
                          onClick={() => { setMode('register'); setErrors({}); }} 
                          className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Don't have an account? Register
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setMode('admin'); setErrors({}); }} 
                          className="text-xs text-slate-500 hover:underline cursor-pointer"
                        >
                          Administrative Login
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Form Step 2: OTP verification */}
              {step === 2 && (
                <div className="w-full max-w-sm mx-auto">
                  <h3 className="text-lg font-bold text-[#0c408f] tracking-wide text-center uppercase mb-2">
                    Verify Mobile
                  </h3>
                  <p className="text-xs text-slate-500 text-center mb-6">
                    OTP code sent to <strong>+91 {formData.mobile}</strong>
                  </p>

                  <form onSubmit={handleVerifyOTP} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">Enter 6-Digit OTP</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={formData.otp}
                        onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                        className={`w-full rounded-lg border text-center font-mono font-bold tracking-widest text-lg ${errors.otp ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} px-3 py-2.5 outline-none transition-all bg-[#f8fafc]`}
                        placeholder="------" 
                      />
                      {errors.otp && (
                        <p className="text-[10px] text-red-500 mt-1.5 text-center flex items-center justify-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> {errors.otp}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Didn't receive the code?</span>
                      <button type="button" className="text-blue-600 hover:underline font-bold cursor-pointer">Resend OTP</button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#13b183] hover:bg-[#0f966e] text-white font-bold rounded-lg text-sm transition-all shadow-sm cursor-pointer mt-4"
                    >
                      Verify & Log In
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2 cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </form>
                </div>
              )}

              {/* Form Step 3: Success Screen */}
              {step === 3 && (
                <div className="w-full max-w-sm mx-auto py-6 text-center space-y-4 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#13b183] flex items-center justify-center">
                    <CheckCircle2 className="h-9 w-9 animate-bounce" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Authentication Successful</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {mode === 'admin' ? (
                      <span>Welcome back, <strong>Administrator</strong>. You have been successfully authenticated to the JK Samadhan back office.</span>
                    ) : (
                      <span>Welcome back, {mode === 'register' ? formData.name : 'Citizen User'}. You have been logged in successfully to the JK Samadhan Portal.</span>
                    )}
                  </p>
                  <button 
                    onClick={handleReset}
                    className="w-full py-2.5 bg-[#13b183] hover:bg-[#0f966e] text-white font-bold rounded-lg text-sm transition-colors cursor-pointer mt-4"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </>
        )}

    {/* CITIZEN REGISTRATION FULL WIDTH VIEW LAYOUT */}
    {mode === 'register' && step === 1 && (
      <>
        {/* GREEN HEADER RIBBON */}
        <div className="bg-[#13b183] text-white px-6 py-4 flex justify-between items-center relative overflow-hidden">
          {/* Abstract green ripple patterns */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="10" cy="10" r="25" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="90" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex-1 text-center">
            <h3 className="font-display font-extrabold text-base md:text-lg text-white uppercase tracking-wider">
              Sign Up to Your Account
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-3 right-4 p-1 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-white transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* REGISTRATION FORM BODY */}
        <div className="p-6 md:p-8 space-y-5 text-left bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-white">
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Row 1: First name, Middle name, Last name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input 
                  type="text" 
                  placeholder="First name*" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.firstName ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                />
                {errors.firstName && <p className="text-[10px] text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Middle name" 
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Last name*" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.lastName ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                />
                {errors.lastName && <p className="text-[10px] text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Row 2: Select Gender, DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.gender ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all cursor-pointer`}
                >
                  <option value="">--Select Gender--</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-[10px] text-red-500 mt-1">{errors.gender}</p>}
              </div>
              <div className="flex items-center gap-3 w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-1.5 focus-within:border-blue-500">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">DOB :-</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="flex-1 bg-transparent text-sm outline-none text-slate-800 cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Row 3: Select State, Select District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.state ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all cursor-pointer`}
                >
                  <option value="">--Select State--</option>
                  <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Punjab">Punjab</option>
                </select>
                {errors.state && <p className="text-[10px] text-red-500 mt-1">{errors.state}</p>}
              </div>
              <div>
                <select 
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.district ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all cursor-pointer`}
                >
                  <option value="">--Select District--</option>
                  <option value="Srinagar">Srinagar</option>
                  <option value="Jammu">Jammu</option>
                  <option value="Anantnag">Anantnag</option>
                  <option value="Baramulla">Baramulla</option>
                </select>
                {errors.district && <p className="text-[10px] text-red-500 mt-1">{errors.district}</p>}
              </div>
            </div>

            {/* Row 4: Address, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <textarea 
                  placeholder="Address*" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.address ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400 h-[64px] resize-none`}
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div className="md:col-span-4 flex flex-col justify-start">
                <input 
                  type="text" 
                  placeholder="Enter Pincode*" 
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  className={`w-full bg-[#f8fafc] border ${errors.pincode ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                />
                {errors.pincode && <p className="text-[10px] text-red-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Row 5: Preferred Communication Language */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 py-1">
              <span>Select Prefered Communication langauge :</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="communicationLanguage" 
                    value="eng" 
                    checked={formData.communicationLanguage === 'eng'}
                    onChange={(e) => setFormData({...formData, communicationLanguage: e.target.value})}
                    className="cursor-pointer"
                  />
                  <span>Eng</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="communicationLanguage" 
                    value="hindi" 
                    checked={formData.communicationLanguage === 'hindi'}
                    onChange={(e) => setFormData({...formData, communicationLanguage: e.target.value})}
                    className="cursor-pointer"
                  />
                  <span>Hindi (हिन्दी)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="communicationLanguage" 
                    value="urdu" 
                    checked={formData.communicationLanguage === 'urdu'}
                    onChange={(e) => setFormData({...formData, communicationLanguage: e.target.value})}
                    className="cursor-pointer"
                  />
                  <span>Urdu (اردو)</span>
                </label>
              </div>
            </div>

            {/* Row 6: Mobile No (Send OTP) & Mobile OTP (Verify) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile Input Group */}
              <div>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500 bg-[#f8fafc]">
                  <input 
                    type="tel" 
                    placeholder="Mobile no*" 
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                  />
                  <button 
                    type="button" 
                    onClick={handleSendOTPRegistration}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Send OTP
                  </button>
                </div>
                {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
                {otpSent && <p className="text-[10px] text-emerald-600 mt-1">OTP sent successfully!</p>}
              </div>

              {/* OTP Input Group */}
              <div>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500 bg-[#f8fafc]">
                  <input 
                    type="text" 
                    placeholder="Mobile OTP*" 
                    value={formData.otp}
                    onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                  />
                  <button 
                    type="button" 
                    onClick={handleVerifyOTPRegistration}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {errors.otp && <p className="text-[10px] text-red-500 mt-1">{errors.otp}</p>}
                {otpVerified && <p className="text-[10px] text-emerald-600 mt-1">Mobile verified!</p>}
              </div>
            </div>

            {/* Row 7: Captcha */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-slate-700">Enter Captcha</label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <input 
                    type="text" 
                    placeholder="Enter Captcha" 
                    value={formData.captcha}
                    onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                    className={`w-full bg-[#f8fafc] border ${errors.captcha ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                  />
                  {errors.captcha && <p className="text-[10px] text-red-500 mt-1">{errors.captcha}</p>}
                </div>
                
                {/* Captcha Image styling */}
                <div className="flex items-center gap-2">
                  <div 
                    className="px-4 py-2 bg-pink-50 border border-pink-100 rounded-lg font-mono font-bold tracking-widest text-lg text-slate-850 relative overflow-hidden select-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, #fbcfe8 0px, #fbcfe8 1px, transparent 1px, transparent 10px)',
                      textDecoration: 'line-through',
                      textDecorationStyle: 'double',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span className="inline-block transform -rotate-3">{captchaVal}</span>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handleRefreshCaptcha}
                    className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                    title="Refresh Captcha"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.5">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Center Register Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="w-full md:w-auto md:px-24 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-lg text-sm transition-all shadow-md cursor-pointer uppercase tracking-wider"
              >
                Register
              </button>
            </div>

            {/* Already have account? Link */}
            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setMode('login'); setErrors({}); }} 
                className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Already have an account? Login
              </button>
            </div>

          </form>
        </div>
      </>
    )}

      </div>
    </div>
  );
}
