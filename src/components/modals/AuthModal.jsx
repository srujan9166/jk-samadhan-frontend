import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Lock, Phone, User, CheckCircle2, ShieldCheck, Mail, ShieldAlert, KeyRound, Eye, EyeOff, RefreshCw } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import authService from '../../services/authService';
import geoService from '../../services/geoService';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'admin', 'forgot'
  const [step, setStep] = useState(1); // 1: Input details, 2: OTP verification, 3: Success
  const [showPassword, setShowPassword] = useState(false);
  
  // Captcha State
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [localCaptchaText, setLocalCaptchaText] = useState('NK4KG4');

  // Geo State
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');

  const { register, handleSubmit, setValue, trigger, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      mobile: '',
      password: '',
      otp: '',
      username: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dob: '',
      state: '',
      district: '',
      address: '',
      pincode: '',
      captcha: '',
      confirmPassword: ''
    }
  });

  const formValues = watch();

  const generateLocalCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setLocalCaptchaText(result);
  };

  const fetchCaptcha = async () => {
    try {
      const data = await authService.getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaImage(data.captchaImage);
    } catch (err) {
      console.error('Error fetching captcha:', err);
    }
  };

  const handleRefreshCaptcha = () => {
    if (mode === 'forgot') {
      generateLocalCaptcha();
    } else {
      fetchCaptcha();
    }
  };

  // Load geo divisions/districts on J&K select
  useEffect(() => {
    const loadDivisions = async () => {
      if (formValues.state === 'Jammu & Kashmir') {
        try {
          const data = await geoService.getDivisions();
          setDivisions(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setDivisions([]);
        setDistricts([]);
        setSelectedDivision('');
        setValue('district', '');
      }
    };
    loadDivisions();
  }, [formValues.state, setValue]);

  // Load districts on division selection
  const handleDivisionChange = async (e) => {
    const divisionId = e.target.value;
    setSelectedDivision(divisionId);
    setValue('district', '');
    if (divisionId) {
      try {
        const data = await geoService.getDistricts(divisionId);
        setDistricts(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setDistricts([]);
    }
  };

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setShowPassword(false);
      reset();
      fetchCaptcha();
      generateLocalCaptcha();
      setSelectedDivision('');
      setDistricts([]);
      setDivisions([]);
    }
  }, [isOpen, initialMode, reset]);

  const handleSendOTP = async () => {
    const isValid = await trigger(['mobile', 'password']);
    if (isValid) {
      try {
        // Trigger login initiation to trigger mock OTP send on backend
        const response = await login(formValues.mobile, formValues.password, '');
        if (response.status === 'OTP_REQUIRED') {
          setStep(2);
        } else if (response.status === 'SUCCESS') {
          onLoginSuccess(response.user);
          onClose();
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Login credentials incorrect');
      }
    }
  };

  const handleVerifyOTP = async () => {
    const isValid = await trigger(['otp']);
    if (isValid) {
      try {
        const response = await login(formValues.mobile, formValues.password, formValues.otp);
        if (response.status === 'SUCCESS') {
          onLoginSuccess(response.user);
          onClose();
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Invalid OTP code');
      }
    }
  };

  const handleRegisterSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        dateOfBirth: data.dob,
        captchaId,
        captchaCode: data.captcha
      };
      const response = await authService.register(payload);
      alert(response.message || 'Registration completed successfully!');
      setMode('login');
      setStep(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const handleForgotSubmit = async (data) => {
    if (data.captcha !== localCaptchaText) {
      alert('Invalid captcha code');
      return;
    }
    if (data.password !== data.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const payload = {
        mobile: data.mobile,
        password: data.password,
        confirmPassword: data.confirmPassword
      };
      const message = await authService.forgotPassword(payload);
      alert(message || 'Password reset successfully!');
      setMode('login');
      setStep(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Reset password failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#164581] text-white px-6 py-4 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="h-9 w-9 object-contain" />
            <div className="text-left">
              <h3 className="font-bold text-sm leading-tight">
                {mode === 'register' ? 'Register Account' : mode === 'forgot' ? 'Forgot Password' : mode === 'admin' ? 'Official Sign In' : 'Portal Sign In'}
              </h3>
              <span className="text-[10px] text-slate-350 tracking-wider font-semibold uppercase">JK Samadhan Portal</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          
          {/* LOGIN MODE */}
          {(mode === 'login' || mode === 'admin') && step === 1 && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Enter 10-digit mobile"
                    {...register('mobile', { required: 'Mobile is required', pattern: /^\d{10}$/ })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 outline-none font-mono"
                  />
                </div>
                {errors.mobile && <span className="text-[10px] text-red-600 block font-bold">Valid 10-digit mobile is required</span>}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-[10px] text-red-650 block font-bold">{errors.password.message}</span>}
              </div>

              {/* Captcha Box */}
              {captchaImage && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase">Enter Verification Captcha</label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 flex-1 flex justify-center">
                      <img src={captchaImage} alt="Captcha" className="h-8 object-contain select-none pointer-events-none" />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRefreshCaptcha}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg text-slate-650 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter captcha text"
                    {...register('captcha', { required: 'Captcha is required' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none uppercase tracking-widest font-bold font-mono"
                  />
                  {errors.captcha && <span className="text-[10px] text-red-650 block font-bold">{errors.captcha.message}</span>}
                </div>
              )}

              <button 
                onClick={handleSendOTP}
                className="w-full py-2.5 bg-[#164581] hover:bg-[#08182d] text-white font-bold rounded-lg shadow-xs cursor-pointer border-0 mt-2 flex items-center justify-center gap-1.5"
              >
                <span>Verify Credentials & Send OTP</span>
                <ShieldCheck className="h-4.5 w-4.5 text-white" />
              </button>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setMode('forgot')} className="hover:underline cursor-pointer bg-transparent border-0 text-slate-500 font-medium">Forgot Password?</button>
                {mode === 'admin' ? (
                  <button type="button" onClick={() => setMode('login')} className="text-[#ff9933] font-bold hover:underline cursor-pointer bg-transparent border-0">Citizen Sign In</button>
                ) : (
                  <button type="button" onClick={() => setMode('register')} className="text-[#ff9933] font-bold hover:underline cursor-pointer bg-transparent border-0">New User? Register</button>
                )}
              </div>
            </div>
          )}

          {/* OTP STEP */}
          {(mode === 'login' || mode === 'admin') && step === 2 && (
            <div className="space-y-4 text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-slate-650 leading-relaxed text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>We have sent a 6-digit verification code OTP to your mobile number <strong>{formValues.mobile}</strong>. (Mock OTP: 123456)</span>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  placeholder="e.g. 123456"
                  maxLength={6}
                  {...register('otp', { required: 'OTP code is required', pattern: /^\d{6}$/ })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 outline-none tracking-widest font-mono text-center text-lg font-bold"
                />
                {errors.otp && <span className="text-[10px] text-red-650 block font-bold">Valid 6-digit OTP code is required</span>}
              </div>

              <button 
                onClick={handleVerifyOTP}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer border-0"
              >
                Complete Login
              </button>
            </div>
          )}

          {/* REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4 text-left">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">First Name</label>
                  <input type="text" {...register('firstName', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Middle Name</label>
                  <input type="text" {...register('middleName')} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Last Name</label>
                  <input type="text" {...register('lastName', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Gender</label>
                  <select {...register('gender', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Date of Birth</label>
                  <input type="date" {...register('dob', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none text-slate-650" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Mobile Number</label>
                  <input type="text" placeholder="10 digits" {...register('mobile', { required: true, pattern: /^\d{10}$/ })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Email Address</label>
                  <input type="email" placeholder="john@example.com" {...register('email', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">State</label>
                  <select {...register('state', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none">
                    <option value="">Select State</option>
                    <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {formValues.state === 'Jammu & Kashmir' ? (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 uppercase">Division</label>
                    <select 
                      value={selectedDivision} 
                      onChange={handleDivisionChange} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none"
                    >
                      <option value="">Select Division</option>
                      {divisions.map(div => (
                        <option key={div.id} value={div.id}>{div.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 uppercase">District</label>
                    <select 
                      {...register('district', { required: true })} 
                      disabled={!formValues.state} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none disabled:opacity-60"
                    >
                      <option value="">Select District</option>
                      {formValues.state && (
                        <option value="Other">Other</option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {formValues.state === 'Jammu & Kashmir' && districts.length > 0 && (
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Select District</label>
                  <select 
                    {...register('district', { required: true })} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2.5 outline-none"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Street Address</label>
                <textarea {...register('address', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 h-14 resize-none outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Pincode</label>
                  <input type="text" {...register('pincode', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Secure Password</label>
                  <input type="password" {...register('password', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 outline-none" />
                </div>
              </div>

              {/* Captcha Box */}
              {captchaImage && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase">Verification Captcha</label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 flex-1 flex justify-center">
                      <img src={captchaImage} alt="Captcha" className="h-8 object-contain" />
                    </div>
                    <button type="button" onClick={handleRefreshCaptcha} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg text-slate-650 cursor-pointer">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <input type="text" placeholder="Enter captcha" {...register('captcha', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none uppercase font-bold tracking-wider" />
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-[#ff9933] hover:bg-orange-600 text-white font-extrabold rounded-lg shadow-sm cursor-pointer border-0 mt-2">
                Register Citizen Profile
              </button>

              <div className="text-center pt-2">
                <button type="button" onClick={() => setMode('login')} className="text-slate-500 font-bold hover:underline cursor-pointer bg-transparent border-0">Already have an account? Sign In</button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleSubmit(handleForgotSubmit)} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Registered Mobile</label>
                <input type="text" {...register('mobile', { required: true, pattern: /^\d{10}$/ })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 outline-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">New Password</label>
                <input type="password" {...register('password', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Confirm Password</label>
                <input type="password" {...register('confirmPassword', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 outline-none" />
              </div>

              {/* Local static captcha block for recovery */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase">Enter Verification Captcha</label>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 flex-1 flex justify-center text-lg font-black font-mono tracking-widest text-[#164581] select-none select-none italic decoration-clone">
                    {localCaptchaText}
                  </div>
                  <button type="button" onClick={handleRefreshCaptcha} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg text-slate-650 cursor-pointer">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <input type="text" placeholder="Enter captcha" {...register('captcha', { required: true })} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none uppercase font-bold tracking-wider" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm cursor-pointer border-0 mt-2">
                Update Account Password
              </button>

              <div className="text-center pt-2">
                <button type="button" onClick={() => setMode('login')} className="text-slate-500 font-bold hover:underline cursor-pointer bg-transparent border-0">Cancel and Back to Login</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
