
import { useState, useContext, React } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Auth from "../layouts/Auth";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { LanguageContext } from "../contexts/LanguageContext";

const Login = () => {
  const { stateAuth, Login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, validatePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;

  function handleChange(event) {
    // const valPassword = event.target.value;
    // setPassword(valPassword);

    // if (valPassword.length < 8) {
    //   isError = true;
    // } else {
    //   isError = false;
    // }
    // validatePassword(isError);
  }

  return (
    <Auth>
      <div className="container mx-auto px-4 h-full w-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full xl:w-4/12 lg:w-5/12 md:w-6/12 px-4">
            <div className="relative border-1 flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-slate-200 glass">

              <div className="flex-auto px-4 pt-0  mt-5">
                <div className="text-blueGray-400 mb-3 font-bold">
                </div>
                <div className='flex flex-col mb-2 py-2'>
                  <label className='text-gray-600 text-left text-base font-normal mb-0'>
                    {listLanguage.username}*
                  </label>
                  <input
                    className='px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150'
                    name='username'
                    type='username'
                    placeholder={listLanguage.username_placeholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className='flex flex-col mb-2 py-2 px-0'>
                  <label className='text-gray-600 text-left text-base font-normal mb-0'>
                    {listLanguage.password}*
                  </label>
                  <div className='relative flex justify-end items-center w-full'>
                    <input
                      className='px-3 py-2 placeholder-slate-400 text-black border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ease-linear transition-all duration-150'
                      type={showPassword ? "text" : "password"}
                      name='password'
                      value={password}
                      placeholder={listLanguage.password_placeholder}
                       onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className={isError ? 'absolute text-red-600 p-2 mr-2 outline-none border-none focus:border-none' : 'absolute text-gray-600 p-2 mr-2 outline-none border-none  focus:border-none'}
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <FaEyeSlash className='w-6 h-6' />
                      ) : (
                        <FaEye className='w-6 h-6' />
                      )}
                    </button>
                  </div>

                  {isError ? (<label className='text-red-600 text-xs font-thin mb-0'>{listLanguage.password_to_short}</label>) : (<label className='text-gray-600 text-base font-small mb-0'></label>)}
                </div>
                <div className='flex flex-col mb-2 py-2'>
                  <p className='text-blue-800 font-bold'><Link href='/forgot_password'>{listLanguage.forgot_password}</Link> ?</p>
                </div>

                <button
                  disabled={
                    !username || !password || stateAuth.isLoading ? true : false
                  }
                  className={`bg-blue-900 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded-full shadow mr-1 mb-1 w-full ease-linear transition-all disabled:bg-gray-500 ${stateAuth.isLoading ? "animate-pulse " : ""
                    }`}
                  onClick={() => Login({ username, password })}>
                  {stateAuth.isLoading
                    ? "Loading..."
                    : `${listLanguage.sign_in}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Auth>
  );
}
export default Login;
