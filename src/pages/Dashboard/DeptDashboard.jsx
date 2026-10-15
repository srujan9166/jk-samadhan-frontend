import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emblemImg from '../../assets/emblem.png';
import grievanceService from '../../services/grievanceService';
import KPICards from '../../components/dashboard/KPICards';
import TableFilters from '../../components/dashboard/TableFilters';
import GrievanceTable from '../../components/dashboard/GrievanceTable';
import Pagination from '../../components/dashboard/Pagination';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { DASHBOARD_ROLE_CONFIG } from '../../config/dashboardConfig';

/**
 * Department Dashboard using Common Dashboard Components
 */
export default function DeptDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0, forwarded: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const roleConfig = DASHBOARD_ROLE_CONFIG.DEPARTMENT;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await grievanceService.getGrievances();
      setGrievances(data);

      const total = data.length;
      const pending = data.filter((g) => g.status === 'Pending' || g.status === 'Under Review').length;
      const resolved = data.filter((g) => g.status === 'Resolved').length;
      const rejected = data.filter((g) => g.status === 'Rejected').length;
      const forwarded = data.filter((g) => g.status === 'Forwarded').length;

      setStats({ total, pending, resolved, rejected, forwarded });
    } catch (err) {
      console.error('Error loading Dept dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = grievances.filter((g) => {
    if (statusFilter && g.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        g.id?.toString().includes(query) ||
        g.department?.toLowerCase().includes(query) ||
        g.grievanceCategory?.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  const handleAction = (action, item) => {
    if (action === 'process' || action === 'view') {
      navigate(`/process-grievance/${item.id}`);
    }
  };

  return (
    <DashboardLayout
      user={user}
      role="DEPARTMENT"
      roleTitle="Department Nodal"
      sidebarItems={roleConfig.sidebar || []}
      activeSidebarItem="Department Dashboard"
      onSelectSidebarItem={() => {}}
      onLogout={onLogout}
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-left">
        {/* Reusable Common KPI Cards */}
        <KPICards
          config={roleConfig.kpis}
          stats={stats}
          activeFilter={statusFilter}
          onCardClick={(val) => {
            setStatusFilter(val === statusFilter ? '' : val);
            setCurrentPage(1);
          }}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        />

        {/* Reusable DataTable Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Reusable Filters */}
          <TableFilters
            pageSize={pageSize}
            onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
            searchQuery={searchQuery}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            placeholder="Search by ID, department, category..."
            onRefresh={loadData}
            isRefreshing={isLoading}
            statusFilter={statusFilter}
            statusOptions={['Pending', 'Resolved', 'Rejected', 'Forwarded']}
            onStatusFilterChange={(st) => { setStatusFilter(st); setCurrentPage(1); }}
          />

          {/* Reusable Common Grievance Table */}
          <GrievanceTable
            data={paginatedData}
            config={roleConfig.table}
            isLoading={isLoading}
            onAction={handleAction}
            startIndex={startIndex}
          />

          {/* Reusable Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
