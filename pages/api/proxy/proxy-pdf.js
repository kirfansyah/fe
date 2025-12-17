// pages/api/proxy-pdf.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: req.headers.authorization || "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const buffer = await response.arrayBuffer();

    // Set headers untuk allow iframe
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Frame-Options", "ALLOWALL"); // Allow iframe
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Proxy PDF error:", error);
    res.status(500).json({ error: "Failed to proxy PDF" });
  }
}
