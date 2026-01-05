'use client';

import React, { useState, useRef, useContext } from 'react';
import { 
    Lock,
    Eye,
    EyeOff,
    Shield,
    AlertCircle,
    CheckCircle,
    X,
    Key,
    Camera,
    Upload,
    User,
    Trash2
} from 'lucide-react';
import { AuthContext } from "../contexts/AuthContext";


export default function ChangePasswordModal({ isOpen, onClose, currentUser }) {
    // ✅ Get changePassword from AuthContext
    const { changePassword } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        text: '',
        color: ''
    });

    // Password validation rules
    const passwordRules = [
        { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'uppercase', text: 'One uppercase letter', regex: /[A-Z]/ },
        { id: 'lowercase', text: 'One lowercase letter', regex: /[a-z]/ },
        { id: 'number', text: 'One number', regex: /\d/ },
        { id: 'special', text: 'One special character', regex: /[@$!%*?&#]/ }
    ];



    

    // Check password strength
    const checkPasswordStrength = (password) => {
        let score = 0;
        const passed = {};

        passwordRules.forEach(rule => {
            if (rule.regex.test(password)) {
                score++;
                passed[rule.id] = true;
            } else {
                passed[rule.id] = false;
            }
        });

        let strength = { score, passed, text: '', color: '' };

        if (score === 0) {
            strength.text = '';
        } else if (score <= 2) {
            strength.text = 'Weak';
            strength.color = 'text-red-600';
        } else if (score <= 3) {
            strength.text = 'Fair';
            strength.color = 'text-orange-600';
        } else if (score <= 4) {
            strength.text = 'Good';
            strength.color = 'text-yellow-600';
        } else {
            strength.text = 'Strong';
            strength.color = 'text-green-600';
        }

        setPasswordStrength(strength);
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

        if (name === 'new_password') {
            checkPasswordStrength(value);
        }

        if (success) {
            setSuccess(false);
        }
    };

    // Toggle password visibility
    const togglePassword = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Only validate password if user is trying to change it
        const isChangingPassword = formData.current_password || 
                                   formData.new_password || 
                                   formData.confirm_password;

        if (isChangingPassword) {
            if (!formData.current_password) {
                newErrors.current_password = 'Current password is required';
            }

            if (!formData.new_password) {
                newErrors.new_password = 'New password is required';
            } else if (formData.new_password.length < 8) {
                newErrors.new_password = 'Password must be at least 8 characters';
            } else if (passwordStrength.score < 3) {
                newErrors.new_password = 'Password is too weak';
            }

            if (formData.new_password && formData.current_password === formData.new_password) {
                newErrors.new_password = 'New password must be different from current password';
            }

            if (!formData.confirm_password) {
                newErrors.confirm_password = 'Please confirm your new password';
            } else if (formData.new_password !== formData.confirm_password) {
                newErrors.confirm_password = 'Passwords do not match';
            }
        }

        return newErrors;
    };

    // ✅ Handle form submit with AuthContext
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Check if there's anything to update
        const isChangingPassword = formData.current_password || 
                                   formData.new_password || 
                                   formData.confirm_password;
        

        if (!isChangingPassword) {
            setErrors({ submit: 'Please change your password to update' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // ✅ Prepare data for AuthContext changePassword
            const updateData = {
                // Password data (if changing)
                ...(isChangingPassword && {
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                    confirm_new_password: formData.confirm_password
                }),
                
            };

            

            // ✅ Call AuthContext changePassword
            const result = await changePassword(updateData);

            
            setSuccess(true);
            
            // Auto close modal after success
            setTimeout(() => {
                handleClose();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Change password error:', error);
            
            // Handle different error scenarios
            const errorMessage = 
                error.response?.data?.message || 
                error.message || 
                'Failed to update Password. Please try again.';
            
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Handle close modal
    const handleClose = () => {
        if (!loading) {
            setFormData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setShowPasswords({
                current: false,
                new: false,
                confirm: false
            });
            setErrors({});
            setSuccess(false);
            setPasswordStrength({ score: 0, text: '', color: '', passed: {} });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Update Password</h3>
                    <button
                    onClick={handleClose}
                    disabled={loading}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                    >
                    <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="grid mb-4 gap-6">
                    {/* Success Alert */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Password updated successfully!
                                    </p>
                                    <p className="text-xs text-green-600 mt-0.5">
                                        Closing in a moment...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Alert */}
                    {errors.submit && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-sm text-red-800">{errors.submit}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Section Header */}
                        <div>
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="current_password"
                                            value={formData.current_password}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-1 ${
                                                errors.current_password 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePassword('current')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPasswords.current ? 
                                                <EyeOff className="w-4 h-4 text-gray-400" /> : 
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                    {errors.current_password && (
                                        <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="new_password"
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-1 ${
                                                errors.new_password 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePassword('new')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPasswords.new ? 
                                                <EyeOff className="w-4 h-4 text-gray-400" /> : 
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                    {errors.new_password && (
                                        <p className="mt-1 text-xs text-red-600">{errors.new_password}</p>
                                    )}
                                    
                                    {/* Password Strength */}
                                    {formData.new_password && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-600">Strength</span>
                                                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                                    {passwordStrength.text}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        passwordStrength.score === 1 ? 'bg-red-500 w-1/5' :
                                                        passwordStrength.score === 2 ? 'bg-red-500 w-2/5' :
                                                        passwordStrength.score === 3 ? 'bg-orange-500 w-3/5' :
                                                        passwordStrength.score === 4 ? 'bg-yellow-500 w-4/5' :
                                                        passwordStrength.score === 5 ? 'bg-green-500 w-full' :
                                                        'w-0'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-1 ${
                                                errors.confirm_password 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePassword('confirm')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPasswords.confirm ? 
                                                <EyeOff className="w-4 h-4 text-gray-400" /> : 
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>
                                    )}
                                    {formData.new_password && formData.confirm_password && 
                                        formData.new_password === formData.confirm_password && (
                                        <p className="mt-1 text-xs text-green-600 flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Passwords match
                                        </p>
                                    )}
                                </div>

                                {/* Password Requirements */}
                                {formData.new_password && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            {passwordRules.map(rule => (
                                                <div key={rule.id} className="flex items-center text-xs">
                                                    {passwordStrength.passed && passwordStrength.passed[rule.id] ? (
                                                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                                    ) : (
                                                        <div className="w-3 h-3 rounded-full border border-gray-300 mr-1" />
                                                    )}
                                                    <span className={
                                                        passwordStrength.passed && passwordStrength.passed[rule.id] 
                                                            ? 'text-green-600' 
                                                            : 'text-gray-500'
                                                    }>
                                                        {rule.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                {/* Footer */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-6 py-3 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Update Password
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}