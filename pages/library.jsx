import { useState } from "react";
import LibraryLayout from "@/layouts/LibraryLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";

import EbookEmployeeView from "../components/Library/EbookEmployee";
// import { useMenuPermissions } from "@/hooks/useMenuPermissions";

export default function Library() {
  //   const permissions = useMenuPermissions();
  const [activeTab, setActiveTab] = useState("ebooks-list");
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedEbookId, setSelectedEbookId] = useState("");

  //   if (!permissions.can_view) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //         <div className="max-w-md text-center p-6">
  //           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //             <Lock className="w-8 h-8 text-red-600" />
  //           </div>
  //           <h2 className="text-2xl font-bold text-gray-900 mb-2">
  //             Access Denied
  //           </h2>
  //           <p className="text-gray-600 mb-6">
  //             You do not have permission to view the library.
  //           </p>
  //           <button
  //             onClick={() => window.history.back()}
  //             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  //           >
  //             Go Back
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <LibraryLayout>
      <div className="p-6 space-y-0">
        {/* Breadcrumb */}
        <Card className="rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-blue-500 text-white">
          <CardContent className="flex items-center text-base font-semibold text-white space-x-3 p-6">
            <Link href="/dashboard" className="">
              Home
            </Link>
            <ChevronRight className="w-5 h-5 text-white" />
            <Link href="/library" className="">
              Library
            </Link>
          </CardContent>
        </Card>

        <div>
          {/* ✅ FIXED: Langsung render inline, bukan pakai MainPage function */}
          {currentPage === "main" && (
            <div className="mt-2 ml-2 grid grid-cols-1 gap-6">
              {/* Content Section */}
              <div>
                {activeTab === "ebooks-list" && (
                  <EbookEmployeeView
                  // permissions={permissions}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </LibraryLayout>
  );
}
