"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Minimize, Maximize, X } from "lucide-react";
import { toast } from "sonner";

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false },
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

export default function PdfViewer({
  file,
  onPageChange,
  onError = null,
  contentId,
}) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [width, setWidth] = useState(600);
  //   const [width, setWidth] = useState(undefined);
  const [rotate, setRotate] = useState(0); // rotasi halaman PDF
  const [isLandscape, setIsLandscape] = useState(false); // landscape detection
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const shouldRotate = isFullscreen && isLandscape; // abaikan isMobile
  const [pageSize, setPageSize] = useState({ width: 600, height: 800 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      let w = 0;
      let h = 0;

      if (isFullscreen) {
        w = window.innerWidth;
        h = window.innerHeight;
      } else if (containerRef.current) {
        w = containerRef.current.clientWidth;
        h = window.innerHeight; // biar tetap full tinggi layar
      }

      // kasih padding buat tombol/indicator biar ga kepotong
      setPageSize({
        width: w,
        height: h - 100,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, [isFullscreen]);

  //   useEffect(() => {
  //     console.log("📄 PDF FILE URL:", file);
  //   }, [file]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://lms.sambu.co.id/pdf.worker.js";
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

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft" && page > 1) setPage((p) => p - 1);
      if (e.key === "ArrowRight" && page < totalPages) setPage((p) => p + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page, totalPages]);

  useEffect(() => {
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(hideTimeoutRef.current);

      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("mousemove", resetTimer);
    el.addEventListener("touchstart", resetTimer);

    resetTimer(); // initial

    return () => {
      el.removeEventListener("mousemove", resetTimer);
      el.removeEventListener("touchstart", resetTimer);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!contentId) return;

    const savedPage = localStorage.getItem(`pdf-progress-${contentId}`);
    const parsedPage = parseInt(savedPage, 10);

    if (parsedPage && !isNaN(parsedPage) && parsedPage > 0) {
      setPage(parsedPage);
    } else {
      setPage(1); // reset jika NaN atau 0
    }
  }, [contentId]);

  useEffect(() => {
    if (!contentId) return;
    if (!page || isNaN(page)) {
      setPage(1);
      return;
    }

    localStorage.setItem(`pdf-progress-${contentId}`, page.toString());
  }, [page, contentId]);

  useEffect(() => {
    if (page === totalPages && totalPages > 0) {
      localStorage.setItem(`pdf-progress-${contentId}`, "COMPLETED");
    }
  }, [page, totalPages, contentId]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        // setWidth(undefined);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        // setWidth(600);
      }
    } catch (err) {
      console.warn("Fullscreen gagal:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full py-4">
      <div
        ref={containerRef}
        className={`relative flex justify-center items-center group w-full`}
        style={{
          transform:
            isFullscreen && isLandscape && isMobile
              ? "rotate(90deg)"
              : "rotate(0deg)",
          // shouldRotate ? "rotate(90deg)" : "rotate(0deg)",
          transformOrigin: "center center",
        }}
      >
        {/* ===== PREVIOUS BUTTON (LEFT) ===== */}
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-all ${
            showControls ? "opacity-100" : "opacity-0"
          } md:opacity-0 md:group-hover:opacity-100 focus:outline-none focus:ring-0 outline-none ring-0 ${
            page === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white shadow-lg hover:bg-gray-100 text-gray-700"
          }`}
        >
          <ChevronLeft size={22} />
        </button>

        {/* ===== FULLSCREEN BUTTON (TOP RIGHT) ===== */}
        <button
          onClick={toggleFullscreen}
          className={`absolute top-4 right-4 z-30 px-3 py-2 rounded-lg text-sm font-medium bg-transparent border-outline-none  transition ${
            showControls ? "opacity-100" : "opacity-0"
          } ${
            isFullscreen ? "text-white" : "text-black"
          } md:opacity-0 md:group-hover:opacity-100 focus:outline-none focus:ring-0 outline-none ring-0`}
        >
          {isFullscreen ? (
            <button
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen"
              className="
                    flex items-center justify-center
                    w-8 h-8
                    rounded-md
                    bg-red-500
                    transition-colors
                    bg-red-500/90 hover:bg-red-600
                    shadow-sm hover:shadow-md

                    outline-none
                    focus:outline-none
                    focus:ring-0
                    focus-visible:outline-none
                    "
            >
              <X size={18} className="text-white" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsFullscreen(true);
                setWidth(undefined); // contoh: jadi full layar
              }}
              aria-label="Enter fullscreen"
              className="
                    flex items-center justify-center
                    w-8 h-8
                    rounded-md
                    hover:bg-gray-100
                    transition-colors
                    shadow-sm hover:shadow-md
                    outline-none
                    focus:outline-none
                    focus:ring-0
                    focus-visible:outline-none
                    "
            >
              <Maximize size={18} />
            </button>
          )}
        </button>

        {/* ===== PDF DOCUMENT ===== */}
        <Document
          file={file}
          onLoadSuccess={async (pdf) => {
            setTotalPages(pdf.numPages);

            // 🔥 DETEKSI ORIENTASI HALAMAN PERTAMA
            try {
              const firstPage = await pdf.getPage(1);
              const viewport = firstPage.getViewport({ scale: 1 });
              setIsLandscape(viewport.width > viewport.height);
              setRotate(0); // PDF tetap portrait di viewer, rotate hanya container
            } catch (err) {
              console.warn("Gagal deteksi orientasi:", err);
            }
          }}
          onLoadError={(err) => {
            if (err?.cause) console.error("Cause:", err.cause);
            if (err?.details) console.error("Details:", err.details);

            toast.error(
              err?.message
                ? `PDF Error: ${err.message}`
                : "PDF gagal dimuat (unknown error)",
            );

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
          <div className="flex items-center justify-center h-full w-full">
            <Page
              pageNumber={page}
              // width={
              //   isFullscreen && isLandscape && isMobile
              //     ? window.innerHeight - 80
              //     : width
              // }
              width={isFullscreen ? undefined : width}
              height={
                isFullscreen && isLandscape && isMobile
                  ? window.innerWidth - 80
                  : isFullscreen
                    ? window.innerHeight - 80
                    : undefined
              }
              //   width={undefined}
              //   height={
              //     isFullscreen && isLandscape && isMobile
              //       ? pageSize.width - 80
              //       : pageSize.height
              //   }
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg rounded-lg bg-white"
              //   rotate={rotate}
            />
          </div>
        </Document>

        {/* ===== NEXT BUTTON (RIGHT) ===== */}
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-all ${
            showControls ? "opacity-100" : "opacity-0"
          } md:opacity-0 md:group-hover:opacity-100 focus:outline-none focus:ring-0 outline-none ring-0 ${
            page === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white shadow-lg hover:bg-gray-100 text-gray-700"
          }`}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* ===== PAGE INDICATOR ===== */}
      <div className="mt-4 text-lg font-semibold text-gray-700">
        {page} / {totalPages || "?"}
      </div>
    </div>
  );
}
