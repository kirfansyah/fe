// "use client";
// import dynamic from "next/dynamic";
// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

// export default function VideoPlayer({ url }) {
//   const isLocal = url.endsWith(".mp4");

//   return isLocal ? (
//     <video
//       src={url}
//       controls
//       controlsList="nodownload"
//       className="w-full aspect-video rounded-xl bg-black"
//     />
//   ) : (
//     <ReactPlayer url={url} width="100%" height="100%" controls />
//   );
// }
"use client";
import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Disable keyboard skipping (arrow, space, J, L, >, <)
    const blockKeys = (e) => {
      const blockedKeys = ["ArrowRight", "ArrowLeft", " ", "l", "j", ".", ","];
      if (blockedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", blockKeys);

    // Prevent seeking with click/drag
    const preventSeek = () => {
      if (vid.currentTime < vid._lastTime) {
        vid.currentTime = vid._lastTime;
      } else {
        vid._lastTime = vid.currentTime;
      }
    };

    vid.addEventListener("timeupdate", preventSeek);

    return () => {
      document.removeEventListener("keydown", blockKeys);
      vid.removeEventListener("timeupdate", preventSeek);
    };
  }, []);

  const isLocal = url.endsWith(".mp4");

  return isLocal ? (
    <video
      ref={videoRef}
      src={url}
      controls
      disablePictureInPicture
      controlsList="nodownload noplaybackrate"
      className="w-full aspect-video rounded-xl bg-black"
    />
  ) : (
    <ReactPlayer url={url} controls width="100%" height="100%" />
  );
}
