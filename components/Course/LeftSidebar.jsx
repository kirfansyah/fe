import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { CourseContext } from "@/contexts/CourseContext";

export default function LeftSidebar() {
  const { state, setStep } = useContext(CourseContext);
  const { flow, currentStep, completed } = state;
  console.log("flow : ", flow);

  //   const totalItems = flow.reduce(
  //     (acc, step) => acc + (step.children ? step.children.length : 1),
  //     0
  //   );

  const totalItems = 7;
  const progressValue = (completed.length / totalItems) * 100;

  return (
    <Card className="md:w-1/3">
      <CardContent className="space-y-4 p-4">
        {/* Progress bar */}
        <div>
          <h2 className="font-bold mb-2">Course Progress</h2>
          <Progress value={progressValue} />
        </div>

        {/* Daftar step */}
        <div className="space-y-2">
          {flow.map((step) => {
            const isGroup = !!step.children;
            const allChildrenChecked =
              isGroup &&
              step.children.every((child) => completed.includes(child.id));

            return (
              <div key={step.id}>
                {/* Parent */}
                <div
                  className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
                    currentStep === step.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setStep(step.id)}
                >
                  <Checkbox
                    checked={
                      isGroup ? allChildrenChecked : completed.includes(step.id)
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="flex-1 ml-2">{step.title}</span>
                  {isGroup && <ChevronDown className="w-4 h-4" />}
                </div>

                {/* Children */}
                {isGroup && (
                  <div className="ml-6 space-y-1 mt-1">
                    {step.children.map((child) => (
                      <div
                        key={child.id}
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          currentStep === child.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setStep(child.id)}
                      >
                        <Checkbox
                          checked={completed.includes(child.id)}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <span className="ml-2">{child.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
