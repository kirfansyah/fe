"use client";
import React from "react";
import CoursePlayer from "@/components/Course/CoursePlayer";
import CourseLayout from "@/layouts/CourseLayout";
import { useRouter } from "next/router"; // ✅ ini yang benar
import CourseProvider from "@/contexts/CourseContext";

export default function StartCoursePage() {
  const router = useRouter();
  const { id } = router.query;
  if (!id) return <div>Loading course...</div>;
  return (
    <CourseProvider courseId={id}>
      <CoursePlayer />
    </CourseProvider>
  );
}

StartCoursePage.layout = CourseLayout;
