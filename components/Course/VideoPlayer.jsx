"use client";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function VideoPlayer({ url }) {
  const isLocal = url.endsWith(".mp4");

  return isLocal ? (
    <video
      src={url}
      controls
      controlsList="nodownload"
      className="w-full aspect-video rounded-xl bg-black"
    />
  ) : (
    <ReactPlayer url={url} width="100%" height="100%" controls />
  );
}
