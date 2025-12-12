export async function GET(req) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response("Failed to fetch PDF", { status: 500 });
    }

    const pdfBuffer = await response.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("PDF Proxy Error:", e);
    return new Response("Proxy error", { status: 500 });
  }
}
