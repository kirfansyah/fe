
import { Menu, Transition } from "@headlessui/react";
import {  React, Fragment, useEffect,useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "contexts/AuthContext";
import ToggleSwitch from "components/ToggleSwitch/ToggleSwitch";
import { LanguageContext } from "contexts/LanguageContext";
import { ProfileContext } from "contexts/profile/ProfileContext";
import { IoIosNotifications } from "react-icons/io";
import ChangePasswordModal from "components/ChangePasswordModal";

const Header = () => {
  const { stateLanguage, changeLanguage } = useContext(LanguageContext); 
  const { getSession, stateAuth, Logout } = useContext(AuthContext);
  const { isAuthenticated } = stateAuth;
  const router = useRouter();
  const { pathname } = router;
  const { listLanguage } = stateLanguage;

  const onLanguageChange = (checked) => {
    changeLanguage(checked ? "id" : "en");
  };
 
  const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
    
  const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];

  useEffect(() => {
    getSession();
    getKaryawan();
  }, []);

  const [showChangePassword, setShowChangePassword] = useState(false);
 
  return ( 
    <>
    <header className='bg-white shadow-sm p-4 flex justify-between items-center fixed w-full z-50'>
        <div className='flex  items-center space-x-3'>
          <a href='/'>
            <img src='/img/logo.png' width={200} />
          </a>   
        </div>
        <div className='flex items-center space-x-3'>
          <ul className='flex justify-between items-center space-x-3 select-none'>
            
            
              <li className='flex items-center '>
                <label className='w-9 h-9 pl-2 text-blue-900 font-normal mr-2 lg:block'>
                  <IoIosNotifications className="w-9 h-9 " />
                </label>
              </li>
            {isAuthenticated ? (
              //   <Link href='/profile'>
             
              <li className='flex items-center px-1 border-l'>
                <label className='pl-2 text-blue-900 font-normal mr-2 lg:block'>
                  {dataKaryawans?.nama}
                </label>
                <Menu as='div'>
                  <div> 
                    <Menu.Button className='w-10 h-10 rounded-full cursor-pointer flex items-center relative border-none overflow-hidden'>
                      {/* <HiOutlineUser className='w-4 h-4 text-white' />  */}
                      <img
                        src='/img/user.png'
                        style={{ objectFit: "cover" }}
                        className='absolute top-0 left-0'
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter='transition ease-out duration-100'
                      enterFrom='transform opacity-0 scale-95'
                      enterTo='transform opacity-100 scale-100'
                      leave='transition ease-in duration-75'
                      leaveFrom='transform opacity-100 scale-100'
                      leaveTo='transform opacity-0 scale-95'>
                      <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                        <div className='px-1 py-1'>
                          <label className='p-2 text-blue-900 lg:hidden block border-b-2 border-gray-200'>
                            {dataKaryawans?.nama}
                          </label>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  router.push("/profile", null, {
                                    shallow: true,
                                  })
                                }
                                className={`${
                                  active
                                    ? "bg-blue-900 text-white"
                                    : "text-blue-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                Profile
                              </button>
                            )}
                          </Menu.Item>
                           
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => setShowChangePassword(true)}
                                className={`${
                                  active
                                    ? "bg-blue-900 text-white"
                                    : "text-blue-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                {listLanguage.password_setting}
                              </button>
                            )}
                          </Menu.Item>
                          
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={Logout}
                                className={`${
                                  active
                                    ? "bg-red-600 text-white"
                                    : "text-blue-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                {listLanguage.logout}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                    
                  </div>
                </Menu>
              </li>
            ) : (
              //   </Link>
              <>
                <li className='block lg:hidden'>
                  <Link href='/login'>
                    <svg
                      className='w-6 h-6 text-blue-900 hover:text-blue-900/95 hover:scale-110'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </Link>
                </li>
                <li
                  className={`hidden lg:block font-roboto font-semibold text-blue-900 subpixel-antialiased hover:text-blue-900/75 hover:underline cursor-pointer ${
                    pathname == "/login" ? "underline" : ""
                  }`}>
                  <Link href='/login'>{listLanguage.login}</Link>
                </li>
              </>
            )}
            
            <li className='block px-3 font-roboto font-semibold text-blue-900 transition duration-700 ease-out hover:text-blue-900/95 hover:ease-in cursor-pointer group'>
            <span className='flex items-center'>
              <ToggleSwitch
                id='bahasa'
                checked={stateLanguage.lang == "id" ? true : false}
                onChange={onLanguageChange}
              />
            </span>
            </li>
           
          </ul>
        </div>
    </header>
     <ChangePasswordModal 
            isOpen={showChangePassword}
            onClose={() => setShowChangePassword(false)}
        />
  </>
  );
};

export default Header;
