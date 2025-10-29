"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Maximize, LogOut, Home, Minimize } from "lucide-react";

export default function TopBar() {
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
    router.push("/course/employee/detail/1");
  };

  const handleMainCourse = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
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
