import axiosClient from '../api/axiosClient';

const authService = {
  getCaptcha: async () => {
    const response = await axiosClient.post('/auth/captcha');
    return response.data;
  },

  login: async (identifier, password, otpCode = '') => {
    const cleanIdentifier = identifier ? identifier.trim() : '';
    const isEmail = cleanIdentifier.includes('@');
    const response = await axiosClient.post('/auth/login', {
      mobile: !isEmail ? cleanIdentifier : '',
      email: isEmail ? cleanIdentifier : '',
      username: cleanIdentifier,
      password: password ? password : '',
      otpCode: otpCode ? otpCode.trim() : '',
    });
    return response.data;
  },

  register: async (registerData) => {
    const response = await axiosClient.post('/auth/signup', registerData);
    return response.data;
  },

  forgotPassword: async (forgotPasswordData) => {
    const response = await axiosClient.post('/auth/forgot-password', forgotPasswordData);
    return response.data;
  },
};

export default authService;
