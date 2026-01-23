"use client";
import React from "react";
import CoursePlayer from "@/components/Course/CoursePlayer";
import CourseLayout from "@/layouts/CourseLayout";
import { useRouter } from "next/router";
import CourseProvider from "@/contexts/CourseContext";
import { encodeId, decodeId } from "@/lib/id64";

export default function StartCoursePage() {
  const router = useRouter();
  const { id } = router.query;
  const exitCourse = `/course-detail/`;
  const mainCourse = `/course/`;
  if (!id) return <div>Loading course...</div>;
  return (
    <CourseProvider courseId={decodeId(id)}>
      <CoursePlayer exitCourse={exitCourse} mainCourse={mainCourse} />
    </CourseProvider>
  );
}

StartCoursePage.layout = CourseLayout;
