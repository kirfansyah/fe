import React from 'react';

export const CustomSelect = ({ label, value, options, placeholder, onChange, disabled = false }) => (
    <div className="flex flex-col items-start gap-2">
        <label className="text-gray-700 font-medium mb-2 text-lg">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            <option value="">{placeholder}</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);