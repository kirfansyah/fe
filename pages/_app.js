import Head from "next/head";
import App from "next/app";

import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/index.css";
import "../styles/tailwind.css";
import "../styles/toggle.scss";
import { useEffect, useState, useContext } from "react";
import AuthContextProvider, { AuthContext } from "../contexts/AuthContext"; // ✅ Import AuthContext
import LanguageContextProvider from "../contexts/LanguageContext";
import LoadingPages from "../components/LoadingPage";
import moment from "moment";
import idLocal from "moment/locale/id";
import { useRouter } from "next/router";
import { ParallaxProvider } from "react-scroll-parallax";
import ProfileContextProvider from "contexts/profile/ProfileContext";
import SeekingContextProvider from "contexts/SeekingContext";
import CourseProvider from "../contexts/CourseContext";

import { Toaster } from "@/components/ui/sonner";
import ChangePasswordModal from "../components/ChangePasswordModal"; // ✅ Import modal

function Loading() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const handleStart = (url) => {
      url !== router.asPath && setLoading(true);
    }; 
    const handleComplete = () => {
      setTimeout(() => setLoading(false), 1000); 
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });
  
  return loading && <LoadingPages />;
}

// ✅ NEW: AppContent dengan Route Guard
function AppContent({ Component, pageProps, Layout, router }) {
  const { mustChangePassword, getSession, stateAuth } = useContext(AuthContext);
  const [mounted, setMounted] = useState(false);

  // ✅ Public routes yang tidak perlu auth
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // ✅ Load session on mount
  useEffect(() => {
    setMounted(true);
    if (!isPublicRoute) {
      getSession();
    }
  }, [router.pathname]);

  // ✅ Prevent flash of content on initial render
  if (!mounted) {
    return <LoadingPages />;
  }

  // ✅ FORCE CHANGE PASSWORD dengan Overlay - Better UX!
  if (!isPublicRoute && mustChangePassword && stateAuth.isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        {/* ✅ Background overlay - disable interactions */}
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40" />
        
        {/* ✅ Page content (blurred & disabled) */}
        <div className="pointer-events-none blur-sm opacity-40">
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
        
        {/* ✅ Force Change Password Modal - Always on top */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ChangePasswordModal 
            isOpen={true} 
            onClose={() => {}} // ✅ Empty - tidak bisa close
            isForced={true}    // ✅ Flag untuk styling
            canClose={false}   // ✅ Disable close button
          />
        </div>
      </div>
    );
  }

  // ✅ Normal render
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

function MyApp({ Component, pageProps }) {
  moment.locale("id", idLocal);
  const router = useRouter();
  
  useEffect(() => {
    AOS.init({
      easing: "ease-out-cubic",
      once: false,
      offset: 50,
      delay: 100,
      duration: 1000,
    });
  }, []);
  
  const Layout = Component.layout || (({ children }) => <>{children}</>);
  
  return (
    <>
      <React.Fragment>
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
          />
          <title>Learning Management System</title>
        </Head>
        
        <ParallaxProvider>
          <Loading />
          <SeekingContextProvider>
            <AuthContextProvider>
              <LanguageContextProvider>
                <ProfileContextProvider>
                  <CourseProvider>
                    {/* ✅ Wrap dengan AppContent untuk route guard */}
                    <AppContent 
                      Component={Component} 
                      pageProps={pageProps} 
                      Layout={Layout}
                      router={router}
                    />
                  </CourseProvider>
                </ProfileContextProvider>
              </LanguageContextProvider>
            </AuthContextProvider>
          </SeekingContextProvider>
          <Toaster position="top-right" richColors />
        </ParallaxProvider>
      </React.Fragment>
    </>
  );
}

export default MyApp;