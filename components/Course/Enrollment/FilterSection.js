// components/FilterSection.js
import { Search, X, ChevronDown } from "lucide-react";
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
    const [isOpen, setIsOpen] = useState(false);
    
    const hasFilters = filterStatus !== 'all' || filterCompany !== 'all' || searchQuery;

    const clearAll = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setFilterCompany('all');
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Compact Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    {/* Search Input - Always Visible */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${
                            hasFilters
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Filters
                        {hasFilters && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                {(filterStatus !== 'all' ? 1 : 0) + (filterCompany !== 'all' ? 1 : 0)}
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Results Count */}
                <span className="text-sm text-gray-600 ml-4">
                    <span className="font-semibold text-gray-900">{filteredCount}</span> / {totalCount}
                </span>
            </div>

            {/* Collapsible Filters */}
            {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="enrolled">Has Enrollments</option>
                                <option value="not-enrolled">No Enrollments</option>
                            </select>
                        </div>

                        {/* Company Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Company
                            </label>
                            <select
                                value={filterCompany}
                                onChange={(e) => setFilterCompany(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Clear All */}
                    {hasFilters && (
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={clearAll}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}