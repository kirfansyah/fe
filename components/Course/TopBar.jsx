"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Maximize, LogOut, Home, Minimize } from "lucide-react";

export default function TopBar() {
  const [isFullscreen, setIsFullscreen] = useState(false);

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

          <Link href="/course/employee/detail/1">
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-1" /> Exit Course
            </Button>
          </Link>

          <Link href="/course/employee/course">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-1" /> Main Course
            </Button>
          </Link>
        </div>

        <div className="flex gap-6 text-gray-700 font-medium">
          <span>Courses</span>
          <span>Reviews</span>
        </div>
      </CardContent>
    </Card>
  );
}
