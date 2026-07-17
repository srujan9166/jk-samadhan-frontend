import axiosClient from '../api/axiosClient';

const geoService = {
  getDivisions: async () => {
    const response = await axiosClient.get('/api/geo/divisions');
    return response.data;
  },

  getDistricts: async (divisionId) => {
    const response = await axiosClient.get(`/api/geo/divisions/${divisionId}/districts`);
    return response.data;
  },
};

export default geoService;
