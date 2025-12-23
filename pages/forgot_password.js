// pages/forgot_password.js
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Auth from "../layouts/Auth";
import Link from "next/link";
import { FaArrowLeft, FaTelegram, FaEnvelope, FaBuilding, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import API from "@/contexts/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [nik, setNik] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [siteId, setSiteId] = useState(2);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  
  const router = useRouter();
  const dropdownRef = useRef(null);

  const siteOptions = [
    { id: 1, code: "PSJ", name: "PT. Pulau Sambu (Jakarta)", otpMethod: "email" },
    { id: 2, code: "RSUP", name: "PT. Riau Sakti United Plantations (Industry)", otpMethod: "telegram" },
    { id: 3, code: "PSG", name: "PT. Pulau Sambu (Guntung)", otpMethod: "telegram" },
    { id: 4, code: "PKB", name: "PT. Riau Sakti United Plantations (Perkebunan)", otpMethod: "telegram" },
    { id: 5, code: "PSKE", name: "PT. Pulau Sambu (Kuala Enok)", otpMethod: "telegram" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSiteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSiteSelect = (id) => {
    setSiteId(id);
    setShowSiteDropdown(false);
  };

  const selectedSite = siteOptions.find(site => site.id === siteId);
  
  const getIsKaryawan = (nik) => {
    if (!nik) return true;
    return /^[0-9]/.test(nik.charAt(0));
  };
  
  const isKaryawan = getIsKaryawan(nik);
  const otpMethod = selectedSite?.otpMethod || 'telegram';
  const isEmailOTP = otpMethod === 'email';

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post("/auth/forgot-password", {
        nik: nik,
        site_id: siteId,
        is_karyawan: isKaryawan
      });

      const { success, message, data } = response.data;

      if (success) {
        setStep(2);
        startCountdown(300);

        await Swal.fire({
          icon: "success",
          title: "OTP Terkirim!",
          html: `
            <p class="text-gray-700 mb-2">${message || `Kode OTP telah dikirim ke ${isEmailOTP ? 'Email' : 'Telegram'} Anda`}</p>
            <div class="flex items-center justify-center gap-2 ${isEmailOTP ? 'text-red-600' : 'text-blue-600'} font-semibold">
              ${isEmailOTP ? `
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <span>Email</span>
              ` : `
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                <span>Telegram</span>
              `}
            </div>
          `,
          confirmButtonColor: "#1e3a8a",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        throw new Error(message || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error("Request OTP Error:", err);

      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || `NIK tidak ditemukan atau ${isEmailOTP ? 'Email' : 'Telegram'} belum terdaftar`,
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post("/auth/verify-reset-token", {
        token: otp
      });
      
      const { success, message } = response.data;

      if (success) {
        setStep(3);

        await Swal.fire({
          icon: "success",
          title: "OTP Valid!",
          text: message || "Silakan masukkan password baru Anda",
          confirmButtonColor: "#1e3a8a",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        throw new Error(message || "OTP tidak valid");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);

      await Swal.fire({
        icon: "error",
        title: "OTP Tidak Valid!",
        text: err.response?.data?.message || "Kode OTP salah atau sudah kadaluarsa",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      await Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Password minimal 8 karakter",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Password tidak cocok",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/auth/reset-password", {
        otp: otp,
        new_password: newPassword,
        confirmed_new_password: confirmPassword,
      });

      const { success, message } = response.data;

      if (success) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: message || "Password berhasil direset",
          confirmButtonColor: "#1e3a8a",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        throw new Error(message || "Gagal reset password");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);

      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal mereset password. Silakan coba lagi.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      const response = await API.post("/auth/forgot-password", {
        nik: nik,
        site_id: siteId,
        is_karyawan: isKaryawan
      });

      const { success, message } = response.data;

      if (success) {
        setOtp("");
        startCountdown(300);

        await Swal.fire({
          icon: "success",
          title: "OTP Terkirim Ulang!",
          text: message || `Kode OTP baru telah dikirim ke ${isEmailOTP ? 'Email' : 'Telegram'} Anda`,
          confirmButtonColor: "#1e3a8a",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal mengirim ulang OTP",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Auth>
      {/* ✅ Fixed wrapper - sama seperti Login */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="pointer-events-auto w-full max-h-screen overflow-y-auto px-4 py-6">
          <div className="container mx-auto">
            <div className="flex justify-center">
              <div className="w-full xl:w-4/12 lg:w-5/12 md:w-6/12">
                <div className="relative border-1 flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-slate-200 glass">
                  {/* HEADER */}
                  <div className="px-6 pt-6 pb-4">
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium text-sm mb-4 transition-colors"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      Kembali ke Login
                    </Link>

                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Lupa Password?
                    </h3>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            s <= step ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 text-sm">
                      {step === 1 && "Pilih unit usaha dan masukkan NIK"}
                      {step === 2 && `Masukkan kode OTP dari ${isEmailOTP ? 'Email' : 'Telegram'}`}
                      {step === 3 && "Buat password baru Anda"}
                    </p>
                  </div>

                  {/* STEP 1: SITE + NIK INPUT */}
                  {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="flex-auto px-6 pb-6">
                      {/* Site Selection */}
                      <div className="flex flex-col mb-3 py-2" ref={dropdownRef}>
                        <label className="text-gray-600 text-left text-base font-normal mb-2 flex items-center gap-2">
                          <FaBuilding className="w-4 h-4" />
                          Unit Usaha*
                        </label>
                        
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowSiteDropdown(!showSiteDropdown)}
                            className="w-full px-3 py-2 text-left text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ease-linear transition-all duration-150 flex items-start justify-between hover:border-gray-400"
                          >
                            <div className="flex-1 pr-2">
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {selectedSite.code}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                {selectedSite.name}
                              </div>
                            </div>
                            <FaChevronDown className={`w-4 h-4 mt-1 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                              showSiteDropdown ? 'rotate-180' : ''
                            }`} />
                          </button>

                          {showSiteDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                              {siteOptions.map((site) => (
                                <button
                                  key={site.id}
                                  type="button"
                                  onClick={() => handleSiteSelect(site.id)}
                                  className={`w-full px-4 py-3 text-left transition-all duration-150 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${
                                    siteId === site.id 
                                      ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                                      : 'border-l-4 border-l-transparent'
                                  }`}
                                >
                                  <div className={`font-semibold text-sm flex items-center gap-2 ${
                                    siteId === site.id ? 'text-blue-700' : 'text-gray-900'
                                  }`}>
                                    {site.code}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    {site.name}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NIK Input */}
                      <div className="flex flex-col mb-6">
                        <label className="text-gray-600 text-left text-base font-normal mb-2">
                          NIK / ID Karyawan*
                        </label>
                        <input
                          className="px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150"
                          type="text"
                          placeholder="Masukkan NIK Anda"
                          value={nik}
                          onChange={(e) => setNik(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {/* Dynamic button */}
                      <button
                        type="submit"
                        disabled={!nik || isLoading}
                        className={`${
                          isEmailOTP ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-900 hover:bg-blue-800'
                        } text-white text-sm font-bold uppercase px-6 py-3 rounded-full shadow w-full ease-linear transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                          isLoading ? "animate-pulse" : ""
                        }`}
                      >
                        {isEmailOTP ? <FaEnvelope className="w-5 h-5" /> : <FaTelegram className="w-5 h-5" />}
                        {isLoading ? "Mengirim..." : `Kirim OTP ke ${isEmailOTP ? 'Email' : 'Telegram'}`}
                      </button>

                      {/* Dynamic info box */}
                      <div className={`mt-4 p-3 ${
                        isEmailOTP ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                      } border rounded text-xs ${
                        isEmailOTP ? 'text-red-800' : 'text-blue-800'
                      }`}>
                        <p className="font-semibold mb-1">
                          {isEmailOTP ? '📧 Info Email:' : '📱 Info Telegram:'}
                        </p>
                        <ul className={`list-disc list-inside space-y-1 ${
                          isEmailOTP ? 'text-red-700' : 'text-blue-700'
                        }`}>
                          <li>Pastikan NIK dan Unit Usaha sudah benar</li>
                          <li>Kode OTP akan dikirim ke {isEmailOTP ? 'Email' : 'Telegram'} terdaftar</li>
                          <li>Kode berlaku selama 5 menit</li>
                          {isEmailOTP && <li>Cek folder spam jika tidak menerima email</li>}
                        </ul>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: OTP INPUT */}
                  {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="flex-auto px-6 pb-6">
                      <div className="flex flex-col mb-4">
                        <label className="text-gray-600 text-left text-base font-normal mb-2 flex items-center justify-between">
                          <span>Kode OTP*</span>
                          {countdown > 0 && (
                            <span className="text-sm text-blue-600 font-mono">
                              {formatTime(countdown)}
                            </span>
                          )}
                        </label>
                        <input
                          className="px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150 text-center text-2xl font-mono tracking-widest"
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          maxLength={6}
                          required
                          disabled={isLoading}
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Masukkan 6 digit kode dari {isEmailOTP ? 'Email' : 'Telegram'}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={otp.length !== 6 || isLoading}
                        className={`bg-blue-900 text-white text-sm font-bold uppercase px-6 py-3 rounded-full shadow w-full ease-linear transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 ${
                          isLoading ? "animate-pulse" : ""
                        }`}
                      >
                        {isLoading ? "Memverifikasi..." : "Verifikasi OTP"}
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isLoading}
                        className="text-blue-800 hover:text-blue-900 text-sm font-medium w-full disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {countdown > 0
                          ? `Kirim ulang dalam ${formatTime(countdown)}`
                          : "Kirim Ulang OTP"}
                      </button>

                      {/* Dynamic warning box */}
                      <div className={`mt-4 p-3 ${
                        isEmailOTP ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      } border rounded text-xs ${
                        isEmailOTP ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        <p className="font-semibold mb-1">⚠️ Tidak menerima OTP?</p>
                        <ul className={`list-disc list-inside space-y-1 ${
                          isEmailOTP ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {isEmailOTP ? (
                            <>
                              <li>Cek folder spam/junk email Anda</li>
                              <li>Pastikan email terdaftar sudah benar</li>
                              <li>Tunggu beberapa saat sebelum kirim ulang</li>
                            </>
                          ) : (
                            <>
                              <li>Pastikan Telegram Anda terhubung</li>
                              <li>Cek pesan dari bot official</li>
                              <li>Tunggu beberapa saat sebelum kirim ulang</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: NEW PASSWORD */}
                  {step === 3 && (
                    <form onSubmit={handleResetPassword} className="flex-auto px-6 pb-6">
                      {/* New Password */}
                      <div className="flex flex-col mb-4">
                        <label className="text-gray-600 text-left text-base font-normal mb-2">
                          Password Baru*
                        </label>
                        <div className="relative flex items-center">
                          <input
                            className="px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150 pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="absolute right-3 text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="w-5 h-5" />
                            ) : (
                              <FaEye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="flex flex-col mb-6">
                        <label className="text-gray-600 text-left text-base font-normal mb-2">
                          Konfirmasi Password*
                        </label>
                        <div className="relative flex items-center">
                          <input
                            className="px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150 pr-10"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Ulangi password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 text-gray-600"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash className="w-5 h-5" />
                            ) : (
                              <FaEye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {newPassword && confirmPassword && (
                          <p
                            className={`text-xs mt-2 ${
                              newPassword === confirmPassword
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {newPassword === confirmPassword
                              ? "✓ Password cocok"
                              : "✗ Password tidak cocok"}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword ||
                          newPassword.length < 8 ||
                          isLoading
                        }
                        className={`bg-blue-900 text-white text-sm font-bold uppercase px-6 py-3 rounded-full shadow w-full ease-linear transition-all disabled:bg-gray-400 disabled:cursor-not-allowed ${
                          isLoading ? "animate-pulse" : ""
                        }`}
                      >
                        {isLoading ? "Memproses..." : "Reset Password"}
                      </button>
                    </form>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Auth>
  );
};

export default ForgotPassword;