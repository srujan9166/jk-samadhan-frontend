import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import emblemImg from '../../assets/emblem.png';
import grievanceService from '../../services/grievanceService';
import KPICards from '../../components/dashboard/KPICards';
import TableFilters from '../../components/dashboard/TableFilters';
import GrievanceTable from '../../components/dashboard/GrievanceTable';
import Pagination from '../../components/dashboard/Pagination';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { DASHBOARD_ROLE_CONFIG } from '../../config/dashboardConfig';

/**
 * Dealing Hand Dashboard using Common Dashboard Components
 */
export default function DealingHandDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0, appealed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const roleConfig = DASHBOARD_ROLE_CONFIG.DEALING_HAND;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await grievanceService.getGrievances();
      setGrievances(data);
      
      const total = data.length;
      const pending = data.filter((g) => g.status === 'Pending').length;
      const resolved = data.filter((g) => g.status === 'Resolved').length;
      const rejected = data.filter((g) => g.status === 'Rejected').length;
      const appealed = data.filter((g) => g.status === 'Appealed').length;

      setStats({ total, pending, resolved, rejected, appealed });
    } catch (err) {
      console.error('Error loading Dealing Hand dashboard:', err);
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
        g.description?.toLowerCase().includes(query) ||
        (g.citizenName || '').toLowerCase().includes(query)
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
      navigate(`/grievance/${item.id}`);
    }
  };

  const handleSidebarSelect = (itemId) => {
    if (itemId === 'Lodge Grievance Form' || itemId === 'Lodge Grievance' || itemId === 'Lodge Offline Case') {
      navigate('/dh-lodge');
    }
  };

  return (
    <DashboardLayout
      user={user}
      role="DEALING_HAND"
      roleTitle="Dealing Hand"
      sidebarItems={roleConfig.sidebar || []}
      activeSidebarItem="DealingHand Dashboard"
      onSelectSidebarItem={handleSidebarSelect}
      onLogout={onLogout}
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-left">
        {/* Top Header Actions */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
              Assigned Grievances
            </h2>
            <p className="text-xs text-slate-500 mt-1">Review, process, and update status of grievances assigned to you</p>
          </div>
          <button 
            onClick={() => navigate('/dh-lodge')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border-0 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Lodge Offline Case</span>
          </button>
        </div>
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
            title="Assigned Grievances Queue"
            pageSize={pageSize}
            onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
            searchQuery={searchQuery}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            placeholder="Search by ID, department, citizen..."
            onRefresh={loadData}
            isRefreshing={isLoading}
            statusFilter={statusFilter}
            statusOptions={['Pending', 'Resolved', 'Rejected', 'Appealed']}
            onStatusFilterChange={(st) => { setStatusFilter(st); setCurrentPage(1); }}
          />

          {/* Reusable Common Grievance Table */}
          <GrievanceTable
            data={paginatedData.map(g => ({
              ...g,
              grievanceId: `JK-${100000 + g.id}`,
              citizen: g.citizenName || 'Citizen',
              category: g.grievanceCategory || 'N/A',
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
