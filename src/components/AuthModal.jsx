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

  // Forgot Password State Variables
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailOtp, setForgotEmailOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotCaptcha, setForgotCaptcha] = useState('');
  const [otpSentForgot, setOtpSentForgot] = useState(false);
  const [otpVerifiedForgot, setOtpVerifiedForgot] = useState(false);
  const [otpSentForgotEmail, setOtpSentForgotEmail] = useState(false);
  const [otpVerifiedForgotEmail, setOtpVerifiedForgotEmail] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setForgotMobile('');
      setForgotOtp('');
      setForgotEmail('');
      setForgotEmailOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotCaptcha('');
      setOtpSentForgot(false);
      setOtpVerifiedForgot(false);
      setOtpSentForgotEmail(false);
      setOtpVerifiedForgotEmail(false);
      setForgotSuccess(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
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
    setForgotMobile('');
    setForgotOtp('');
    setForgotEmail('');
    setForgotEmailOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotCaptcha('');
    setOtpSentForgot(false);
    setOtpVerifiedForgot(false);
    setOtpSentForgotEmail(false);
    setOtpVerifiedForgotEmail(false);
    setForgotSuccess(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setErrors({});
    onClose();
  };

  const handleSendOTPForgot = () => {
    let err = { ...errors };
    if (!forgotMobile.trim()) {
      err.forgotMobile = 'Mobile number is required';
      setErrors(err);
      return;
    }
    if (!/^\d{10}$/.test(forgotMobile.replace(/[\s-+]/g, '').slice(-10))) {
      err.forgotMobile = 'Enter a valid 10-digit mobile number';
      setErrors(err);
      return;
    }
    delete err.forgotMobile;
    setErrors(err);
    setOtpSentForgot(true);
    alert("Mock OTP sent to: +91 " + forgotMobile);
  };

  const handleVerifyOTPForgot = () => {
    let err = { ...errors };
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      err.forgotOtp = 'Please enter a valid 6-digit OTP';
      setErrors(err);
      return;
    }
    delete err.forgotOtp;
    setErrors(err);
    setOtpVerifiedForgot(true);
  };

  const handleSendOTPEmailForgot = () => {
    let err = { ...errors };
    if (!forgotEmail.trim()) {
      err.forgotEmail = 'Email is required';
      setErrors(err);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      err.forgotEmail = 'Enter a valid email address';
      setErrors(err);
      return;
    }
    delete err.forgotEmail;
    setErrors(err);
    setOtpSentForgotEmail(true);
    alert("Mock OTP sent to email: " + forgotEmail);
  };

  const handleVerifyOTPEmailForgot = () => {
    let err = { ...errors };
    if (!forgotEmailOtp || forgotEmailOtp.trim().length !== 6) {
      err.forgotEmailOtp = 'Please enter a valid 6-digit OTP';
      setErrors(err);
      return;
    }
    delete err.forgotEmailOtp;
    setErrors(err);
    setOtpVerifiedForgotEmail(true);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    let err = {};

    if (!forgotMobile.trim()) {
      err.forgotMobile = 'Mobile number is required';
    } else if (!otpSentForgot) {
      err.forgotMobile = 'Please request an OTP first';
    } else if (!otpVerifiedForgot) {
      err.forgotOtp = 'Please verify your mobile number first';
    }

    if (mode === 'adminForgot') {
      if (!forgotEmail.trim()) {
        err.forgotEmail = 'Email is required';
      } else if (!otpSentForgotEmail) {
        err.forgotEmail = 'Please request an OTP first';
      } else if (!otpVerifiedForgotEmail) {
        err.forgotEmailOtp = 'Please verify your email first';
      }
    }

    if (!forgotNewPassword) {
      err.forgotNewPassword = 'New password is required';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(forgotNewPassword)) {
        err.forgotNewPassword = 'Password does not meet strength requirements';
      }
    }

    if (!forgotConfirmPassword) {
      err.forgotConfirmPassword = 'Confirm password is required';
    } else if (forgotNewPassword !== forgotConfirmPassword) {
      err.forgotConfirmPassword = 'Passwords do not match';
    }

    if (!forgotCaptcha.trim()) {
      err.forgotCaptcha = 'Captcha is required';
    } else if (forgotCaptcha.trim().toUpperCase() !== captchaVal.toUpperCase()) {
      err.forgotCaptcha = 'Captcha does not match';
    }

    setErrors(err);
    if (Object.keys(err).length === 0) {
      setForgotSuccess(true);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto motion-modal-overlay ${
      isOpen
        ? 'opacity-100 pointer-events-auto bg-slate-900/60 backdrop-blur-sm visible'
        : 'opacity-0 pointer-events-none bg-transparent backdrop-blur-none invisible'
    }`}>
      <div className={`bg-[#f8fafc] rounded-2xl shadow-2xl w-full overflow-hidden motion-modal-content transform flex flex-col ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      } ${
        mode === 'forgot' || mode === 'adminForgot'
          ? 'max-w-2xl min-h-[460px]'
          : mode === 'register' && step === 1
            ? 'max-w-4xl'
            : 'max-w-3xl md:flex-row min-h-[460px]'
      } relative`}>
        
        {/* National tri-color accent strip */}
        <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#ff9933] via-[#ffffff] to-[#13b183] z-30"></div>
        
        {/* CITIZEN / ADMIN LOGIN SPLIT VIEW LAYOUT */}
        {(mode !== 'register' && mode !== 'forgot' && mode !== 'adminForgot' || step !== 1) && (
          <>
            {/* LEFT BRANDING PANE */}
            <div className="hidden md:flex md:w-[320px] bg-gradient-to-b from-[#0c408f] to-[#041a3f] text-white p-8 flex-col justify-center gap-8 relative overflow-hidden select-none">
              {/* Soft visual glows */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#ff9933]/15 rounded-full blur-[40px] pointer-events-none z-0"></div>
              <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-[#13b183]/15 rounded-full blur-[45px] pointer-events-none z-0"></div>
              
              {/* Decorative wave background */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
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
              <div className="flex items-center gap-3.5 z-10 transition-transform duration-300 hover:translate-x-1">
                <img 
                  src={logoImg} 
                  alt="JK Samadhan Logo" 
                  className="w-11 h-11 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" 
                  style={{ filter: 'brightness(0) invert(1)' }} 
                />
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-sm tracking-wide leading-none uppercase">JK Samadhan 2.0</span>
                  <span className="text-[7px] text-slate-350 font-bold uppercase tracking-wider mt-1.5">Government of Jammu & Kashmir</span>
                </div>
              </div>
 
              {/* JK Raabita Logo */}
              <div className="flex items-center gap-3.5 z-10 transition-transform duration-300 hover:translate-x-1">
                <div className="p-1 bg-white/10 rounded-xl border border-white/20">
                  <svg viewBox="0 0 100 100" className="w-9 h-9 text-white fill-none stroke-current" strokeWidth="5.5">
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
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display font-extrabold text-sm tracking-wide uppercase leading-none">JK Raabita</span>
                  <span className="text-[7px] text-slate-350 font-bold uppercase tracking-wider mt-1.5">Unified Citizen Gateway</span>
                </div>
              </div>
            </div>
 
            {/* RIGHT FORM PANE */}
            <div 
              className="flex-1 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-[#f8fafc] p-8 sm:p-10 flex flex-col justify-center relative min-h-[440px]"
            >
              {/* Close button */}
              <button 
                onClick={onClose} 
                className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Form Step 1: Input details */}
              {step === 1 && (
                <div className="w-full max-w-sm mx-auto text-center">
                  
                  {/* Secure Access Pill Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/80 border border-blue-100/70 text-blue-700 text-[10px] font-bold tracking-wider uppercase mb-3.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#13b183]" /> Secure Portal Gateway
                  </div>

                  <h3 className="text-lg font-bold text-[#0c408f] tracking-wide uppercase mb-6">
                    {mode === 'login' ? 'Citizen Login' : 'Administrative Login'}
                  </h3>

                  {mode === 'admin' ? (
                    /* ADMINISTRATIVE LOGIN FORM */
                    <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <input 
                            type="text" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className={`w-full bg-slate-50 border ${errors.username ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl pl-11 pr-4 py-3 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                            placeholder="Enter Email Address" 
                          />
                        </div>
                        {errors.username && <p className="text-[10px] text-red-500 mt-1">{errors.username}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className={`w-full bg-slate-50 border ${errors.password ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl pl-11 pr-10 py-3 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                            placeholder="Password" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
                      </div>

                      <div className="text-right">
                        <button 
                          type="button" 
                          onClick={() => { setMode('adminForgot'); setErrors({}); }}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer mt-4"
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Username (Mobile)</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <input 
                            type="tel" 
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                            className={`w-full bg-slate-50 border ${errors.mobile ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl pl-11 pr-4 py-3 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                            placeholder="Enter 10-digit Mobile Number" 
                          />
                        </div>
                        {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className={`w-full bg-slate-50 border ${errors.password ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl pl-11 pr-10 py-3 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                            placeholder="Password" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
                      </div>

                      <div className="text-right">
                        <button 
                          type="button" 
                          onClick={() => { setMode('forgot'); setErrors({}); }}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer mt-4"
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
                          className="text-xs text-slate-550 hover:underline cursor-pointer"
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
                <div className="w-full max-w-sm mx-auto text-center">
                  <h3 className="text-lg font-bold text-[#0c408f] tracking-wide uppercase mb-2">
                    Verify Mobile
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
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
                        className={`w-full rounded-xl border text-center font-mono font-bold tracking-widest text-lg ${errors.otp ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} px-3 py-3 outline-none transition-all bg-slate-50`}
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
                      className="w-full py-3 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer mt-4"
                    >
                      Verify & Log In
                    </button>
 
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="w-full text-center text-xs text-slate-400 hover:text-slate-650 py-2 cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </form>
                </div>
              )}
 
              {/* Form Step 3: Success Screen */}
              {step === 3 && (
                <div className="w-full max-w-sm mx-auto py-6 text-center space-y-4 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#13b183] flex items-center justify-center border border-emerald-100 shadow-sm">
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
                    className="w-full py-3 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer mt-4"
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
        {/* HEADER RIBBON */}
        <div className="bg-gradient-to-r from-[#0c408f] to-[#13b183] text-white px-6 py-5 flex justify-between items-center relative overflow-hidden">
          {/* Abstract green ripple patterns */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="10" cy="10" r="25" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="90" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex-1 text-center">
            <h3 className="font-display font-extrabold text-base md:text-lg text-white uppercase tracking-wider">
              Create Your Citizen Account
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-white transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* REGISTRATION FORM BODY */}
        <div className="p-6 md:p-8 space-y-5 text-left bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-[#f8fafc]">
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Row 1: First name, Middle name, Last name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input 
                  type="text" 
                  placeholder="First name*" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full bg-slate-50 border ${errors.firstName ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all placeholder-slate-400`}
                />
                {errors.firstName && <p className="text-[10px] text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Middle name" 
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all placeholder-slate-400"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Last name*" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full bg-slate-50 border ${errors.lastName ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all placeholder-slate-400`}
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
                  className={`w-full bg-slate-50 border ${errors.gender ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all cursor-pointer`}
                >
                  <option value="">--Select Gender--</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-[10px] text-red-500 mt-1">{errors.gender}</p>}
              </div>
              <div className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100/50">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">DOB :-</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="flex-1 bg-transparent text-sm outline-none text-slate-805 cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Row 3: Select State, Select District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className={`w-full bg-slate-50 border ${errors.state ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all cursor-pointer`}
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
                  className={`w-full bg-slate-50 border ${errors.district ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all cursor-pointer`}
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
                  className={`w-full bg-slate-50 border ${errors.address ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all placeholder-slate-400 h-[64px] resize-none`}
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div className="md:col-span-4 flex flex-col justify-start">
                <input 
                  type="text" 
                  placeholder="Enter Pincode*" 
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  className={`w-full bg-slate-50 border ${errors.pincode ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all placeholder-slate-400`}
                />
                {errors.pincode && <p className="text-[10px] text-red-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Row 5: Preferred Communication Language */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 py-1">
              <span>Select Preferred Communication Language :</span>
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
                <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-slate-50 focus-within:bg-white">
                  <input 
                    type="tel" 
                    placeholder="Mobile no*" 
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-805 placeholder-slate-400 w-full"
                  />
                  <button 
                    type="button" 
                    onClick={handleSendOTPRegistration}
                    className="bg-[#0c408f] hover:bg-[#0a3576] text-white font-extrabold text-xs px-5 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Send OTP
                  </button>
                </div>
                {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
                {otpSent && <p className="text-[10px] text-emerald-600 mt-1">OTP sent successfully!</p>}
              </div>

              {/* OTP Input Group */}
              <div>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-slate-50 focus-within:bg-white">
                  <input 
                    type="text" 
                    placeholder="Mobile OTP*" 
                    value={formData.otp}
                    onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-850 placeholder-slate-400 w-full"
                  />
                  <button 
                    type="button" 
                    onClick={handleVerifyOTPRegistration}
                    className="bg-[#13b183] hover:bg-[#0f966e] text-white font-extrabold text-xs px-6 transition-colors whitespace-nowrap cursor-pointer"
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
                    className={`w-full bg-slate-50 border ${errors.captcha ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50'} rounded-xl px-4 py-2.5 text-sm outline-none text-slate-805 transition-all placeholder-slate-400`}
                  />
                  {errors.captcha && <p className="text-[10px] text-red-500 mt-1">{errors.captcha}</p>}
                </div>
                
                {/* Captcha Image styling */}
                <div className="flex items-center gap-2">
                  <div 
                    className="px-4 py-2 bg-pink-50 border border-pink-100 rounded-xl font-mono font-bold tracking-widest text-lg text-slate-850 relative overflow-hidden select-none"
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
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
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
                className="w-full py-3.5 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
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

    {/* CITIZEN FORGOT PASSWORD FULL WIDTH VIEW LAYOUT */}
    {mode === 'forgot' && (
      <>
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* FORGOT PASSWORD FORM BODY */}
        <div className="p-8 md:p-10 space-y-6 text-left bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-[#f8fafc]">
          <h3 className="text-xl font-bold text-[#0c408f] tracking-wide uppercase text-center mb-6">
            Citizen Forgot Password
          </h3>

          {forgotSuccess ? (
            <div className="w-full max-w-sm mx-auto py-6 text-center space-y-4 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#13b183] flex items-center justify-center border border-emerald-100 shadow-sm">
                <CheckCircle2 className="h-9 w-9 animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Update Successful</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your password has been reset successfully. You can now use your new password to log in.
              </p>
              <button 
                onClick={() => {
                  setMode('login');
                  setForgotSuccess(false);
                  setErrors({});
                }}
                className="w-full py-3 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer mt-4"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {/* Row 1: Mobile no and OTP Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Input Group */}
                <div>
                  <div className="flex border border-slate-300 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-white">
                    <input 
                      type="tel" 
                      placeholder="Mobile no*" 
                      value={forgotMobile}
                      onChange={(e) => setForgotMobile(e.target.value)}
                      disabled={otpSentForgot && otpVerifiedForgot}
                      className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                    />
                    <button 
                      type="button" 
                      onClick={handleSendOTPForgot}
                      disabled={otpVerifiedForgot}
                      className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs px-5 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {otpSentForgot ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {errors.forgotMobile && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotMobile}</p>}
                  {otpSentForgot && !otpVerifiedForgot && <p className="text-[10px] text-emerald-600 mt-1 pl-4">OTP sent successfully!</p>}
                </div>

                {/* OTP Input Group */}
                <div>
                  <div className="flex border border-slate-300 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-white">
                    <input 
                      type="text" 
                      placeholder="OTP Mobile*" 
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={otpVerifiedForgot}
                      className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOTPForgot}
                      disabled={!otpSentForgot || otpVerifiedForgot}
                      className="bg-[#4f46e5] hover:bg-indigo-600 text-white font-bold text-xs px-6 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  {errors.forgotOtp && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotOtp}</p>}
                  {otpVerifiedForgot && <p className="text-[10px] text-emerald-600 mt-1 pl-4">Mobile verified!</p>}
                </div>
              </div>

              {/* Row 2: New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={forgotNewPassword}
                    placeholder="New Password"
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className={`w-full bg-white border ${errors.forgotNewPassword ? 'border-red-500 bg-red-50/10' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50'} rounded-full pl-11 pr-10 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.forgotNewPassword && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotNewPassword}</p>}
              </div>

              {/* Row 3: Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={forgotConfirmPassword}
                    placeholder="Confirm Password"
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className={`w-full bg-white border ${errors.forgotConfirmPassword ? 'border-red-500 bg-red-50/10' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50'} rounded-full pl-11 pr-10 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.forgotConfirmPassword && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotConfirmPassword}</p>}
              </div>

              {/* Row 4: Captcha */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-700">Enter Captcha</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Enter Captcha" 
                      value={forgotCaptcha}
                      onChange={(e) => setForgotCaptcha(e.target.value)}
                      className={`w-full bg-white border ${errors.forgotCaptcha ? 'border-red-500 bg-red-50/10' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50'} rounded-full px-5 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                    />
                    {errors.forgotCaptcha && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotCaptcha}</p>}
                  </div>
                  
                  {/* Captcha display styling */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-4 py-2 bg-pink-50 border border-pink-100 rounded-xl font-mono font-bold tracking-widest text-lg text-slate-800 relative overflow-hidden select-none"
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
                      className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-blue-600 transition-colors cursor-pointer"
                      title="Refresh Captcha"
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="3">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Banner */}
              <div className="bg-red-50/80 border border-red-100/50 rounded-xl p-4 text-[11px] text-red-600 font-semibold leading-relaxed text-left">
                Note: The new password must include at least 8 alphanumeric characters with at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character from the set @$!%*?&.
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto md:px-12 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-full text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                >
                  Update
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setErrors({}); }} 
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </>
    )}

    {/* ADMINISTRATIVE FORGOT PASSWORD FULL WIDTH VIEW LAYOUT */}
    {mode === 'adminForgot' && (
      <>
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* FORGOT PASSWORD FORM BODY */}
        <div className="p-8 md:p-10 space-y-6 text-left bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-[#f8fafc]">
          <h3 className="text-xl font-bold text-[#0c408f] tracking-wide uppercase text-center mb-6">
            Administrative Forgot Password
          </h3>

          {forgotSuccess ? (
            <div className="w-full max-w-sm mx-auto py-6 text-center space-y-4 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#13b183] flex items-center justify-center border border-emerald-100 shadow-sm">
                <CheckCircle2 className="h-9 w-9 animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Update Successful</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your password has been reset successfully. You can now use your new password to log in.
              </p>
              <button 
                onClick={() => {
                  setMode('admin');
                  setForgotSuccess(false);
                  setErrors({});
                }}
                className="w-full py-3 bg-gradient-to-r from-[#0c408f] to-[#13b183] hover:from-[#0a3576] hover:to-[#0f966e] text-white font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer mt-4"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {/* Row 1: Mobile no and OTP Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Input Group */}
                <div>
                  <div className="flex border border-slate-300 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-white">
                    <input 
                      type="tel" 
                      placeholder="Mobile no*" 
                      value={forgotMobile}
                      onChange={(e) => setForgotMobile(e.target.value)}
                      disabled={otpSentForgot && otpVerifiedForgot}
                      className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                    />
                    <button 
                      type="button" 
                      onClick={handleSendOTPForgot}
                      disabled={otpVerifiedForgot}
                      className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs px-5 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {otpSentForgot ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {errors.forgotMobile && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotMobile}</p>}
                  {otpSentForgot && !otpVerifiedForgot && <p className="text-[10px] text-emerald-600 mt-1 pl-4">OTP sent successfully!</p>}
                </div>

                {/* OTP Input Group */}
                <div>
                  <div className="flex border border-slate-300 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-white">
                    <input 
                      type="text" 
                      placeholder="OTP Mobile*" 
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={otpVerifiedForgot}
                      className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOTPForgot}
                      disabled={!otpSentForgot || otpVerifiedForgot}
                      className="bg-[#4f46e5] hover:bg-indigo-600 text-white font-bold text-xs px-6 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  {errors.forgotOtp && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotOtp}</p>}
                  {otpVerifiedForgot && <p className="text-[10px] text-emerald-600 mt-1 pl-4">Mobile verified!</p>}
                </div>
              </div>

              {/* Row 2: Email ID and OTP Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Input Group */}
                <div>
                  <div className="flex border border-slate-300 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-white">
                    <input 
                      type="email" 
                      placeholder="Email ID*" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={otpSentForgotEmail && otpVerifiedForgotEmail}
                      className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                    />
                    <button 
                      type="button" 
                      onClick={handleSendOTPEmailForgot}
                      disabled={otpVerifiedForgotEmail}
                      className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs px-5 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {otpSentForgotEmail ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {errors.forgotEmail && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotEmail}</p>}
                  {otpSentForgotEmail && !otpVerifiedForgotEmail && <p className="text-[10px] text-emerald-600 mt-1 pl-4">OTP sent successfully!</p>}
                </div>

                {/* OTP Email Input Group */}
                <div>
                  <div className="flex border border-slate-300 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 bg-white">
                    <input 
                      type="text" 
                      placeholder="OTP Email*" 
                      value={forgotEmailOtp}
                      onChange={(e) => setForgotEmailOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={otpVerifiedForgotEmail}
                      className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 w-full"
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOTPEmailForgot}
                      disabled={!otpSentForgotEmail || otpVerifiedForgotEmail}
                      className="bg-[#4f46e5] hover:bg-indigo-600 text-white font-bold text-xs px-6 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  {errors.forgotEmailOtp && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotEmailOtp}</p>}
                  {otpVerifiedForgotEmail && <p className="text-[10px] text-emerald-600 mt-1 pl-4">Email verified!</p>}
                </div>
              </div>

              {/* Row 3: New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={forgotNewPassword}
                    placeholder="New Password"
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className={`w-full bg-white border ${errors.forgotNewPassword ? 'border-red-500 bg-red-50/10' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50'} rounded-full pl-11 pr-10 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.forgotNewPassword && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotNewPassword}</p>}
              </div>

              {/* Row 4: Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={forgotConfirmPassword}
                    placeholder="Confirm Password"
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className={`w-full bg-white border ${errors.forgotConfirmPassword ? 'border-red-500 bg-red-50/10' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50'} rounded-full pl-11 pr-10 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.forgotConfirmPassword && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotConfirmPassword}</p>}
              </div>

              {/* Row 5: Captcha */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-700">Enter Captcha</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Enter Captcha" 
                      value={forgotCaptcha}
                      onChange={(e) => setForgotCaptcha(e.target.value)}
                      className={`w-full bg-white border ${errors.forgotCaptcha ? 'border-red-500 bg-red-50/10' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50'} rounded-full px-5 py-2.5 text-sm outline-none text-slate-800 transition-all placeholder-slate-400`}
                    />
                    {errors.forgotCaptcha && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.forgotCaptcha}</p>}
                  </div>
                  
                  {/* Captcha display styling */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-4 py-2 bg-pink-50 border border-pink-100 rounded-xl font-mono font-bold tracking-widest text-lg text-slate-800 relative overflow-hidden select-none"
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
                      className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-blue-600 transition-colors cursor-pointer"
                      title="Refresh Captcha"
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth="3">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Banner */}
              <div className="bg-red-50/80 border border-red-100/50 rounded-xl p-4 text-[11px] text-red-600 font-semibold leading-relaxed text-left">
                Note: The new password must include at least 8 alphanumeric characters with at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character from the set @$!%*?&.
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto md:px-12 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-full text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                >
                  Update
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setMode('admin'); setErrors({}); }} 
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </>
    )}

      </div>
    </div>
  );
}
