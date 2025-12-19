// "use client";

// import { useRef, useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import {
//   Maximize,
//   Minimize,
//   Volume2,
//   VolumeX,
//   Play,
//   Pause,
// } from "lucide-react";

// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

// export default function VideoPlayer({ url, videoId, onVideoEnd, active }) {
//   const isLocal = typeof url === "string" && url.endsWith(".mp4");
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);

//   const [lastTime, setLastTime] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [volume, setVolume] = useState(1);
//   const [muted, setMuted] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);

//   /* ================================ LOAD SAVED PROGRESS ================================ */
//   useEffect(() => {
//     const saved = localStorage.getItem(`video-progress-${videoId}`);
//     if (saved && saved !== "COMPLETED") {
//       setLastTime(parseFloat(saved));
//     }
//   }, [videoId]);

//   /* ================================ LOCAL VIDEO – ANTI SKIP ================================ */
//   useEffect(() => {
//     if (!isLocal || !videoRef.current) return;

//     const video = videoRef.current;

//     video.onloadedmetadata = () => {
//       const safeTime = Number.isFinite(lastTime) ? lastTime : 0;
//       const finalTime = Math.min(safeTime, video.duration || 0);
//       video.currentTime = finalTime;
//       video.playbackRate = 1;
//       video.volume = volume;
//       video.muted = muted;
//       setLoading(false);
//       setIsPlaying(!video.paused);
//     };

//     const preventSeek = () => {
//       localStorage.setItem(
//         `video-progress-${videoId}`,
//         video.currentTime.toString()
//       );

//       if (video.currentTime > lastTime + 1) {
//         video.currentTime = lastTime;
//       } else {
//         setLastTime(video.currentTime);
//       }

//       video.playbackRate = 1;
//       video.volume = volume;
//       video.muted = muted;
//       setIsPlaying(!video.paused);
//     };

//     video.addEventListener("timeupdate", preventSeek);
//     return () => video.removeEventListener("timeupdate", preventSeek);
//   }, [isLocal, lastTime, videoId, volume, muted]);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.code === "Space") {
//         e.preventDefault(); // cegah scroll halaman
//         togglePlayPause();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isPlaying, volume, muted]);

//   /* ================================ PLAY / PAUSE ================================ */
//   const togglePlayPause = () => {
//     if (!videoRef.current) return;
//     if (videoRef.current.paused) {
//       videoRef.current.play();
//       setIsPlaying(true);
//     } else {
//       videoRef.current.pause();
//       setIsPlaying(false);
//     }
//   };

//   /* ================================ FULLSCREEN ================================ */
//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       containerRef.current.requestFullscreen?.();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen?.();
//       setIsFullscreen(false);
//     }
//   };

//   /* ================================ MUTE & VOLUME ================================ */
//   const toggleMute = () => {
//     setMuted(!muted);
//     if (isLocal && videoRef.current) videoRef.current.muted = !muted;
//   };

//   const handleVolumeChange = (e) => {
//     const vol = parseFloat(e.target.value);
//     setVolume(vol);
//     if (isLocal && videoRef.current) videoRef.current.volume = vol;
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="relative w-full aspect-video rounded-xl bg-black overflow-hidden group"
//     >
//       {/* ================= LOCAL VIDEO ================= */}
//       {isLocal && (
//         <video
//           ref={videoRef}
//           src={url}
//           className="w-full h-full"
//           controls={false}
//           disablePictureInPicture
//           onLoadedMetadata={() => setLoading(false)}
//           onCanPlay={() => setLoading(false)}
//           onWaiting={() => setLoading(true)}
//           onEnded={() => {
//             localStorage.setItem(`video-progress-${videoId}`, "COMPLETED");
//             if (onVideoEnd) onVideoEnd();
//             setIsPlaying(false);
//           }}
//         />
//       )}

//       {/* ================= ONLINE VIDEO ================= */}
//       {!isLocal && (
//         <ReactPlayer
//           url={url}
//           width="100%"
//           height="100%"
//           playing={active}
//           controls={false}
//           stopOnUnmount={false}
//           volume={volume}
//           muted={muted}
//           onReady={() => setLoading(false)}
//           onStart={() => setLoading(false)}
//           onBuffer={() => setLoading(true)}
//           onBufferEnd={() => setLoading(false)}
//           onPlay={() => setIsPlaying(true)}
//           onPause={() => setIsPlaying(false)}
//         />
//       )}

//       {/* ================= LOADING OVERLAY ================= */}
//       {loading && (
//         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
//           <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
//           <p className="text-white text-sm">Loading video...</p>
//         </div>
//       )}

//       {/* ================= FULLSCREEN BUTTON ================= */}
//       <button
//         onClick={toggleFullscreen}
//         className="absolute top-3 right-3 z-30 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
//       >
//         {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
//       </button>

//       {/* ================= YOUTUBE-STYLE CONTROLS ================= */}
//       {!loading && (
//         <div
//           className="absolute bottom-0 left-0 right-0 z-30 flex justify-center gap-2
//                      bg-black/50 p-3 rounded-t-lg opacity-0 translate-y-4
//                      transition-all duration-300
//                      group-hover:opacity-100 group-hover:translate-y-0"
//         >
//           {/* Play / Pause */}
//           <button
//             onClick={togglePlayPause}
//             className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white"
//           >
//             {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//           </button>

//           {/* Volume */}
//           <div className="flex items-center gap-2 bg-black/70 px-2 py-1 rounded-lg">
//             <button onClick={toggleMute} className="text-white">
//               {muted || volume === 0 ? (
//                 <VolumeX size={20} />
//               ) : (
//                 <Volume2 size={20} />
//               )}
//             </button>
//             <input
//               type="range"
//               min="0"
//               max="1"
//               step="0.01"
//               value={volume}
//               onChange={handleVolumeChange}
//               className="w-24"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function VideoPlayer({ url, videoId, onVideoEnd, active }) {
  const isLocal = typeof url === "string" && url.endsWith(".mp4");
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [lastTime, setLastTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showElapsed, setShowElapsed] = useState(false);

  // ⏱️ tambahan (tidak mengubah logic)
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  /* ================================ LOAD SAVED PROGRESS ================================ */
  useEffect(() => {
    const saved = localStorage.getItem(`video-progress-${videoId}`);
    if (saved && saved !== "COMPLETED") {
      setLastTime(parseFloat(saved));
    }
  }, [videoId]);

  /* ================================ LOCAL VIDEO – ANTI SKIP ================================ */
  useEffect(() => {
    if (!isLocal || !videoRef.current) return;

    const video = videoRef.current;

    video.onloadedmetadata = () => {
      const safeTime = Number.isFinite(lastTime) ? lastTime : 0;
      const finalTime = Math.min(safeTime, video.duration || 0);

      video.currentTime = finalTime;

      // ⏱️ tambahan
      setDuration(video.duration || 0);
      setCurrentTime(finalTime);

      video.playbackRate = 1;
      video.volume = volume;
      video.muted = muted;
      setLoading(false);
      setIsPlaying(!video.paused);
    };

    const preventSeek = () => {
      // ⏱️ tambahan
      setCurrentTime(video.currentTime);

      localStorage.setItem(
        `video-progress-${videoId}`,
        video.currentTime.toString()
      );

      if (video.currentTime > lastTime + 1) {
        video.currentTime = lastTime;
      } else {
        setLastTime(video.currentTime);
      }

      video.playbackRate = 1;
      video.volume = volume;
      video.muted = muted;
      setIsPlaying(!video.paused);
    };

    video.addEventListener("timeupdate", preventSeek);
    return () => video.removeEventListener("timeupdate", preventSeek);
  }, [isLocal, lastTime, videoId, volume, muted]);

  /* ================================ SPACE TO PLAY / PAUSE ================================ */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  /* ================================ PLAY / PAUSE ================================ */
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  /* ================================ FULLSCREEN ================================ */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  /* ================================ MUTE & VOLUME ================================ */
  const toggleMute = () => {
    setMuted(!muted);
    if (isLocal && videoRef.current) videoRef.current.muted = !muted;
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (isLocal && videoRef.current) videoRef.current.volume = vol;
  };

  /* ================================ TIME HELPERS ================================ */
  const formatTime = (sec = 0) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const remaining = Math.max(duration - currentTime, 0);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl bg-black overflow-hidden group"
    >
      {/* ================= LOCAL VIDEO ================= */}
      {isLocal && (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full"
          controls={false}
          disablePictureInPicture
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onEnded={() => {
            localStorage.setItem(`video-progress-${videoId}`, "COMPLETED");
            if (onVideoEnd) onVideoEnd();
            setIsPlaying(false);
          }}
        />
      )}

      {/* ================= ONLINE VIDEO ================= */}
      {!isLocal && (
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          playing={active}
          controls={false}
          volume={volume}
          muted={muted}
          onReady={() => setLoading(false)}
          onStart={() => setLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onProgress={(p) => {
            setCurrentTime(p.playedSeconds);
            setDuration(p.loadedSeconds);
          }}
        />
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-white text-sm">Loading video...</p>
        </div>
      )}

      {/* ================= FULLSCREEN BUTTON ================= */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-30 bg-transparent p-2 border-outline-none focus:outline-none focus:ring-0 outline-none ring-0"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      {/* ================= CONTROLS ================= */}
      {!loading && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-3
                     bg-black/50 p-3 rounded-t-lg opacity-0 translate-y-4
                     transition-all duration-300
                     group-hover:opacity-100 group-hover:translate-y-0"
        >
          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            className="p-2 bg-transparent text-white border-outline-none focus:outline-none focus:ring-0 outline-none ring-0"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Countdown */}
          <div
            onClick={() => setShowElapsed((v) => !v)}
            className="text-white text-smbg-transparent px-2 py-1 rounded border-outline-none"
          >
            {showElapsed ? (
              <>
                {formatTime(currentTime)} / {formatTime(duration)}
              </>
            ) : (
              <>-{formatTime(remaining)}</>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 bg-transparent px-2 py-1 rounded-lg ml-auto border-outline-none focus:outline-none focus:ring-0 outline-none ring-0">
            <button
              onClick={toggleMute}
              className="text-white focus:outline-none focus:ring-0 outline-none ring-0"
            >
              {muted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}
