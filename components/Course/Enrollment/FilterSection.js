import { Search, Filter, X, Building2, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function FilterSection({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterCompany,
    setFilterCompany,
    companyUnits = [],
    filteredCount,
    totalCount
}) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const activeFiltersCount = 
        (filterStatus !== 'all' ? 1 : 0) + 
        (filterCompany !== 'all' ? 1 : 0) +
        (searchQuery ? 1 : 0);

    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setFilterCompany('all');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Search & Filter</h3>
                        <p className="text-xs text-gray-600">Find and filter courses quickly</p>
                    </div>
                </div>
                
                {/* Active Filters Badge */}
                {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={clearAllFilters}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Clear all filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            
            <div className="p-5 space-y-4">
                {/* Search Bar - Enhanced */}
                <div className="relative">
                    <label htmlFor="search-courses" className="block text-sm font-semibold text-gray-700 mb-2">
                        Search Courses
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="search-courses"
                            type="text"
                            placeholder="Search by course title, description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Searching for: "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Enrollment Status Filter */}
                    <div>
                        <label htmlFor="filter-status" className="block text-sm font-semibold text-gray-700 mb-2">
                            Enrollment Status
                        </label>
                        <div className="relative">
                            <select
                                id="filter-status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            >
                                <option value="all">All Courses</option>
                                <option value="enrolled">Has Enrollments</option>
                                <option value="not-enrolled">No Enrollments</option>
                            </select>
                        </div>
                    </div>

                    {/* Company Filter */}
                    <div>
                        <label htmlFor="filter-company" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Company Unit
                        </label>
                        <div className="relative">
                            <select
                                id="filter-company"
                                value={filterCompany}
                                onChange={(e) => setFilterCompany(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            >
                                <option value="all">All Companies</option>
                                {companyUnits.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Summary Bar */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-900">{filteredCount}</span> of{' '}
                            <span className="font-bold text-gray-900">{totalCount}</span> courses
                        </p>
                    </div>
                    
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            <X className="w-4 h-4" />
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}