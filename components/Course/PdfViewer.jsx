"use client";
// import { useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import { Button } from "@/components/ui/button";
// // import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";

// // pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
// import "pdfjs-dist/build/pdf.worker.min.mjs";

// pdfjs.GlobalWorkerOptions.workerSrc =
//   typeof window !== "undefined"
//     ? window.location.origin + "/pdf.worker.min.mjs"
//     : "";

// export default function PdfViewer({ file }) {
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(null);

//   return (
//     <div className="flex flex-col items-center space-y-3">
//       <Document
//         file={file}
//         onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
//       >
//         <Page pageNumber={page} />
//       </Document>

//       <div className="flex gap-2">
//         <Button
//           variant="outline"
//           onClick={() => setPage((p) => Math.max(1, p - 1))}
//           disabled={page <= 1}
//         >
//           Prev
//         </Button>
//         <span>
//           {page} / {totalPages || "-"}
//         </span>
//         <Button
//           variant="outline"
//           onClick={() =>
//             setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p))
//           }
//           disabled={!totalPages || page >= totalPages}
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// }

export default function PdfViewer({ file }) {
  return (
    <iframe
      src={file}
      className="w-full h-[80vh] border rounded-lg"
      title="PDF Viewer"
    />
  );
}
