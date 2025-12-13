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

    // Profile photo states
    const [profilePhoto, setProfilePhoto] = useState(currentUser?.photo || null);
    const [previewPhoto, setPreviewPhoto] = useState(currentUser?.photo || null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoError, setPhotoError] = useState('');
    const fileInputRef = useRef(null);

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

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setPhotoError('');

        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setPhotoError('Please upload a valid image (JPG, PNG, or WebP)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setPhotoError('Image size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPhoto(reader.result);
            setPhotoFile(file);
        };
        reader.readAsDataURL(file);
    };

    // Trigger file input
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    // Remove photo
    const handleRemovePhoto = () => {
        setPreviewPhoto(null);
        setPhotoFile(null);
        setPhotoError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
        const isChangingPhoto = photoFile !== null;

        if (!isChangingPassword && !isChangingPhoto) {
            setErrors({ submit: 'Please change your password or photo to update' });
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
                
                // Photo data (if changing)
                ...(isChangingPhoto && {
                    profile_photo: photoFile
                }),
            };

            console.group('📤 CHANGE PASSWORD SUBMISSION');
            console.log('Is changing password:', isChangingPassword);
            console.log('Is changing photo:', isChangingPhoto);
            console.log('Photo file:', photoFile);
            console.log('Update data:', updateData);
            console.groupEnd();

            // ✅ Call AuthContext changePassword
            const result = await changePassword(updateData);

            console.log('✅ Change password result:', result);
            
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
                'Failed to update profile. Please try again.';
            
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
            setPreviewPhoto(currentUser?.photo || null);
            setPhotoFile(null);
            setPhotoError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Update Profile</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Success Alert */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Profile updated successfully!
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
                        {/* Profile Photo Section */}
                        <div className="border-b border-gray-200 pb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Profile Photo
                            </label>
                            
                            <div className="flex items-center gap-4">
                                {/* Photo Preview */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                        {previewPhoto ? (
                                            <img
                                                src={previewPhoto}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Camera button overlay */}
                                    <button
                                        type="button"
                                        onClick={handlePhotoClick}
                                        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg"
                                        title="Change photo"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Upload/Remove Buttons */}
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handlePhotoClick}
                                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Upload Photo
                                        </button>
                                        
                                        {previewPhoto && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 mt-2">
                                        JPG, PNG or WebP. Max 5MB.
                                    </p>
                                    
                                    {photoError && (
                                        <p className="text-xs text-red-600 mt-1">{photoError}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Password Section Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Key className="w-5 h-5 text-gray-600" />
                                <h4 className="text-sm font-medium text-gray-700">Change Password (Optional)</h4>
                            </div>

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
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Update Profile
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}