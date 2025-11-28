import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const CustomSelect = ({ 
    label, 
    value, 
    options, 
    placeholder, 
    onChange, 
    disabled = false,
    tooltip 
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-700">
                    {label}
                </label>
                {tooltip && (
                    <div className="relative">
                        <button
                            type="button"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                        {showTooltip && (
                            <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                {tooltip}
                                <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none ${
                        disabled 
                            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                            : value
                            ? 'border-blue-500 focus:ring-blue-500 bg-white'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400'
                    }`}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                    ))}
                </select>

                {/* Custom Dropdown Arrow */}
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                    disabled ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    <ChevronDown className="w-5 h-5" />
                </div>

                {/* Selected Indicator */}
                {value && !disabled && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};