import { useState, useContext, React, useEffect, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Auth from "../layouts/Auth";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaBuilding, FaChevronDown } from "react-icons/fa";
import { LanguageContext } from "../contexts/LanguageContext";

const Login = () => {
  const { stateAuth, Login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [siteId, setSiteId] = useState(2);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [isError, validatePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;
  
  const dropdownRef = useRef(null);

  const getIsKaryawan = (username) => {
    if (!username) return true;
    return /^[0-9]/.test(username.charAt(0));
  };

  // ✅ Site options dengan code dan full name
  const siteOptions = [
    { id: 1, code: "PSJ", name: "PT. Pulau Sambu (Jakarta)" },
    { id: 2, code: "RSUP", name: "PT. Riau Sakti United Plantations (Industry)" },
    { id: 3, code: "PSG", name: "PT. Pulau Sambu (Guntung)" },
    { id: 4, code: "PKB", name: "PT. Riau Sakti United Plantations (Perkebunan)" },
    { id: 5, code: "PSKE", name: "PT. Pulau Sambu (Kuala Enok)" }
  ];

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSiteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSite = siteOptions.find(site => site.id === siteId);
  const isKaryawan = getIsKaryawan(username);

  const handleSubmit = (e) => {
    e.preventDefault();
    Login({ nik : username, password, site_id: siteId, is_karyawan: isKaryawan });
  };

  const handleSiteSelect = (id) => {
    setSiteId(id);
    setShowSiteDropdown(false);
  };

  return (
    <Auth>
      <div className="container mx-auto px-4 h-full w-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full xl:w-4/12 lg:w-5/12 md:w-6/12 px-4">
            <div className="relative border-1 flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-slate-200 glass">
              {/* FORM START */}
              <form
                onSubmit={handleSubmit}
                className="flex-auto px-4 pt-0 mt-5"
              >
                {/* ✅ SITE SELECTION */}
                <div className="flex flex-col mb-2 py-2" ref={dropdownRef}>
                  <label className="text-gray-600 text-left text-base font-normal mb-1 flex items-center gap-2">
                    <FaBuilding className="w-4 h-4" />
                    Site*
                  </label>
                  
                  <div className="relative">
                    {/* Selected Display Button */}
                    <button
                      type="button"
                      onClick={() => setShowSiteDropdown(!showSiteDropdown)}
                      className="w-full px-3 py-2 text-left text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ease-linear transition-all duration-150 flex items-start justify-between hover:border-gray-400"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-gray-900">
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

                    {/* ✅ Dropdown List - Select2 Style */}
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
                            <div className={`font-semibold text-sm ${
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

                {/* USERNAME/NIK */}
                <div className="flex flex-col mb-2 py-2">
                  <label className="text-gray-600 text-left text-base font-normal mb-1">
                    {listLanguage.username || "Username/NIK"}*
                  </label>
                  <input
                    className="px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150"
                    name="username"
                    type="text"
                    placeholder={listLanguage.username_placeholder || "Masukkan NIK atau Username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  
                  {/* ✅ Visual Status Indicator */}
                  {username && (
                    <div className={`mt-2 text-xs flex items-center gap-2 transition-all ${
                      isKaryawan ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      <span className="text-base">
                        {isKaryawan ? '👔' : '👤'}
                      </span>
                      <span className="font-medium">
                        {isKaryawan ? 'Karyawan' : 'Non-Karyawan'}
                      </span>
                    </div>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col mb-2 py-2 px-0">
                  <label className="text-gray-600 text-left text-base font-normal mb-1">
                    {listLanguage.password || "Password"}*
                  </label>

                  <div className="relative flex justify-end items-center w-full">
                    <input
                      className="px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      placeholder={listLanguage.password_placeholder || "Masukkan password"}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      className={`absolute p-2 mr-2 outline-none border-none ${
                        isError ? "text-red-600" : "text-gray-600"
                      }`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-6 h-6" />
                      ) : (
                        <FaEye className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {isError ? (
                    <label className="text-red-600 text-xs font-thin mb-0">
                      {listLanguage.password_to_short || "Password terlalu pendek"}
                    </label>
                  ) : (
                    <label className="text-gray-600 text-base font-small mb-0"></label>
                  )}
                </div>

                {/* FORGOT PASSWORD */}
                <div className="flex flex-col mb-2 py-2">
                  <p className="text-blue-800 font-bold">
                    <Link href="/forgot_password">
                      {listLanguage.forgot_password || "Lupa Password"}
                    </Link>{" "}
                    ?
                  </p>
                </div>

                {/* DEBUG INFO (Development only) */}
                {process.env.NODE_ENV === 'development' && username && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="font-semibold text-blue-800 mb-1">Payload:</div>
                    <div className="text-blue-700 font-mono">
                      site_id: {siteId}, is_karyawan: {isKaryawan.toString()}, nik: {username}
                    </div>
                  </div>
                )}

                {/* BUTTON SUBMIT */}
                <button
                  type="submit"
                  disabled={!username || !password || stateAuth.isLoading}
                  className={`bg-blue-900 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded-full shadow mr-1 mb-1 w-full ease-linear transition-all disabled:bg-gray-500 ${
                    stateAuth.isLoading ? "animate-pulse " : ""
                  }`}
                >
                  {stateAuth.isLoading ? "Loading..." : (listLanguage.sign_in || "Sign In")}
                </button>
              </form>
              {/* FORM END */}
            </div>
          </div>
        </div>
      </div>
    </Auth>
  );
};

export default Login;