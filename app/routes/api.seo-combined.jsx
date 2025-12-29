import * as cheerio from "cheerio";
const cleanTxt = (t = "") =>
  t
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
async function resolveDomain(shop) {
  shop = shop
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "");
  const looksLikeDomain = shop.includes(".");
  const guesses = looksLikeDomain
    ? [`https://${shop}`]
    : [
        `https://${shop}.myshopify.com`,
        `https://${shop}.com`,
        `https://${shop}.in`,
        `https://${shop}.store`,
        `https://www.${shop}.com`,
        `https://${shop}.co`,
      ];
  for (const domain of guesses) {
    try {
      const head = await fetch(domain, { method: "HEAD" });
      if (head.ok) {
        console.log("✅ SEO domain resolved:", domain);
        return domain;
      }
    } catch (e) {
      console.warn("Domain guess failed:", domain, e?.message);
    }
  }
  return null;
}
function calculateCustomSEO(onpage){
  let score =0;
  // title score 20 points
  if(onpage.title && onpage.title.length >=20 && onpage.title.length <=60)
    score +=20;
  // Meta description score (20 points)
  if(onpage.metaDescription && onpage.metaDescription.length >=50 && onpage.metaDescription.length <=160)
    score +=20;
  // h1 score 10 points
  if(onpage.h1s && onpage.h1s?.length >0)
    score +=10;
  // image alt score
  if(onpage.totalImages > 0){
    const ratio = 1- onpage.imageWithoutAlt/onpage.totalImages;
    score += Math.max(0,Math.min(20,ratio*20));
  }
  // word count 10 points
  if(onpage.wordCount >= 2000 && onpage.wordCount <= 5000)
    score +=10;
    // Structured data score (20 pts)
  if (onpage.hasSchemaOrg) score += 20;
  return Math.round(score);
}
export const loader = async({request}) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  console.log("🔥 Backend received shop:", shop); // ✅ correct source

  if (!shop) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing shop param",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const resolved = await resolveDomain(shop);
  if (!resolved) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Could not resolve store domain",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const reqUrl = new URL(request.url);
  const origin = `${reqUrl.protocol}//${reqUrl.host}`;
  const targetUrl = resolved;

  const [psRes, onpageRes, indexRes] = await Promise.all([
    fetch(`${origin}/api/seo-pagespeed?url=${encodeURIComponent(targetUrl)}`),
    fetch(`${origin}/api/seo-onpage?url=${encodeURIComponent(targetUrl)}`),
    fetch(`${origin}/api/seo-indexing?url=${encodeURIComponent(targetUrl)}`),
  ]);

  const [pagespeed, onpage, indexing] = await Promise.all([
    psRes.json().catch(() => ({ success: false })),
    onpageRes.json().catch(() => ({ success: false })),
    indexRes.json().catch(() => ({ success: false })),
  ]);
let googleSEO = pagespeed?.seo ?? 0;
// fallback custom seo score
const customSEO = calculateCustomSEO(onpage);
// final seo score
const finalSEOScore = googleSEO ===0? customSEO:googleSEO
  return new Response(
    JSON.stringify({
      success: true,
      resolveDomain: targetUrl,
      shop,
      pagespeed:{
        ...pagespeed,
        finalSEO:finalSEOScore
      },
      onpage,
      indexing,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
