export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) return res.status(400).send("Missing url");

  try {
    const pdf = await fetch(url);
    if (!pdf.ok) return res.status(500).send("Failed to fetch PDF");

    const buffer = await pdf.arrayBuffer();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    console.error(e);
    res.status(500).send("Proxy error");
  }
}
