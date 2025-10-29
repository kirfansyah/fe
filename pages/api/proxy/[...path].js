export default async function handler(req, res) {
  const { path = [], ...query } = req.query;

  // gabungkan path + query string
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryString = new URLSearchParams(query).toString();
  const target = `${baseUrl}/${path.join("/")}${
    queryString ? "?" + queryString : ""
  }`;

  console.log("➡️ Proxying to:", target);

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const html = await response.text();
      return res.status(502).json({
        error: "Ngrok returned HTML instead of JSON (blocked by ngrok).",
        preview: html.slice(0, 200),
      });
    }

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}
