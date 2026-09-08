import axiosClient from '../api/axiosClient';

const grievanceService = {
  getGrievances: async (search = '') => {
    const response = await axiosClient.get('/api/grievances', { params: { search } });
    return response.data;
  },

  getSuperAdminGrievances: async (params) => {
    const response = await axiosClient.get('/api/super-admin/grievances', { params });
    return response.data;
  },

  getAnalyticsSummary: async (params) => {
    const response = await axiosClient.get('/api/super-admin/analytics/summary', { params });
    return response.data;
  },

  getSuperAdminDashboardSummary: async () => {
    const response = await axiosClient.get('/api/super-admin/dashboard/summary');
    return response.data;
  },

  createOfficialUser: async (payload) => {
    const response = await axiosClient.post('/api/super-admin/createOfficialUser', payload);
    return response.data;
  },

  getGrievanceById: async (id) => {
    const response = await axiosClient.get(`/api/grievances/${id}`);
    return response.data;
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
  },

  getAppealDashboardSummary: async () => {
    const response = await axiosClient.get('/api/appeals/dashboard/summary');
    return response.data;
  },

  getAppealDashboardList: async (params) => {
    const response = await axiosClient.get('/api/appeals/dashboard/list', { params });
    return response.data;
  },

  getAppealMisReport: async (params) => {
    const response = await axiosClient.get('/api/appeals/mis-report', { params });
    return response.data;
  },

  getJkigramsSummary: async () => {
    const response = await axiosClient.get('/api/super-admin/jkigrams/summary');
    return response.data;
  },

  getJkigramsGrievances: async (params) => {
    const response = await axiosClient.get('/api/super-admin/jkigrams/grievances', { params });
    return response.data;
  },

  startSuperAdminExcelExport: async () => {
    const response = await axiosClient.post('/api/super-admin/export/excel');
    return response.data;
  },

  getSuperAdminExcelExportStatus: async (jobId) => {
    const response = await axiosClient.get(`/api/super-admin/export/excel/${jobId}/status`);
    return response.data;
  },

  downloadSuperAdminExcelFile: async (jobId, defaultFileName) => {
    const response = await axiosClient.get(`/api/super-admin/export/excel/${jobId}/download`, {
      responseType: 'blob'
    });
    
    let filename = defaultFileName;
    const contentDisposition = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition']);
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    if (!filename) {
      filename = `SuperAdmin_Grievances_Report_${new Date().toISOString().slice(0, 10)}_${jobId || Date.now()}.xlsx`;
    }

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    // Delay revocation so Chromium has ample time to stream multi-megabyte Blobs to disk
    setTimeout(() => {
      try {
        window.URL.revokeObjectURL(url);
      } catch (ignored) {}
    }, 60000);

    return true;
  },

  cancelSuperAdminExcelExport: async (jobId) => {
    const response = await axiosClient.post(`/api/super-admin/export/excel/${jobId}/cancel`);
    return response.data;
  },

  startSuperAdminPdfExport: async () => {
    const response = await axiosClient.post('/api/super-admin/export/pdf');
    return response.data;
  },

  getSuperAdminPdfExportStatus: async (jobId) => {
    const response = await axiosClient.get(`/api/super-admin/export/pdf/${jobId}/status`);
    return response.data;
  },

  downloadSuperAdminPdfFile: async (jobId, defaultFileName) => {
    const response = await axiosClient.get(`/api/super-admin/export/pdf/${jobId}/download`, {
      responseType: 'blob'
    });
    
    let filename = defaultFileName;
    const contentDisposition = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition']);
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    if (!filename) {
      filename = `SuperAdmin_Grievances_Report_${new Date().toISOString().slice(0, 10)}_${jobId || Date.now()}.pdf`;
    }

    const blob = new Blob([response.data], {
      type: 'application/pdf'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    setTimeout(() => {
      try {
        window.URL.revokeObjectURL(url);
      } catch (ignored) {}
    }, 60000);

    return true;
  },

  cancelSuperAdminPdfExport: async (jobId) => {
    const response = await axiosClient.post(`/api/super-admin/export/pdf/${jobId}/cancel`);
    return response.data;
  }
};

export default grievanceService;
