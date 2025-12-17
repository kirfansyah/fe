export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  try {
    const video = await fetch(url);
    if (!video.ok) return res.status(500).send("Failed to fetch video");

    const buff = await video.arrayBuffer();

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(Buffer.from(buff));
  } catch (e) {
    res.status(500).send("Proxy error");
  }
}
