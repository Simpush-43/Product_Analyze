export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing ?url param" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const API_KEY = "AIzaSyDylCB1S9yh21ZfSM-_8KvQI6Ju4EGSHQA";

  try {
    // ⭐ Fetch DESKTOP performance
    const desktopUrl =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        target
      )}&strategy=DESKTOP&key=${API_KEY}`;

    const mobileUrl =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        target
      )}&strategy=MOBILE&key=${API_KEY}`;

    const [desktopRes, mobileRes] = await Promise.all([
      fetch(desktopUrl),
      fetch(mobileUrl),
    ]);

    const desktopJson = await desktopRes.json();
    const mobileJson = await mobileRes.json();

    const desktopLH = desktopJson.lighthouseResult || {};
    const mobileLH = mobileJson.lighthouseResult || {};

    // ⭐ Desktop Performance Score
    const perfScore = (desktopLH.categories?.performance?.score ?? 0) * 100;

    // ⭐ Mobile SEO Score (Reliable)
    const seoScore = (mobileLH.categories?.seo?.score ?? 0) * 100;

    // ⭐ Getting Core Vitals (Desktop)
    const audits = desktopLH.audits || {};

    const lcp = audits["largest-contentful-paint"]?.displayValue ?? null;
    const cls = audits["cumulative-layout-shift"]?.displayValue ?? null;
    const inp =
      audits["interaction-to-next-paint"]?.displayValue ??
      audits["interactive"]?.displayValue ??
      null;

    return new Response(
      JSON.stringify({
        success: true,
        performance: perfScore,
        seo: seoScore, // ⭐ FIXED — Now real SEO score
        lcp,
        cls,
        inp,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("PageSpeed error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "PageSpeed request crashed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
