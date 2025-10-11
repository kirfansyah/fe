import Head from "next/head";
import App from "next/app";

import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/index.css";
import "../styles/tailwind.css";
import "../styles/toggle.scss";
import { useEffect, useState } from "react";
import AuthContextProvider from "../contexts/AuthContext";
import LanguageContextProvider from "../contexts/LanguageContext";
import LoadingPages from "../components/LoadingPage";
import moment from "moment";
import idLocal from "moment/locale/id";
import { useRouter } from "next/router";
import { ParallaxProvider } from "react-scroll-parallax";
import ProfileContextProvider from "contexts/profile/ProfileContext";
import SeekingContextProvider from "contexts/SeekingContext";
import CourseProvider from "../contexts/CourseContext";

function Loading() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleStart = (url) => {
      url !== router.asPath && setLoading(true);
    };
    // const handleComplete = (url) => {
    //   url === router.asPath &&
    //     setTimeout(() => {
    //       setLoading(false);
    //     }, 1500);
    // };
    const handleComplete = () => {
      setTimeout(() => setLoading(false), 300);
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

function MyApp({ Component, pageProps }) {
  moment.locale("id", idLocal);
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
        {/* <Layout>  */}
        <ParallaxProvider>
          <Loading />
          <SeekingContextProvider>
            <AuthContextProvider>
              <LanguageContextProvider>
                <ProfileContextProvider>
                  <CourseProvider>
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  </CourseProvider>
                </ProfileContextProvider>
              </LanguageContextProvider>
            </AuthContextProvider>
          </SeekingContextProvider>
        </ParallaxProvider>

        {/* </Layout> */}
      </React.Fragment>
    </>
  );
}

export default MyApp;
