import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Download, 
  X, 
  Eye, 
  Layers, 
  Folder, 
  FileText,
  Building2,
  ListFilter
} from 'lucide-react';
import grievanceService from '../../services/grievanceService';

export default function TreeDashboard() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [childrenData, setChildrenData] = useState({});
  const [loadingNodes, setLoadingNodes] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalGrievances, setModalGrievances] = useState([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Load departments list on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await grievanceService.getTreeDepartments();
      if (Array.isArray(res)) {
        const deptNames = res.map(d => typeof d === 'string' ? d : (d.name || d.department_name)).filter(Boolean);
        setDepartments(deptNames);
      }
    } catch (err) {
      console.error('Error fetching departments for Tree Dashboard:', err);
    }
  };

  // Fetch root categories when department changes
  const handleDepartmentChange = async (deptName) => {
    setSelectedDept(deptName);
    setExpandedNodes({});
    setChildrenData({});

    if (!deptName || deptName === '0') {
      setTreeData([]);
      return;
    }

    setIsLoadingTree(true);
    try {
      const res = await grievanceService.getTreeMainCategories(deptName);
      if (Array.isArray(res)) {
        const formatted = res.map(item => ({
          name: item.category_name || item.name || 'General',
          count: item.count !== undefined ? item.count : (item.cnt || 0),
          level: 1,
          type: 'category'
        }));
        setTreeData(formatted);
      }
    } catch (err) {
      console.error('Error fetching main categories:', err);
      setTreeData([]);
    } finally {
      setIsLoadingTree(false);
    }
  };

  // Toggle expand/collapse node and load children
  const toggleNode = async (nodePath, nodeName, level) => {
    const isExpanded = expandedNodes[nodePath];

    if (isExpanded) {
      setExpandedNodes(prev => ({ ...prev, [nodePath]: false }));
      return;
    }

    // Expand
    setExpandedNodes(prev => ({ ...prev, [nodePath]: true }));

    // If children already loaded, return
    if (childrenData[nodePath]) return;

    // Fetch child subcategories
    setLoadingNodes(prev => ({ ...prev, [nodePath]: true }));
    try {
      const res = await grievanceService.getTreeSubCategories(selectedDept, nodeName);
      if (Array.isArray(res)) {
        const formatted = res.map(item => ({
          name: item.sub_category_name || item.name || 'General',
          count: item.count !== undefined ? item.count : (item.cnt || 0),
          level: level + 1,
          type: 'subcategory'
        }));
        setChildrenData(prev => ({ ...prev, [nodePath]: formatted }));
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    } finally {
      setLoadingNodes(prev => ({ ...prev, [nodePath]: false }));
    }
  };

  // Open Grievance List Modal on badge click
  const handleBadgeClick = async (e, nodeName, parentCategory = '') => {
    e.stopPropagation();
    setModalTitle(`${nodeName} (${selectedDept || 'All Departments'})`);
    setIsModalOpen(true);
    setIsLoadingModal(true);

    try {
      const res = await grievanceService.getTreeGrievances(
        selectedDept,
        parentCategory || nodeName,
        parentCategory ? nodeName : ''
      );
      if (Array.isArray(res)) {
        setModalGrievances(res);
      } else {
        setModalGrievances([]);
      }
    } catch (err) {
      console.error('Error fetching tree modal grievances:', err);
      setModalGrievances([]);
    } finally {
      setIsLoadingModal(false);
    }
  };

  // Print Tree function matching JKSv2
  const handlePrintTree = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-xs animate-fadeIn text-left">
      {/* ── CARD 1: DEPARTMENT FILTER BAR ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                Tree Dashboard
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Hierarchical view of department grievances and category breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDepartmentChange(selectedDept)}
              disabled={isLoadingTree}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border-0 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTree ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handlePrintTree}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border-0 cursor-pointer shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Tree</span>
            </button>
          </div>
        </div>

        {/* Department Dropdown Selection */}
        <div className="max-w-md">
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
            List of Departments:
          </label>
          <select
            value={selectedDept}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 outline-none font-semibold text-slate-800 dark:text-slate-200 text-xs focus:border-blue-600 shadow-2xs"
          >
            <option value="0">-- Select Department --</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── CARD 2: INTERACTIVE TREE VIEW ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs min-h-[350px]">
        {!selectedDept || selectedDept === '0' ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">
              No Department Selected
            </h4>
            <p className="text-slate-500 max-w-sm mx-auto text-xs">
              Please select a department from the dropdown above to expand and explore its category tree hierarchy and grievance counts.
            </p>
          </div>
        ) : isLoadingTree ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <span className="block font-bold text-slate-600 dark:text-slate-400">Loading Department Category Tree...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Root Department Header Node */}
            <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="font-extrabold text-blue-900 dark:text-blue-300 text-sm">{selectedDept}</span>
            </div>

            {/* Tree Nodes List */}
            {treeData.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-semibold">
                No category records found for this department.
              </div>
            ) : (
              <div className="pl-2 space-y-1 font-sans">
                {treeData.map((node, idx) => {
                  const nodePath = `root_${idx}`;
                  const isExpanded = expandedNodes[nodePath];
                  const isLoadingChild = loadingNodes[nodePath];
                  const children = childrenData[nodePath] || [];

                  return (
                    <div key={idx} className="space-y-1">
                      {/* Level 1 Category Node */}
                      <div 
                        onClick={() => toggleNode(nodePath, node.name, 1)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <button className="p-0.5 text-slate-400 group-hover:text-blue-600 border-0 bg-transparent cursor-pointer">
                            {isLoadingChild ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            ) : isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <Folder className={`w-4 h-4 ${isExpanded ? 'text-blue-600 fill-blue-100 dark:fill-blue-950' : 'text-slate-400'}`} />
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{node.name}</span>
                        </div>

                        {/* Count Badge */}
                        <span 
                          onClick={(e) => handleBadgeClick(e, node.name)}
                          title="Click to view grievances"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-extrabold text-[11px] transition-transform hover:scale-105 shadow-2xs border-0 cursor-pointer"
                        >
                          {node.count}
                        </span>
                      </div>

                      {/* Level 2 Subcategories Children Container */}
                      {isExpanded && (
                        <div className="pl-6 border-l-2 border-blue-100 dark:border-slate-800 ml-4 space-y-1 py-1">
                          {children.length === 0 && !isLoadingChild ? (
                            <div className="text-[11px] text-slate-400 py-1 pl-3 italic">
                              No sub-categories recorded
                            </div>
                          ) : (
                            children.map((cNode, cIdx) => (
                              <div key={cIdx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{cNode.name}</span>
                                </div>
                                <span 
                                  onClick={(e) => handleBadgeClick(e, cNode.name, node.name)}
                                  title="Click to view subcategory grievances"
                                  className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-extrabold text-[10px] transition-transform hover:scale-105 shadow-2xs border-0 cursor-pointer"
                                >
                                  {cNode.count}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: TREE DASHBOARD DATA MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <ListFilter className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Grievance List — <span className="text-blue-600">{modalTitle}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border-0 bg-transparent cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingModal ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
                  <span className="block font-bold text-slate-600 dark:text-slate-400">Loading node grievances...</span>
                </div>
              ) : modalGrievances.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold">
                  No grievances found for this node.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-600 text-white font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="p-3 text-center">S. No.</th>
                        <th className="p-3">Grievance ID</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Submitted By</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalGrievances.map((g, idx) => (
                        <tr key={idx} className="border-b border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold font-mono text-blue-600 dark:text-blue-400">{g.grievanceId || g.referenceId || `JK-${g.id}`}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{g.department || selectedDept || 'N/A'}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{g.category || 'N/A'}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{g.submittedBy || g.applicantName || 'Citizen'}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              (g.status || '').toLowerCase() === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                              (g.status || '').toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {g.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[10px]">{g.date || 'N/A'}</td>
                          <td className="p-3 text-center">
                            <Link
                              to={`/superadmin/grievance-details/${g.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] no-underline shadow-2xs"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border-0 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
