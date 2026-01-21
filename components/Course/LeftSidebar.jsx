import { useContext, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { CourseContext } from "@/contexts/CourseContext";

export default function LeftSidebar() {
  const { state, setStep } = useContext(CourseContext);
  const { flow, completed, courseData, currentStep } = state;
  const [progressValue, setProgressValue] = useState(
    courseData?.progress_percentage ?? 0
  );
  //   console.log("courseData: ", courseData?.progress_percentage);

  const totalItems = Object.keys(flow).length;
  const orderedKeys = [
    "courseGuide",
    "courseOutline",
    "preTest",
    "courseContent",
    "postTest",
  ];
  useEffect(() => {
    setProgressValue(courseData?.progress_percentage ?? 0);
  }, [completed, courseData]);

  return (
    <Card className="md:w-1/3">
      <CardContent className="space-y-4 p-4">
        {/* Progress bar */}
        <div>
          <h2 className="font-bold mb-2  [&>div]:bg-green-600">
            Course Progress
          </h2>
          <Progress className=" [&>div]:bg-blue-600" value={progressValue} />
        </div>

        {/* Daftar step */}
        <div className="space-y-2">
          {orderedKeys.map((sectionKey) => {
            const items = flow?.[sectionKey];
            const isCourseContent = sectionKey === "courseContent";

            return (
              <div key={sectionKey}>
                {Array.isArray(items) &&
                  items.map((item) => (
                    // {isCourseContent ? (<div className="ml-9 mr-2 mb-2 bt-2">v</div>) : null}
                    <div
                      key={item.id_course_content}
                      className={`${
                        isCourseContent ? "ml-2 mr-2 mb-2 bt-2" : " m-2"
                      } flex items-center justify-between p-2 border rounded-md transition-all 
                      ${
                        item.id_course_content === currentStep
                          ? "bg-blue-100 border-blue-600 font-bold"
                          : ""
                      }
                      ${
                        item.is_completed
                          ? "hover:bg-blue-50 cursor-pointer"
                          : "bg-gray-100 cursor-not-allowed opacity-70"
                      }`}
                      onClick={() => {
                        if (item.is_completed) setStep(item.id_course_content);
                      }}
                    >
                      <Checkbox
                        checked={item.is_completed}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />

                      <span className="flex-1 ml-2 text-lg">
                        {item.content_title == "Pre Test (Copy)"
                          ? "Post Test"
                          : item.content_title}
                      </span>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
