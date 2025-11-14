"use client";

import React, { useContext, useEffect } from "react";
import TopBar from "@/components/Course/TopBar";
import LeftSidebar from "@/components/Course/LeftSidebar";
import ContentArea from "@/components/Course/ContentArea";
import { CourseContext } from "@/contexts/CourseContext";

export default function CoursePlayer() {
  const { state, setStep, goNext } = useContext(CourseContext);
  const { flow, currentStep, completed, setCourseId, courseId } = state;

  //   console.log("flow : ", flow);

  useEffect(() => {
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.warn("Fullscreen error:", err));
    }
  }, []);

  return (
    <div className="p-4 space-y-4">
      <TopBar />
      <div className="flex flex-col md:flex-row gap-4">
        <LeftSidebar
          flow={flow}
          current={currentStep}
          completed={completed}
          onStepSelect={setStep}
        />
        <ContentArea
          stepId={currentStep}
          flow={flow}
          onNext={(nextId) => goNext(currentStep, nextId)}
        />
      </div>
    </div>
  );
}
