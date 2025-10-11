import React, { useEffect, useState } from "react";
import Header from "components/Headers/Header";

export default function CourseLayout({ children }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  return (
    <div className="flex h-screen bg-gray-50">
      {!isFullscreen && <Header />}

      {/* Main Content */}
      <div className="flex-1 pt-12 overflow-auto">
        {/* Content */}
        <main className="flex-1 mt-6 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
