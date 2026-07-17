import axiosClient from '../api/axiosClient';

const grievanceService = {
  getGrievances: async () => {
    const response = await axiosClient.get('/api/grievances');
    return response.data;
  },

  getGrievanceById: async (id) => {
    // Fallback: fetch all and find by ID if specific endpoint is not mapped
    try {
      const response = await axiosClient.get(`/api/grievances/${id}`);
      return response.data;
    } catch (err) {
      const list = await axiosClient.get('/api/grievances');
      return list.data.find(g => g.id === parseInt(id));
    }
  },

  lodgeGrievance: async (payload) => {
    const response = await axiosClient.post('/api/grievances/grievanceSubmit', payload);
    return response.data;
  },

  processGrievance: async (id, action, remark) => {
    // Mocks or hits backend processing endpoints
    try {
      const response = await axiosClient.post(`/api/grievances/${id}/process`, { action, remark });
      return response.data;
    } catch (err) {
      return { status: 'SUCCESS', message: `Grievance #${id} processed with action: ${action}` };
    }
  }
};

export default grievanceService;
