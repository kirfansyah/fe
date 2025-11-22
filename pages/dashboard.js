import {useContext,useEffect} from "react";
import WebLayout from "../layouts/WebLayout";
import { ProfileContext } from "../contexts/profile/ProfileContext";
import Link from "next/link";
import { useCourses } from '../hooks/useCourses';
const Dashboard = () => {
  const { getKaryawan, dataKaryawan } = useContext(ProfileContext);  
  const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
  
  useEffect(() => {
    getKaryawan();
  }, []);

  const {profileInfo} = useCourses();   
  const profileData = profileInfo || dataKaryawans || {};

  const menuItems = [
    {
      label: "Trainer Portal",
      icon: <img src='/img/website.png' width={100} />,
      link: "/admin/dashboard",
    },
    {
      label: "Profile",
      icon: <img src='/img/profile.png' width={100} />,
      link: "/profile",
    },
    {
      label: "Course",
      icon: <img src='/img/learning.png' width={100} />,
      link: "/course",
    },
    {
      label: "Calendar",
      icon: <img src='/img/calendar.png' width={100} />,
      link: "/calendar",
    },
    {
      label: "Library",
      icon: <img src='/img/bookshelf.png' width={100} />,
      link: "/library",
    },
  ];

  return (
    <WebLayout>
      <div className="bg-gradient-to-r from-blue-900 to-blue-100 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">{dataKaryawans.nama}</h1>
          <p className="text-blue-100 text-lg">
            {profileData.position_name || ''
            } - {profileData.company_name || ''}
          </p>
          <div className="mt-4 text-blue-100">
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="mx-3">|</span>
            <span>09.32 AM</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center py-12 items-center gap-20">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.link}
            className="flex flex-col items-center hover:scale-105 transition-transform duration-300"
          >
            {item.icon}
            <span className="mt-2 font-semibold text-blue-900">{item.label}</span>
          </Link>
        ))}
      </div>
       



    </WebLayout>
  );
}

export default Dashboard;