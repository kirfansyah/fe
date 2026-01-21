import { useState } from "react";
import Admin from "layouts/Admin.js";
import OfflineLearningView from "../../components/Report/OfflineLearning";
import OnlineLearningView from "../../components/Report/OnlineLearning";
import { useReport } from "../../hooks/useReport";
import { useSweetAlert } from "../../hooks/useSweetAlert";
import { GraduationCap, BookOpen, TrendingUp, Users, CheckCircle,XCircle ,Clock   } from "lucide-react";
import { ReportStatsSkeleton } from "../../components/Loading/Skeleton";
import ErrorMessage from "../../components/Loading/ErrorMessage";

export default function Report() {
  const [activeTab, setActiveTab] = useState("online-learning");
  
  const {
    // Online Learning
    onlineLearning,
    onlineLearningPagination,
    loadingOnline,
    errorOnline,
    fetchOnlineLearning,

    // Offline Learning
    offlineLearning,
    offlineLearningPagination,
    loadingOffline,
    errorOffline,
    fetchOfflineLearning,
    addOfflineLearning,
    updateOfflineLearning,
    deleteOfflineLearning,

    // Master Data
    dept,
    company,
    loading,
    error,
    fetchEmployee,
    refetch
  } = useReport();
  
  const { showSuccess, showError } = useSweetAlert();

  const handleSaveOfflineLearning = async (offlineLearningData) => {
    try {
      await addOfflineLearning(offlineLearningData);
      showSuccess("Training certificate added successfully!");
      
      // ✅ Refresh offline learning data after add
      fetchOfflineLearning(1, 10);
    } catch (error) {
      console.error("Error creating certificate:", error);
      showError(error.message || "Failed to add training certificate");
    }
  };

  const handleUpdateOfflineLearning = async (id, offlineLearningData) => {
    try {
      await updateOfflineLearning(id, offlineLearningData);
      showSuccess("Training certificate updated successfully!");
      
      // ✅ Refresh offline learning data after update
      fetchOfflineLearning(1, 10);
    } catch (error) {
      console.error("Error updating certificate:", error);
      showError(error.message || "Failed to update training certificate");
    }
  };

  const handleDeleteOfflineLearning = async (id) => {
    try {
      await deleteOfflineLearning(id);
      showSuccess("Training certificate deleted successfully!");
      
      // ✅ Refresh offline learning data after delete
      fetchOfflineLearning(1, 10);
    } catch (error) {
      console.error("Error deleting certificate:", error);
      showError(error.message || "Failed to delete training certificate");
    }
  };

  // ✅ Calculate statistics with null safety
  const onlineStats = {
    total: onlineLearning?.length || 0,
    passed: onlineLearning?.filter(l => l.status === "Passed")?.length || 0,
    failed: onlineLearning?.filter(l => l.status === "Failed")?.length || 0,
    inProgress: onlineLearning?.filter(l => l.status === "In Progress")?.length || 0,
  };

  const offlineStats = {
    total: offlineLearning?.length || 0,
    active: offlineLearning?.filter(l => l.status === "Active" || l.status === "Valid")?.length || 0,
    expired: offlineLearning?.filter(l => l.status === "Expired")?.length || 0,
  };

  // ✅ Show error state for master data
  if (errorOnline) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorMessage 
          message={errorOnline} 
          onRetry={refetch}
          fullScreen 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Title & Stats Summary */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap size={36} className="text-blue-600" />
              Learning Reports
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage employee learning progress and certifications
            </p>
          </div>
          
          {/* Quick Stats Cards */}
          {(loadingOnline || loadingOffline) ? (
            <div className="flex gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 min-w-[140px] animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 min-w-[140px]">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <BookOpen size={16} />
                  <span>Online</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{onlineStats.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {onlineStats.passed} passed
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 min-w-[140px]">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <GraduationCap size={16} />
                  <span>Offline</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{offlineStats.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {offlineStats.active} active
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Stats Bar */}
        {(loadingOnline && activeTab === "online-learning") || (loadingOffline && activeTab === "offline-learning") ? (
          <ReportStatsSkeleton />
        ) : (
          <>
           {activeTab === "online-learning" && (
              <div className="grid grid-cols-4 gap-4">
                {/* ✅ Total Learners - Users sudah tepat */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Learners</p>
                      <p className="text-3xl font-bold mt-1">{onlineStats.total}</p>
                    </div>
                    <Users size={40} className="opacity-20" /> {/* ✅ Sudah tepat */}
                  </div>
                </div>
                
                {/* ✅ Passed - Ganti dengan CheckCircle atau Award */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Passed</p>
                      <p className="text-3xl font-bold mt-1">{onlineStats.passed}</p>
                    </div>
                    <CheckCircle size={40} className="opacity-20" /> {/* ✅ Lebih tepat dari TrendingUp */}
                    {/* Alternatif: <Award size={40} className="opacity-20" /> */}
                  </div>
                </div>
                
                {/* ✅ Failed - Ganti dengan XCircle atau AlertCircle */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Failed</p>
                      <p className="text-3xl font-bold mt-1">{onlineStats.failed}</p>
                    </div>
                    <XCircle size={40} className="opacity-20" /> {/* ✅ Lebih tepat dari BookOpen */}
                    {/* Alternatif: <AlertCircle size={40} className="opacity-20" /> */}
                  </div>
                </div>
                
                {/* ✅ In Progress - Ganti dengan Clock atau Loader */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">In Progress</p>
                      <p className="text-3xl font-bold mt-1">{onlineStats.inProgress}</p>
                    </div>
                    <Clock size={40} className="opacity-20" /> {/* ✅ Lebih tepat dari GraduationCap */}
                    {/* Alternatif: <Loader size={40} className="opacity-20" /> */}
                    {/* Alternatif: <PlayCircle size={40} className="opacity-20" /> */}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "offline-learning" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Certificates</p>
                      <p className="text-3xl font-bold mt-1">{offlineStats.total}</p>
                    </div>
                    <GraduationCap size={40} className="opacity-20" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active</p>
                      <p className="text-3xl font-bold mt-1">{offlineStats.active}</p>
                    </div>
                    <TrendingUp size={40} className="opacity-20" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Expired</p>
                      <p className="text-3xl font-bold mt-1">{offlineStats.expired}</p>
                    </div>
                    <BookOpen size={40} className="opacity-20" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modern Tab Design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab("online-learning")}
              disabled={loadingOnline || loadingOffline}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-lg transition-all disabled:opacity-50 ${
                activeTab === "online-learning"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BookOpen size={18} />
              <span>Online Learning</span>
              {activeTab === "online-learning" && !loadingOnline && (
                <span className="ml-2 px-2 py-0.5 bg-blue-700 rounded-full text-xs">
                  {onlineStats.total}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab("offline-learning")}
              disabled={loadingOnline || loadingOffline}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-lg transition-all disabled:opacity-50 ${
                activeTab === "offline-learning"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <GraduationCap size={18} />
              <span>Offline Learning</span>
              {activeTab === "offline-learning" && !loadingOffline && (
                <span className="ml-2 px-2 py-0.5 bg-green-700 rounded-full text-xs">
                  {offlineStats.total}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "online-learning" && (
            <OnlineLearningView 
              onlineLearning={onlineLearning || []}
              pagination={onlineLearningPagination}
              loading={loadingOnline}
              error={errorOnline}
              onFetch={fetchOnlineLearning}
            />
          )}
          {activeTab === "offline-learning" && (
            <OfflineLearningView
              offlineLearning={offlineLearning || []}
              pagination={offlineLearningPagination}
              loading={loadingOffline}
              error={errorOffline}
              onSave={handleSaveOfflineLearning}
              onUpdate={handleUpdateOfflineLearning}
              onDelete={handleDeleteOfflineLearning}
              onFetch={fetchOfflineLearning}
              
              dept={dept || []}
              company={company || []}
              fetchEmployee={fetchEmployee}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Report.layout = Admin;