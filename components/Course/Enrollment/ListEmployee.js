import { useState, useEffect } from "react";
import { Users, Search, ChevronDown, X, Plus, Check, AlertCircle, Filter, Info, Lock } from "lucide-react";
import { useCourses } from "../../../hooks/useCourses";
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { useDebounce } from '../../../hooks/useDebounce'; // ✅ Add debounce
import API from '../../../services/api';

export default function ListEmployee({ created_by }) {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500); // ✅ Debounce search
    
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showGroupingModal, setShowGroupingModal] = useState(false);
    const [selectedGroupings, setSelectedGroupings] = useState([]);
    const [initialGroupings, setInitialGroupings] = useState([]);
    
    // Filter states
    const [showCompanyFilter, setShowCompanyFilter] = useState(false);
    const [showDeptFilter, setShowDeptFilter] = useState(false);
    const [showPositionFilter, setShowPositionFilter] = useState(false);
    const [showGroupingFilter, setShowGroupingFilter] = useState(false);
    
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedDepts, setSelectedDepts] = useState([]);
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [selectedGroupingFilters, setSelectedGroupingFilters] = useState([]);
    
    const { employeeData, groupEnroll, fetchEmployeeData, error, handleSaveAssignEmployeeGrouping } = useCourses();
    const { showLoading, showSuccess, showError, confirmAction, showWarning } = useSweetAlert();
    
    const employees = employeeData?.data || [];
    const pagination = employeeData?.pagination || {
        totalCount: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 1
    };

    // ✅ Fetch all employees untuk filter options
    const [allEmployees, setAllEmployees] = useState([]);
    const [companyMap, setCompanyMap] = useState({});
    const [deptMap, setDeptMap] = useState({});
    
    useEffect(() => {
        const fetchAllForFilters = async () => {
            try {
                const response = await API.post('/employee', { 
                    params: { page: 1, limit: 99999 } 
                });
                const data = response.data?.data || [];
                console.log('All employees for filters:', data);
                setAllEmployees(data);
                
                // ✅ Build maps: name → id
                const compMap = {};
                const depMap = {};
                data.forEach(emp => {
                    if (emp.company_name && emp.company_id) {
                        compMap[emp.company_name] = emp.company_id;
                    }
                    if (emp.dept_abbr && emp.dept_id) {
                        depMap[emp.dept_abbr] = emp.dept_id;
                    }
                });
                setCompanyMap(compMap);
                setDeptMap(depMap);
            } catch (err) {
                console.error('Error fetching all employees:', err);
            }
        };
        fetchAllForFilters();
    }, []);

    // ✅ Fetch dengan filters (server-side) - use debounced search
    useEffect(() => {
        const filters = {
            search: debouncedSearch,
            company_id: selectedCompanies.map(name => companyMap[name]).filter(Boolean),
            dept_id: selectedDepts.map(name => deptMap[name]).filter(Boolean),
            grouping_id: selectedGroupingFilters
        };
        
        fetchEmployeeData(currentPage, pageSize, filters);
    }, [currentPage, pageSize, debouncedSearch, selectedCompanies, selectedDepts, selectedGroupingFilters, companyMap, deptMap]);

    // ✅ Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedCompanies, selectedDepts, selectedPositions, selectedGroupingFilters]);

    const availableGroupings = groupEnroll || [];

    const isAllEmployeeGrouping = (grouping) => {
        const name = grouping?.name_group?.toLowerCase() || '';
        return name === 'all employee' || name === 'all employees';
    };

    // Get unique values dari ALL employees
    const uniqueCompanies = [...new Set(allEmployees.map(e => e.company_name))].filter(Boolean);
    const uniqueDepts = [...new Set(allEmployees.map(e => e.dept_abbr))].filter(Boolean);
    const uniquePositions = [...new Set(allEmployees.map(e => e.position_name))].filter(Boolean);

    const getGroupingColor = (groupingId) => {
        const colorMap = {
            '1': 'bg-gray-500 text-white',
            '2': 'bg-red-500 text-white',
            '3': 'bg-blue-500 text-white',
            '4': 'bg-green-500 text-white',
            '5': 'bg-purple-500 text-white',
            '6': 'bg-yellow-500 text-white',
        };
        return colorMap[groupingId] || 'bg-gray-400 text-white';
    };

    // Filter handlers
    const handleCompanyToggle = (company) => {
        setSelectedCompanies(prev => 
            prev.includes(company) 
                ? prev.filter(c => c !== company)
                : [...prev, company]
        );
    };

    const handleDeptToggle = (dept) => {
        setSelectedDepts(prev => 
            prev.includes(dept) 
                ? prev.filter(d => d !== dept)
                : [...prev, dept]
        );
    };

    const handlePositionToggle = (position) => {
        setSelectedPositions(prev => 
            prev.includes(position) 
                ? prev.filter(p => p !== position)
                : [...prev, position]
        );
    };

    const handleGroupingFilterToggle = (groupingId) => {
        setSelectedGroupingFilters(prev => 
            prev.includes(groupingId) 
                ? prev.filter(g => g !== groupingId)
                : [...prev, groupingId]
        );
    };

    const clearAllFilters = () => {
        setSelectedCompanies([]);
        setSelectedDepts([]);
        setSelectedPositions([]);
        setSelectedGroupingFilters([]);
        setSearchQuery('');
    };

    const activeFiltersCount = 
        selectedCompanies.length + 
        selectedDepts.length + 
        selectedPositions.length + 
        selectedGroupingFilters.length;

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedEmployees(employees.map(emp => emp.no_ktp));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (no_ktp, checked) => {
        if (checked) {
            setSelectedEmployees([...selectedEmployees, no_ktp]);
        } else {
            setSelectedEmployees(selectedEmployees.filter(empKtp => empKtp !== no_ktp));
        }
    };

    const handleOpenGroupingModal = async () => {
        if (selectedEmployees.length === 0) {
            showWarning('Please select at least one employee');
            return;
        }

        const selectedEmployeesData = await Promise.all(
            selectedEmployees.map(async (no_ktp) => {
                let emp = employees.find(e => e.no_ktp === no_ktp);
                
                if (!emp) {
                    try {
                        const response = await API.get(`/employee/${no_ktp}`);
                        emp = response.data?.data;
                    } catch (err) {
                        console.error('Error fetching employee:', err);
                    }
                }
                
                return emp;
            })
        );

        if (selectedEmployees.length > 1) {
            const groupingSets = selectedEmployeesData.map(emp => {
                return new Set(emp?.groupings?.map(g => g.id_grouping) || []);
            });
            
            const firstSet = groupingSets[0];
            const allSame = groupingSets.every(set => 
                set.size === firstSet.size && 
                [...set].every(id => firstSet.has(id))
            );
            
            if (!allSame) {
                const result = await confirmAction({
                    title: 'Different Groupings Detected',
                    html: `
                        <div class="text-left">
                            <p class="mb-3">Selected employees have different groupings.</p>
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <p class="text-sm text-blue-800 font-semibold mb-2">How it works:</p>
                                <ul class="text-sm text-blue-700 space-y-1">
                                    <li>✓ <strong>Tick</strong> a grouping = ADD to all selected employees</li>
                                    <li>✗ <strong>Untick</strong> a grouping = REMOVE from all selected employees</li>
                                    <li>📌 Only <strong>common groupings</strong> are pre-selected</li>
                                    <li>🔒 <strong>"All Employee"</strong> is managed automatically</li>
                                </ul>
                            </div>
                            <p class="text-sm text-gray-600">Continue with bulk assignment?</p>
                        </div>
                    `,
                    confirmButtonText: 'Yes, continue',
                    icon: 'info'
                });
                
                if (!result.isConfirmed) return;
            }
        }

        if (selectedEmployees.length === 1) {
            const emp = selectedEmployeesData[0];
            const existingGroupingIds = emp?.groupings?.map(g => g.id_grouping) || [];
            setSelectedGroupings(existingGroupingIds);
            setInitialGroupings(existingGroupingIds);
        } else {
            const commonGroupings = availableGroupings.filter(grouping => {
                return selectedEmployeesData.every(emp => {
                    return emp?.groupings?.some(g => g.id_grouping === grouping.id);
                });
            }).map(g => g.id);
            
            setSelectedGroupings(commonGroupings);
            setInitialGroupings(commonGroupings);
        }

        setShowGroupingModal(true);
    };

    const handleToggleGrouping = (groupingId) => {
        const grouping = availableGroupings.find(g => g.id === groupingId);
        
        if (isAllEmployeeGrouping(grouping)) {
            return;
        }
        
        if (selectedGroupings.includes(groupingId)) {
            setSelectedGroupings(selectedGroupings.filter(id => id !== groupingId));
        } else {
            setSelectedGroupings([...selectedGroupings, groupingId]);
        }
    };

    const handleSaveGroupings = async () => {
    const allEmployeeId = availableGroupings.find(g => isAllEmployeeGrouping(g))?.id;
    
    const groupingsToAdd = selectedGroupings.filter(id => 
        !initialGroupings.includes(id) && id !== allEmployeeId
    );
    const groupingsToRemove = initialGroupings.filter(id => 
        !selectedGroupings.includes(id) && id !== allEmployeeId
    );

    if (groupingsToAdd.length === 0 && groupingsToRemove.length === 0) {
        showWarning('No changes detected');
        return;
    }

    let confirmHtml = '<div class="text-left">';
    
    if (selectedEmployees.length === 1) {
        const emp = employees.find(e => e.no_ktp === selectedEmployees[0]);
        confirmHtml += `<p class="mb-3">Update groupings for <strong>${emp?.nama}</strong>:</p>`;
    } else {
        confirmHtml += `<p class="mb-3">Update groupings for <strong>${selectedEmployees.length} employees</strong>:</p>`;
    }

    confirmHtml += '<div class="space-y-2">';
    
    if (groupingsToAdd.length > 0) {
        confirmHtml += '<div class="bg-green-50 border border-green-200 rounded p-2">';
        confirmHtml += '<p class="text-sm font-semibold text-green-800 mb-1">✓ Add:</p>';
        groupingsToAdd.forEach(id => {
            const g = availableGroupings.find(gr => gr.id === id);
            if (g) confirmHtml += `<span class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mr-1 mb-1">${g.name_group}</span>`;
        });
        confirmHtml += '</div>';
    }
    
    if (groupingsToRemove.length > 0) {
        confirmHtml += '<div class="bg-red-50 border border-red-200 rounded p-2">';
        confirmHtml += '<p class="text-sm font-semibold text-red-800 mb-1">✗ Remove:</p>';
        groupingsToRemove.forEach(id => {
            const g = availableGroupings.find(gr => gr.id === id);
            if (g) confirmHtml += `<span class="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded mr-1 mb-1">${g.name_group}</span>`;
        });
        confirmHtml += '</div>';
    }
    
    confirmHtml += '</div></div>';

    const result = await confirmAction({
        title: 'Update Groupings?',
        html: confirmHtml,
        confirmButtonText: 'Yes, update!',
        icon: 'question'
    });
    
    if (!result.isConfirmed) return;

    try {
        showLoading('Updating groupings...');
        
        // ✅ Build users array dengan full_name
        const users = selectedEmployees.map(no_ktp => {
            const emp = employees.find(e => e.no_ktp === no_ktp);
            return {
                no_ktp: no_ktp,
                full_name: emp?.nama || ''
            };
        });

        // ✅ NEW PAYLOAD FORMAT
        const payload = {
            users: users,
            groups: [...groupingsToAdd, ...groupingsToRemove], // Gabung ADD dan REMOVE
            assigned_by: created_by
        };

        await handleSaveAssignEmployeeGrouping(payload);
        
        let successMsg = 'Groupings updated successfully';
        if (groupingsToAdd.length > 0 && groupingsToRemove.length > 0) {
            successMsg += ` (${groupingsToAdd.length} added, ${groupingsToRemove.length} removed)`;
        } else if (groupingsToAdd.length > 0) {
            successMsg += ` (${groupingsToAdd.length} added)`;
        } else {
            successMsg += ` (${groupingsToRemove.length} removed)`;
        }
        
        showSuccess(successMsg);
        
        setShowGroupingModal(false);
        setSelectedEmployees([]);
        setSelectedGroupings([]);
        setInitialGroupings([]);
        
        // ✅ Refresh
        const filters = {
            search: debouncedSearch,
            company_id: selectedCompanies.map(name => companyMap[name]).filter(Boolean),
            dept_id: selectedDepts.map(name => deptMap[name]).filter(Boolean),
            grouping_id: selectedGroupingFilters
        };
        fetchEmployeeData(currentPage, pageSize, filters);
    } catch (error) {
        showError('Failed to update groupings: ' + error.message);
    }
};

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        if (error) {
            console.error('Employee fetch error:', error);
        }
    }, [error]);

    const FilterDropdown = ({ 
        show, 
        onClose, 
        title, 
        items = [],           
        selectedItems = [],
        onToggle, 
        children 
    }) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 z-40" onClick={onClose}>
                <div 
                    className="absolute mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
                    style={{ 
                        top: '180px',
                        right: title === 'Company Unit' ? '420px' : 
                               title === 'Department' ? '280px' :
                               title === 'Position' ? '140px' : '20px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                            {selectedItems.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (title === 'Company Unit') setSelectedCompanies([]);
                                        if (title === 'Department') setSelectedDepts([]);
                                        if (title === 'Position') setSelectedPositions([]);
                                        if (title === 'Grouping') setSelectedGroupingFilters([]);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                        {children || (
                            <div className="space-y-1">
                                {items.map((item, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item)}
                                            onChange={() => onToggle(item)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </label>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-center py-4 text-sm text-gray-500">
                                        No options available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                    <button 
                        onClick={handleOpenGroupingModal}
                        disabled={selectedEmployees.length === 0}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Users size={20} />
                        Manage Grouping
                        {selectedEmployees.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-700 rounded-full text-xs">
                                {selectedEmployees.length}
                            </span>
                        )}
                    </button>

                    {/* ✅ Search with debounce indicator */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"     
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                        />
                        {/* ✅ Loading indicator */}
                        {searchQuery !== debouncedSearch && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowCompanyFilter(!showCompanyFilter);
                                setShowDeptFilter(false);
                                setShowPositionFilter(false);
                                setShowGroupingFilter(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
                                selectedCompanies.length > 0
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <span>Company Unit</span>
                            {selectedCompanies.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {selectedCompanies.length}
                                </span>
                            )}
                            <ChevronDown size={16} />
                        </button>
                        <FilterDropdown
                            show={showCompanyFilter}
                            onClose={() => setShowCompanyFilter(false)}
                            title="Company Unit"
                            items={uniqueCompanies}
                            selectedItems={selectedCompanies}
                            onToggle={handleCompanyToggle}
                        />
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowDeptFilter(!showDeptFilter);
                                setShowCompanyFilter(false);
                                setShowPositionFilter(false);
                                setShowGroupingFilter(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
                                selectedDepts.length > 0
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <span>Department</span>
                            {selectedDepts.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {selectedDepts.length}
                                </span>
                            )}
                            <ChevronDown size={16} />
                        </button>
                        <FilterDropdown
                            show={showDeptFilter}
                            onClose={() => setShowDeptFilter(false)}
                            title="Department"
                            items={uniqueDepts}
                            selectedItems={selectedDepts}
                            onToggle={handleDeptToggle}
                        />
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowPositionFilter(!showPositionFilter);
                                setShowCompanyFilter(false);
                                setShowDeptFilter(false);
                                setShowGroupingFilter(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
                                selectedPositions.length > 0
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <span>Position</span>
                            {selectedPositions.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {selectedPositions.length}
                                </span>
                            )}
                            <ChevronDown size={16} />
                        </button>
                        <FilterDropdown
                            show={showPositionFilter}
                            onClose={() => setShowPositionFilter(false)}
                            title="Position"
                            items={uniquePositions}
                            selectedItems={selectedPositions}
                            onToggle={handlePositionToggle}
                        />
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowGroupingFilter(!showGroupingFilter);
                                setShowCompanyFilter(false);
                                setShowDeptFilter(false);
                                setShowPositionFilter(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
                                selectedGroupingFilters.length > 0
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <span>Grouping</span>
                            {selectedGroupingFilters.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {selectedGroupingFilters.length}
                                </span>
                            )}
                            <ChevronDown size={16} />
                        </button>
                        <FilterDropdown
                            show={showGroupingFilter}
                            onClose={() => setShowGroupingFilter(false)}
                            title="Grouping"
                        >
                            <div className="space-y-1">
                                {availableGroupings.map((grouping) => (
                                    <label
                                        key={grouping.id}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGroupingFilters.includes(grouping.id)}
                                            onChange={() => handleGroupingFilterToggle(grouping.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm text-gray-700">{grouping.name_group}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGroupingColor(grouping.id)}`}>
                                                {grouping.name_group}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </FilterDropdown>
                    </div>
                </div>
            </div>

            {/* Active Filters Badge */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <Filter size={16} className="text-blue-600" />
                        <span className="text-blue-800 font-medium">
                            {activeFiltersCount} filter(s) active
                        </span>
                    </div>
                    
                    {selectedCompanies.map(company => (
                        <span key={company} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {company}
                            <button onClick={() => handleCompanyToggle(company)}>
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    
                    {selectedDepts.map(dept => (
                        <span key={dept} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {dept}
                            <button onClick={() => handleDeptToggle(dept)}>
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    
                    {selectedPositions.map(position => (
                        <span key={position} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {position}
                            <button onClick={() => handlePositionToggle(position)}>
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    
                    {selectedGroupingFilters.map(gId => {
                        const g = availableGroupings.find(gr => gr.id === gId);
                        return g ? (
                            <span key={gId} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                {g.name_group}
                                <button onClick={() => handleGroupingFilterToggle(gId)}>
                                    <X size={14} />
                                </button>
                            </span>
                        ) : null;
                    })}
                    
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Selected info */}
            {selectedEmployees.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-blue-800 font-medium">
                        {selectedEmployees.length} employee(s) selected
                    </span>
                    <button 
                        onClick={() => setSelectedEmployees([])}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            {/* ✅ Table - Langsung pakai employees (NO filtering di sini) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-12 px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={employees.length > 0 && employees.every(emp => selectedEmployees.includes(emp.no_ktp))}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID Karyawan</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Position</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Department</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Company Unit</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Groupings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((employee) => (
                                <tr 
                                    key={employee.employee_id} 
                                    className={`hover:bg-gray-50 transition-colors ${
                                        selectedEmployees.includes(employee.no_ktp) ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(employee.no_ktp)}
                                            onChange={(e) => handleSelectEmployee(employee.no_ktp, e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{employee.nama}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{employee.employee_id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{employee.position_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{employee.dept_abbr}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{employee.company_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {employee.groupings && employee.groupings.length > 0 ? (
                                                employee.groupings.map((grouping, index) => (
                                                    <span
                                                        key={index}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getGroupingColor(grouping.id_grouping)}`}
                                                    >
                                                        {grouping.grouping_name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No grouping</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {employees.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No employees found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {activeFiltersCount > 0 || searchQuery 
                                ? "Try adjusting your search or filters"
                                : "No employees available"
                            }
                        </p>
                        {(activeFiltersCount > 0 || searchQuery) && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ✅ Pagination - Pakai data dari backend */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Showing {pagination.totalCount > 0 ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 : 0} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} employees
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </span>
                    
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= pagination.totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* ✅ UPDATED Modal - All Employee Readonly */}
            {showGroupingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Manage Groupings
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedEmployees.length === 1 
                                        ? "Tick to add, untick to remove groupings"
                                        : `Bulk assignment for ${selectedEmployees.length} employees`
                                    }
                                </p>
                            </div>
                            <button
                                onClick={() => setShowGroupingModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Info Box for Multiple Selection */}
                        {selectedEmployees.length > 1 && (
                            <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Bulk Operations:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>✓ <strong>Tick</strong> = Add to all selected employees</li>
                                            <li>✗ <strong>Untick</strong> = Remove from all selected employees</li>
                                            <li>📌 Pre-selected = Common groupings (all employees have)</li>
                                            <li>🔒 <strong>"All Employee"</strong> is managed automatically by system</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selected Employees Summary */}
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Selected Employees:</div>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                                {selectedEmployees.slice(0, 5).map(no_ktp => {
                                    const emp = employees.find(e => e.no_ktp === no_ktp);
                                    return emp ? (
                                        <div key={no_ktp} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-sm font-medium text-gray-900 truncate">
                                                    {emp.nama}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({emp.employee_id})
                                                </span>
                                            </div>
                                            
                                            {emp.groupings && emp.groupings.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 ml-2">
                                                    {emp.groupings.map((g, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full"
                                                        >
                                                            {g.grouping_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No grouping</span>
                                            )}
                                        </div>
                                    ) : null;
                                })}
                                {selectedEmployees.length > 5 && (
                                    <div className="text-xs text-gray-500 text-center py-1">
                                        +{selectedEmployees.length - 5} more employees
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ✅ Grouping Selection - All Employee Readonly */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-3">
                                {availableGroupings.map((grouping) => {
                                    const employeesWithThisGrouping = selectedEmployees.filter(no_ktp => {
                                        const emp = employees.find(e => e.no_ktp === no_ktp);
                                        return emp?.groupings?.some(g => g.id_grouping === grouping.id);
                                    });
                                    
                                    const allHave = employeesWithThisGrouping.length === selectedEmployees.length;
                                    const someHave = employeesWithThisGrouping.length > 0 && 
                                                     employeesWithThisGrouping.length < selectedEmployees.length;
                                    const noneHave = employeesWithThisGrouping.length === 0;
                                    
                                    // ✅ Check if this is "All Employee"
                                    const isAllEmployee = isAllEmployeeGrouping(grouping);
                                    
                                    return (
                                        <label
                                            key={grouping.id}
                                            className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all ${
                                                isAllEmployee 
                                                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-75' 
                                                    : selectedGroupings.includes(grouping.id)
                                                        ? 'border-blue-500 bg-blue-50 cursor-pointer'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGroupings.includes(grouping.id)}
                                                onChange={() => handleToggleGrouping(grouping.id)}
                                                disabled={isAllEmployee}
                                                className={`w-5 h-5 mt-0.5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                                                    isAllEmployee 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-blue-600 cursor-pointer'
                                                }`}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`font-medium ${isAllEmployee ? 'text-gray-600' : 'text-gray-900'}`}>
                                                        {grouping.name_group}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGroupingColor(grouping.id)}`}>
                                                        {grouping.name_group}
                                                    </span>
                                                    
                                                    {/* ✅ Locked Badge */}
                                                    {isAllEmployee && (
                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full flex items-center gap-1">
                                                            <Lock size={12} />
                                                            System Managed
                                                        </span>
                                                    )}
                                                    
                                                    {/* Visual Status - Only for non-All Employee */}
                                                    {!isAllEmployee && selectedEmployees.length > 1 && (
                                                        <>
                                                            {allHave && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                                                    <Check size={12} />
                                                                    All have ({employeesWithThisGrouping.length}/{selectedEmployees.length})
                                                                </span>
                                                            )}
                                                            {someHave && (
                                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                                                                    <AlertCircle size={12} />
                                                                    {employeesWithThisGrouping.length}/{selectedEmployees.length} have
                                                                </span>
                                                            )}
                                                            {noneHave && (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                                    None have (0/{selectedEmployees.length})
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <p className={`text-sm ${isAllEmployee ? 'text-gray-500 italic' : 'text-gray-600'}`}>
                                                    {isAllEmployee 
                                                        ? 'Automatically assigned to all employees by system'
                                                        : (grouping.description || 'No description')
                                                    }
                                                </p>
                                            </div>
                                            {selectedGroupings.includes(grouping.id) && (
                                                <Check size={20} className={isAllEmployee ? 'text-gray-400' : 'text-blue-600'} />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <div className="text-sm text-gray-600">
                                {selectedGroupings.length} grouping(s) selected
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowGroupingModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveGroupings}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Check size={20} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}