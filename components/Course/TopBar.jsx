"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Maximize, LogOut, Home, Minimize } from "lucide-react";
import { CourseContext } from "@/contexts/CourseContext";

export default function TopBar() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state } = useContext(CourseContext);
  const { courseId } = state;

  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

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

  const handleExitCourse = async () => {
    const navigate = router.push(`/course/employee/detail/${courseId}`);

    if (document.fullscreenElement) {
      Promise.race([
        document.exitFullscreen(),
        new Promise((resolve) => setTimeout(resolve, 200)),
      ])
        .then(() => setIsFullscreen(false))
        .catch((err) => console.warn("Gagal keluar fullscreen:", err));
    }

    await navigate;
  };

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
    router.push("/course/employee/course");
  };

  return (
    <Card>
      <CardContent className="flex justify-between items-center p-3">
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 mr-1" /> Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 mr-1" /> Full Screen
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExitCourse}>
            <LogOut className="w-4 h-4 mr-1" /> Exit Course
          </Button>

          <Button variant="outline" size="sm" onClick={handleMainCourse}>
            <Home className="w-4 h-4 mr-1" /> Main Course
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
