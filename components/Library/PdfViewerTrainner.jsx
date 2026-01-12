"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({
  file,
  onPageChange,
  onError = null,
  currentPage = null,
  initialPage = 1,
  showControls = true,
  onLoadSuccess = null,
}) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    // console.log("📄 PDF FILE URL:", file);
  }, [file]);

  // Sync with parent's currentPage
  useEffect(() => {
    if (currentPage !== null && currentPage !== page) {
      setPage(currentPage);
      //   console.log("📄 Page synced from parent:", currentPage);
    }
  }, [currentPage]);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     //   pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  //     pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
  //   }
  // }, []);

  //   useEffect(() => {
  //     if (typeof window !== "undefined") {
  //       pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.js`; // test  di production
  //     }
  //   }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://lms.sambu.co.id/pdf.worker.js";
    }
  }, []);

  // 🔥 Beri tahu parent apakah sudah halaman terakhir
  useEffect(() => {
    if (onPageChange && totalPages > 0) {
      onPageChange(page === totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div
        ref={containerRef}
        className="flex justify-center items-center w-full h-full overflow-auto"
        style={{ maxHeight: "calc(150vh - 200px)" }}
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => {
            setTotalPages(numPages);
            if (onLoadSuccess) {
              onLoadSuccess(numPages);
            }
          }}
          onLoadError={(err) => {
            console.group("📄 PDF LOAD ERROR");
            console.error("Raw error:", err);

            if (err?.cause) {
              console.error("Cause:", err.cause);
            }

            if (err?.details) {
              console.error("Details:", err.details);
            }

            console.groupEnd();

            if (onError) {
              onError(err?.message || "PDF gagal dimuat");
            }
          }}
          loading={<div className="text-center p-4">Loading PDF...</div>}
          error={
            <div className="text-center p-4 text-red-600">
              Path File tidak ditemukan
            </div>
          }
        >
          <Page
            pageNumber={page}
            height={
              containerRef.current?.clientHeight || window.innerHeight - 200
            }
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg rounded-lg bg-white"
          />
        </Document>
      </div>

      {showControls && (
        <div className="flex items-center gap-5 mt-6">
          {/* === PREVIOUS BUTTON === */}
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-xl transition-all
        ${
          page === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white shadow-md hover:bg-gray-100 text-gray-700"
        }
      `}
          >
            <ChevronLeft size={18} />
          </button>

          {/* PAGE INDICATOR */}
          <span className="text-lg font-semibold text-gray-700">
            {page} / {totalPages || "?"}
          </span>

          {/* === NEXT BUTTON === */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-xl transition-all
        ${
          page === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white shadow-md hover:bg-gray-100 text-gray-700"
        }
      `}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
