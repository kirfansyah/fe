export default async function handler(req, res) {
  const { path = [], ...query } = req.query;

  // Build URL target API
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryString = new URLSearchParams(query).toString();
  const target = `${baseUrl}/${path.join("/")}${
    queryString ? "?" + queryString : ""
  }`;

  //   console.log("➡️ Proxying to:", target);
  //   console.log("🧩 Method:", req.method);
  //   console.log("📦 Body:", req.body);

  // 👉 Ambil cookie token dari header (server-side)
  let token = null;
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    token = match ? match[1] : null;
  }

  console.log("🔑 Token from cookie:", token);

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // ⬅️ pakai token dari cookie
      },
      body:
        ["GET", "HEAD"].includes(req.method) || !req.body
          ? undefined
          : typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const html = await response.text();
      return res.status(502).json({
        error: "Backend returned HTML instead of JSON.",
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
