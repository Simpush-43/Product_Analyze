const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing ?url param" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const hostname = new URL(target).hostname;
    const q = `site:${hostname}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;

    const res = await fetch(searchUrl, { headers: HEADERS });

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Google search failed (${res.status})`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();

    /* ---------------------------------------------
       1️⃣ Primary Regex (Global Google formats)
    ----------------------------------------------*/
    let match =
      html.match(/(?:About|約)?\s*([\d,.\s]+)\s+(?:results|結果|résultats)/i);

    let resultSource = "PRIMARY_REGEX";

    /* ---------------------------------------------
       2️⃣ Fallback #1 — result-stats div
    ----------------------------------------------*/
    if (!match) {
      const statsMatch = html.match(
        /id="result-stats"[^>]*>(.*?)<\/div>/i
      );
      if (statsMatch) {
        match = statsMatch[1].match(/([\d,.\s]+)/);
        resultSource = "FALLBACK_RESULT_STATS";
      }
    }

    /* ---------------------------------------------
       3️⃣ Fallback #2 — ANY numeric + results combo
    ----------------------------------------------*/
    if (!match) {
      const looseMatch = html.match(/([\d,.\s]+)\s+results/i);
      if (looseMatch) {
        match = looseMatch;
        resultSource = "FALLBACK_LOOSE_MATCH";
      }
    }

    /* ---------------------------------------------
       ❌ If STILL no match → Google hid the count
    ----------------------------------------------*/
    if (!match) {
      console.log("⚠️ Google did not expose result count for:", hostname);

      return new Response(
        JSON.stringify({
          success: true,
          host: hostname,
          indexedPages: null,
          note: "Google hid the result count. Common on branded sites.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    /* ---------------------------------------------
       🧹 Clean the number (remove commas, spaces, dots)
    ----------------------------------------------*/
    const clean = match[1].replace(/[^\d]/g, "");
    const indexCount = parseInt(clean, 10);

    console.log(`📊 Index Count (${resultSource}):`, indexCount);

    return new Response(
      JSON.stringify({
        success: true,
        host: hostname,
        indexedPages: indexCount,
        source: resultSource,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Indexing error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Indexing check crashed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
