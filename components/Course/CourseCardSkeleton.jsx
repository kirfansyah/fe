import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseCardSkeleton({ viewMode }) {
  return (
    <Card
      className={viewMode === "tiles" ? "w-96 relative" : "w-full relative"}
    >
      <CardHeader className="mt-1">
        <CardTitle>
          <Skeleton className="h-6 w-3/4" />
        </CardTitle>
        <CardDescription className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className={
            viewMode === "tiles"
              ? "flex flex-col md:flex-row gap-4"
              : "flex flex-row gap-3"
          }
        >
          <Skeleton
            className={
              viewMode === "tiles"
                ? "md:w-1/2 h-40 rounded-md"
                : "w-32 h-20 rounded-md"
            }
          />
          <div
            className={
              viewMode === "tiles"
                ? "md:w-1/2 flex flex-col justify-start space-y-2"
                : "flex flex-col justify-start text-sm space-y-1"
            }
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </CardContent>

      {viewMode === "tiles" && (
        <CardFooter className="border-t pt-4">
          <div className="w-full grid grid-cols-4 divide-x divide-gray-300 text-center">
            {[...Array(4)].map((_, idx) => (
              <div className="px-4" key={idx}>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-3/4 mt-1" />
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
