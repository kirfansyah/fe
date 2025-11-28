export default function PptViewer({ fileUrl }) {
  if (!fileUrl) {
    return (
      <p className="text-center text-gray-500">
        Tidak ada file untuk ditampilkan
      </p>
    );
  }

  const isGoogleSlides = fileUrl.includes("docs.google.com/presentation");

  const isLocalOrNgrok =
    fileUrl.includes("localhost") || fileUrl.includes("ngrok-free.dev");

  let viewerUrl = "";

  if (isGoogleSlides) {
    viewerUrl =
      fileUrl.replace("/edit", "/embed") +
      "?start=false&loop=false&delayms=3000";
  } else if (isLocalOrNgrok) {
    viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      fileUrl
    )}&embedded=true`;
  } else {
    viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      fileUrl
    )}`;
  }

  return (
    <div className="w-full h-[80vh] rounded-xl overflow-hidden shadow-md">
      <iframe
        src={viewerUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
}
