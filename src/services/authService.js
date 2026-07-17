import axiosClient from '../api/axiosClient';

const authService = {
  getCaptcha: async () => {
    const response = await axiosClient.post('/auth/captcha');
    return response.data;
  },

  login: async (mobile, password, otpCode = '') => {
    const response = await axiosClient.post('/auth/login', {
      mobile,
      password,
      otpCode,
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
