import * as cheerio from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

const cleanTxt = (t = "") =>
  t.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();

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
    const res = await fetch(target, { headers: HEADERS });
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch HTML (${res.status})`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // ----------------------------
    // TITLE extraction (fixed)
    // ----------------------------
    let title =
      cleanTxt($("title").text()) ||
      cleanTxt($("meta[property='og:title']").attr("content") || "") ||
      cleanTxt($("h1").first().text() || "");

    // ----------------------------
    // META DESCRIPTION
    // ----------------------------
    const metaDescription = cleanTxt(
      $(`meta[name="description"]`).attr("content") || ""
    );

    // ----------------------------
    // H1 TAGS
    // ----------------------------
    const h1s = $("h1")
      .map((i, el) => cleanTxt($(el).text()))
      .get()
      .filter(Boolean);

    // ----------------------------
    // WORD COUNT
    // ----------------------------
    const bodyText = cleanTxt($("body").text() || "");
    const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

    // ----------------------------
    // IMAGES
    // ----------------------------
    const totalImages = $("img").length;
    const imageWithoutAlt = $("img").filter(
      (_, img) => !cleanTxt($(img).attr("alt") || "")
    ).length;

    // ----------------------------
    // SCHEMA.ORG JSON-LD
    // ----------------------------
    const hasSchemaOrg = $('script[type="application/ld+json"]').length > 0;

    return new Response(
      JSON.stringify({
        success: true,
        title,
        metaDescription,
        h1s,
        wordCount,
        totalImages,
        imageWithoutAlt,
        hasSchemaOrg,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("On-page SEO error:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: "On-page SEO request crashed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
