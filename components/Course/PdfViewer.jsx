"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
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

export default function PdfViewer({ file, onPageChange, onError = null }) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    console.log("📄 PDF FILE URL:", file);
  }, [file]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  useEffect(() => {
    const update = () => setWidth(Math.min(window.innerWidth * 0.6, 2000));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 🔥 Beri tahu parent apakah sudah halaman terakhir
  useEffect(() => {
    if (onPageChange && totalPages > 0) {
      onPageChange(page === totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center w-full py-4">
      <div className="flex justify-center w-full">
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
          onLoadError={(err) => {
            // console.error("PDF failed:", err);
            // toast.error("Gagal memuat PDF: " + err);
            console.group("📄 PDF LOAD ERROR");
            console.error("Raw error:", err);
            // console.error("Name:", err?.name);
            // console.error("Message:", err?.message);
            // console.error("Stack:", err?.stack);

            // pdfjs kadang simpan detail di .cause
            if (err?.cause) {
              console.error("Cause:", err.cause);
            }

            // Beberapa error pdfjs ada di .details
            if (err?.details) {
              console.error("Details:", err.details);
            }

            console.groupEnd();

            // toast.error(
            //   err?.message
            //     ? `PDF Error: ${err.message}`
            //     : "PDF gagal dimuat (unknown error)"
            // );

            if (onError) {
              onError(err?.message || "PDF gagal dimuat");
            }

            // if (onError) onError();

            // if (onError) {
            //   onError("Path File tidak ditemukan");
            // }
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
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg rounded-lg bg-white"
          />
        </Document>
      </div>

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
    </div>
  );
}
