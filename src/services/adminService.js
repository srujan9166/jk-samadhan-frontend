import axiosClient from '../api/axiosClient';

const adminService = {
  getDashboardHome: async (showToast = false) => {
    const response = await axiosClient.get(`/api/admin/home?showToast=${showToast}`);
    return response.data;
  },

  getDeptMapping: async () => {
    const response = await axiosClient.get('/api/admin/deptMapping');
    return response.data;
  },

  addDeptCategory: async (mappingData) => {
    const response = await axiosClient.post('/api/admin/addDeptCategory', mappingData);
    return response.data;
  },

  getDepartments: async () => {
    const response = await axiosClient.get('/api/masters/departments');
    return response.data;
  },

  createDepartment: async (deptData) => {
    const response = await axiosClient.post('/api/masters/departments', deptData);
    return response.data;
  },

  updateDepartment: async (id, deptData) => {
    const response = await axiosClient.put(`/api/masters/departments/${id}`, deptData);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await axiosClient.delete(`/api/masters/departments/${id}`);
    return response.data;
  },

  getDesignations: async () => {
    const response = await axiosClient.get('/api/masters/designations');
    return response.data;
  },

  createDesignation: async (data) => {
    const response = await axiosClient.post('/api/masters/designations', data);
    return response.data;
  },

  updateDesignation: async (id, data) => {
    const response = await axiosClient.put(`/api/masters/designations/${id}`, data);
    return response.data;
  },

  deleteDesignation: async (id) => {
    const response = await axiosClient.delete(`/api/masters/designations/${id}`);
    return response.data;
  },

  createNodal: async (nodalData) => {
    const response = await axiosClient.post('/api/admin/createNodal', nodalData);
    return response.data;
  },

  getNodalByDept: async (departmentName) => {
    const response = await axiosClient.get(`/api/admin/deptUser?departmentName=${encodeURIComponent(departmentName)}`);
    return response.data;
  },

  getDeptUsersList: async (departmentName) => {
    const response = await axiosClient.get(`/api/admin/deptUsersList?departmentName=${encodeURIComponent(departmentName)}`);
    return response.data;
  },

  getRoleDesignations: async () => {
    const response = await axiosClient.get('/api/masters/role-designations');
    return response.data;
  },

  createRoleDesignation: async (data) => {
    const response = await axiosClient.post('/api/masters/role-designations', data);
    return response.data;
  },

  updateRoleDesignation: async (id, data) => {
    const response = await axiosClient.put(`/api/masters/role-designations/${id}`, data);
    return response.data;
  },

  deleteRoleDesignation: async (id) => {
    const response = await axiosClient.delete(`/api/masters/role-designations/${id}`);
    return response.data;
  },

  getUserTypes: async () => {
    const response = await axiosClient.get('/api/masters/user-types');
    return response.data;
  }
};

export default adminService;
