import * as cheerio from "cheerio";
// store cache
const storeCache = new Map();

export const loader = async ({ request }) => {
  console.log(
    "🟢 [START] /api/shop-collections (Cheerio Scraper + Pagination)",
  );

  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response(
      JSON.stringify({ success: false, error: "Shop name missing" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  shop = shop.trim().toLowerCase();
  if (storeCache.has(shop)) {
    const cached = storeCache.get(shop);
    // expire after 24 hours
    const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000;
    if (!isExpired) {
      console.log("⚡ CACHE HIT → Returning instantly:", shop);
      return new Response(
        JSON.stringify({
          success: true,
          shop: cached.shop,
          total: cached.collections.length,
          collections: cached.collections,
          cached: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } else {
      console.log("⚠️ Cache expired → rescraping");
      storeCache.delete(shop);
    }
  }
  // case of no cache
  const looksLikeDomain = shop.includes(".");
  const possibleDomains = looksLikeDomain
    ? [`https://${shop.replace(/^https?:\/\//, "")}`]
    : [
        `https://${shop}.myshopify.com`,
        `https://${shop}.com`,
        `https://${shop}.in`,
        `https://${shop}.store`,
        `https://www.${shop}.com`,
        `https://${shop}.co`,
      ];

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml",
  };

  const cleanTxt = (t = "") =>
    t
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .trim();

  const unwantedPatterns = [
    /quick\s*links/i,
    /subscribe/i,
    /contact\s*us/i,
    /added\s*successfully/i,
    /newsletter/i,
    /₹\s*0/i,
    /policy/i,
    /terms/i,
    /privacy/i,
    /example/i,
    /Recover password/i,
    /login/i,
    /mailto:care@voltas.com/i,
    /about voltas/i,
    /tel:/i,
  ];
  const isGarbage = (text) =>
    unwantedPatterns.some((p) => p.test(text)) || text.length < 2;

  const collections = [];
  const seen = new Set();
  let finalDomain = null;

  for (const baseUrl of possibleDomains) {
    try {
      console.log(`🕸️ Trying domain: ${baseUrl}`);

      let page = 1;
      let fallbackToAll = false; // 🔥 Fallback flag added

      while (true) {
        // 🔥 Fallback URL logic
        const htmlUrl = fallbackToAll
          ? `${baseUrl}/collections/all?page=${page}`
          : `${baseUrl}/collections?page=${page}`;

        console.log(`📄 Scraping page ${page}: ${htmlUrl}`);

        const res = await fetch(htmlUrl, { headers, redirect: "follow" });
        if (!res.ok) {
          console.warn(`⚠️ ${htmlUrl} failed with ${res.status}`);
          break;
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // 🔹 Detect items
        const items = $(
          ".grid-product, .product-card, .product-item, .product-block, .collection-grid-item, .collection-card, .grid__item, .collection-item, .collection-block, .template-list-collections, .ProductItem, .collection, li.wizzy-result-product, .wizzy-search-results, .grid-product__content, .product-grid .grid__item .list-collections__item-list, .collection-list .product-grid-container ul, #product-grid .grid__item.grid-product,.collection-list__container,li.collection__item , li.collection-list__item grid__item,.grid__cell ,.grid,.t4s-container,.box_cl_grid,.cat_grid_item",
        );

        // 🔥 Fallback trigger (Fireboltt return 1-2 items only)
        if (!fallbackToAll && items.length <= 3) {
          console.log(
            "⚠️ Few items found → switching to fallback /collections/all",
          );
          fallbackToAll = true;
          page = 1;
          continue;
        }

        if (!items.length) {
          console.log(`❌ No collections found on page ${page}`);
          break;
        }

        items.each((i, el) => {
          let title = "";
          [
            ".collection-grid-item__title",
            ".collection-card__title",
            ".collection-title",
            ".card__heading",
            ".collection-item__title",
            ".CollectionItem__Content h2",
            "h2",
            "h3",
            ".card__heading a",
            ".list-collection__item-title",
            ".grid-product__title",
            ".grid-product__title a",
            ".collection-card__content",
            ".collection__item-title",
            ".card__heading",
            ".collection-block-item__title",
            ".t4s-cat-title"
          ].some((sel) => {
            const t = cleanTxt($(el).find(sel).first().text());
            if (t && !isGarbage(t)) {
              title = t;
              return true;
            }
          });

          // 🔥 Fireboltt title fallback (from URL)
          if (!title) {
            const href = $(el).find("a").attr("href");
            if (href) {
              title = cleanTxt(href.split("/").pop().replace(/-/g, " "));
            }
          }

          let link =
            $(el)
              .find("a[href*='/collections/'],a[href*='/products/']")
              .first()
              .attr("href") ||
            $(el).closest("a").attr("href") ||
            "";

          if (link?.startsWith("//")) link = "https:" + link;
          if (link && !link.startsWith("http")) link = `${baseUrl}${link}`;

          let image =
            $(el).find(".grid-product__image").attr("src") ||
            $(el).find(".grid-product__image").attr("data-src") ||
            $(el).find(".collection__item-image img").attr("src") ||
            $(el).find(".collection__item-image img").attr("data-src") ||
            $(el).find("img").attr("src") ||
            $(el).find("img").attr("data-src") ||
            $(el).find(".media img").attr("src") ||
            $(el).find(".media img").attr("data-src") ||
            $(el).find(".collection-block-item__image").attr("src") ||
            $(el).find(".collection-block-item__image").attr("data-src") ||
            $(el).find(".collection-image svg").attr("xmlns") ||
            $(el).find(".collection-image svg").attr("data-src") ||
            $(el).find(".t4s_ratio img").attr("src") ||
            $(el).find(".t4s_ratio img").attr("srcset") ||
            "";

          // Extract from background-image: url(...)
          if (!image) {
            image =
              $(el)
                .find("[class*='collection-block-item__image']")
                .attr("data-bg") || "";
          }
          if (!image) {
            const style =
              $(el)
                .find("[class*='collection-block-item__image']")
                .attr("style") || "";
            const match = style.match(/url\(['"]?(.*?)['"]?\)/);

            if (match && match[1]) {
              image = match[1];
            }
          }

          if (image?.startsWith("//")) image = "https:" + image;
          if (image && !image.startsWith("http"))
            image = `${baseUrl}/${image.replace(/^\/+/, "")}`;

          if (!image)
            image =
              "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png";

          const key = link || `${title}-${image}`;
          if (seen.has(key)) return;
          seen.add(key);

          if (title && !isGarbage(title)) {
            collections.push({
              id: collections.length + 1,
              title,
              link,
              image,
            });
          }
        });

        const next = $("a[rel='next']").attr("href");
        if (!next) {
          console.log("🚫 No next page found");
          break;
        }

        page++;
        await new Promise((r) => setTimeout(r, 100));
      }

      if (collections.length > 0) {
        finalDomain = baseUrl;
        break;
      }
    } catch (err) {
      console.error(`💥 Failed for ${baseUrl}:`, err.message);
    }
  }

  if (!collections.length) {
    return new Response(
      JSON.stringify({
        success: false,
        shop,
        error: "No collections found via HTML scraping.",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }
  storeCache.set(shop, {
    shop: finalDomain,
    collections,
    timestamp: Date.now(),
  });
  console.log("💾 Stored in cache:", shop);
  return new Response(
    JSON.stringify({
      success: true,
      shop: finalDomain,
      total: collections.length,
      collections,
      cached: false,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
