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
 * Appellate Authority Dashboard using Common Dashboard Components
 */
export default function AppellateDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const roleConfig = DASHBOARD_ROLE_CONFIG.APPELLATE;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await grievanceService.getGrievances();
      const appealCases = data.filter((g) => 
        g.windowType === 'Raabita' || 
        g.status?.toLowerCase() === 'appealed' ||
        g.status?.toLowerCase() === 'hearing scheduled' ||
        g.psga === 'Yes'
      );

      setAppeals(appealCases);
      
      const total = appealCases.length;
      const pending = appealCases.filter((g) => g.status === 'Hearing Scheduled').length;
      const resolved = appealCases.filter((g) => g.status === 'Resolved' || g.status === 'Disposed').length;
      const rejected = appealCases.filter((g) => g.status === 'Rejected').length;

      setStats({ total, pending, resolved, rejected });
    } catch (err) {
      console.error('Error loading Appellate dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = appeals.filter((g) => {
    if (statusFilter && g.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        g.id?.toString().includes(query) ||
        g.department?.toLowerCase().includes(query) ||
        g.grievanceCategory?.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query) ||
        (g.submittedBy?.name || '').toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  const handleAction = (action, item) => {
    if (item?.id) {
      navigate(`/appeal/${item.id}`);
    }
  };

  return (
    <DashboardLayout
      user={user}
      role="APPELLATE"
      roleTitle="Appellate Authority"
      sidebarItems={roleConfig.sidebar || []}
      activeSidebarItem="Appellate Dashboard"
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
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />

        {/* Reusable DataTable Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Reusable Filters */}
          <TableFilters
            title="Appeals Queue"
            pageSize={pageSize}
            onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
            searchQuery={searchQuery}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            placeholder="Search appeals by ID, department, citizen..."
            onRefresh={loadData}
            isRefreshing={isLoading}
            statusFilter={statusFilter}
            statusOptions={['Hearing Scheduled', 'Resolved', 'Rejected']}
            onStatusFilterChange={(st) => { setStatusFilter(st); setCurrentPage(1); }}
          />

          {/* Reusable Common Grievance/Appeals Table */}
          <GrievanceTable
            data={paginatedData.map(g => ({
              ...g,
              grievanceId: `JK-APL-${100000 + g.id}`,
              citizen: g.submittedBy?.name || g.citizenName || 'Citizen',
              createdDate: g.createdAt || g.createdDate || g.date
            }))}
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
