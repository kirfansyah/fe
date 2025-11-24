import { useContext, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { CourseContext } from "@/contexts/CourseContext";

export default function LeftSidebar() {
  const { state, setStep } = useContext(CourseContext);
  const { flow, completed, courseData } = state;
  const [progressValue, setProgressValue] = useState(
    courseData?.progress_percentage ?? 0
  );
  console.log("courseData: ", courseData?.progress_percentage);

  const totalItems = Object.keys(flow).length;
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
          {Object.keys(flow || {}).map((sectionKey) => (
            <div key={sectionKey}>
              {/* <h3 className="font-semibold capitalize mb-1">{sectionKey}</h3> */}
              {Array.isArray(flow[sectionKey]) &&
                flow[sectionKey].map((item) => (
                  <div
                    key={item.id_course_content}
                    className={`flex items-center justify-between p-2 border rounded-md m-2 transition-all ${
                      item.is_completed
                        ? "hover:bg-blue-50 cursor-pointer"
                        : "bg-gray-100 cursor-not-allowed opacity-70"
                    }`}
                    onClick={() => {
                      if (item.is_completed) setStep(item.id_course_content);
                    }}
                  >
                    {/* <div
                    key={item.id_course_content}
                    className={`flex items-center justify-between p-2 border rounded-md cursor-pointer m-2`}
                    onClick={() => setStep(item.id_course_content)}
                  > */}
                    <Checkbox
                      checked={item.is_completed}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <span className="flex-1 ml-2 text-lg">
                      {item.content_title}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
