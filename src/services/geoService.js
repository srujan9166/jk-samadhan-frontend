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

  getBlocks: async (districtId) => {
    const response = await axiosClient.get(`/api/geo/districts/${districtId}/blocks`);
    return response.data;
  },

  getMunicipalities: async (districtId) => {
    const response = await axiosClient.get(`/api/geo/districts/${districtId}/municipalities`);
    return response.data;
  },

  getPanchayats: async (blockId) => {
    const response = await axiosClient.get(`/api/geo/blocks/${blockId}/panchayats`);
    return response.data;
  },

  getWards: async (municipalityId) => {
    const response = await axiosClient.get(`/api/geo/municipalities/${municipalityId}/wards`);
    return response.data;
  },
};

export default geoService;
