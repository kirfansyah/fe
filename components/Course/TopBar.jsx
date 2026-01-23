"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Maximize, LogOut, Home, Minimize } from "lucide-react";
import { CourseContext } from "@/contexts/CourseContext";
import { useEmployees } from "@/hooks/useEmployees";
import { decodeId, encodeId } from "@/lib/id64";

export default function TopBar({ exitCourse, mainCourse }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state } = useContext(CourseContext);
  const { closeSession } = useEmployees();
  const { courseId, courseData } = state;
  const [idUserEnrollment, setIdUserEnrollment] = useState(null);

  const router = useRouter();
  function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);

      setMatches(media.matches);
      media.addEventListener("change", listener);

      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  }

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  //   console.log("exitCourse:", exitCourse + courseId);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.log("Fullscreen error:", err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.log("Exit fullscreen error:", err));
    }
  };

  useEffect(() => {
    if (!courseId) return;
    if (!courseData) return;
    if (!courseData.id_user_enrollment) return;
    setIdUserEnrollment(courseData.id_user_enrollment);
  }, [courseData, courseId]);

  //   console.log("idUserEnrollment in TopBar:", idUserEnrollment);

  //   const handleExitCourse = async () => {
  //     const navigate = router.push(`${exitCourse}${courseId}`);

  //     if (document.fullscreenElement) {
  //       Promise.race([
  //         document.exitFullscreen(),
  //         new Promise((resolve) => setTimeout(resolve, 200)),
  //       ])
  //         .then(() => setIsFullscreen(false))
  //         .catch((err) => console.warn("Gagal keluar fullscreen:", err));
  //     }

  //     if (idUserEnrollment) {
  //       try {
  //         const result = await closeSession(idUserEnrollment);
  //         console.log("Session closed:", result);
  //       } catch (error) {
  //         console.error("Error closing session:", error);
  //       }
  //     }

  //     await navigate;
  //   };

  const handleExitCourse = async () => {
    // 1️⃣ Keluar dari fullscreen dulu
    if (document.fullscreenElement) {
      try {
        await Promise.race([
          document.exitFullscreen(),
          new Promise((resolve) => setTimeout(resolve, 200)),
        ]);
        setIsFullscreen(false);
      } catch (err) {
        console.warn("Gagal keluar fullscreen:", err);
      }
    }

    // 2️⃣ Kirim data ke API
    if (idUserEnrollment) {
      try {
        // const payload = { id_user_enrollment: idUserEnrollment };
        const result = await closeSession(idUserEnrollment);
        console.log("Session closed:", result);
      } catch (error) {
        console.error("Error closing session:", error);
      }
    }

    // 3️⃣ Baru navigasi
    router.push(`${exitCourse}${encodeId(courseId)}`);
  };

  //   const handleMainCourse = async () => {
  //     if (document.fullscreenElement) {
  //       try {
  //         await Promise.race([
  //           document.exitFullscreen(),
  //           new Promise((resolve) => setTimeout(resolve, 200)),
  //         ]);
  //         setIsFullscreen(false);
  //       } catch (err) {
  //         console.warn("Gagal keluar dari fullscreen:", err);
  //       }
  //     }

  //     if (idUserEnrollment) {
  //       try {
  //         // const payload = { id_user_enrollment: idUserEnrollment };
  //         const result = await closeSession(idUserEnrollment);
  //         console.log("Session closed:", result);
  //       } catch (error) {
  //         console.error("Error closing session:", error);
  //       }
  //     }
  //     router.push(`${mainCourse}`);
  //   };
  const handleMainCourse = async () => {
    if (document.fullscreenElement) {
      try {
        await Promise.race([
          document.exitFullscreen(),
          new Promise((resolve) => setTimeout(resolve, 200)),
        ]);
        setIsFullscreen(false);
      } catch (err) {
        console.warn("Gagal keluar dari fullscreen:", err);
      }
    }

    try {
      if (idUserEnrollment) {
        const result = await closeSession(idUserEnrollment);
        console.log("Session closed:", result);
      }
    } catch (error) {
      console.error("Error closing session:", error);
    } finally {
      router.push(mainCourse);
    }
  };

  return (
    <Card className="rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-blue-500 text-white">
      {/* <CardContent className="flex justify-between items-center p-3"> */}
      <CardContent className="flex justify-end items-center p-3">
        <div className="flex gap-3 ml-auto">
          <Button
            className={`
                bg-blue-500 hover:bg-blue-600
            `}
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 mr-1" />
                {isDesktop && <span>Exit Fullscreen</span>}
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 mr-1" />
                {/* <span className="hidden max-md:inline">Full Screen</span> */}
                {isDesktop && <span>Full Screen</span>}
              </>
            )}
          </Button>

          <Button
            // variant="outline"
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
            onClick={handleExitCourse}
          >
            <LogOut className="w-4 h-4 mr-1" />
            {/* <span className="hidden max-md:inline">Exit Course</span> */}
            {isDesktop && <span>Exit Course</span>}
          </Button>

          <Button
            // variant="outline"
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
            onClick={handleMainCourse}
          >
            <Home className="w-4 h-4 mr-1" />{" "}
            {/* <span className="hidden max-md:inline">Main Course</span> */}
            {isDesktop && <span>Main Course</span>}
          </Button>
        </div>

        {/* <div className="flex gap-6 text-gray-700 font-medium">
          <span>Courses</span>
          <span>Reviews</span>
        </div> */}
      </CardContent>
    </Card>
  );
}
