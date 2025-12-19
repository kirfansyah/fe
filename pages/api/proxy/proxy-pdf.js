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

    // DEBUG: Log current headers
    console.log("Before setting headers:", res.getHeaders());

    // Remove conflicting headers
    res.removeHeader("X-Frame-Options");

    // Set new headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    res.setHeader("Access-Control-Allow-Origin", "https://lms.sambu.co.id");

    // DEBUG: Log after setting headers
    console.log("After setting headers:", res.getHeaders());

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Proxy PDF error:", error);
    res.status(500).json({ error: "Failed to proxy PDF" });
  }
}
