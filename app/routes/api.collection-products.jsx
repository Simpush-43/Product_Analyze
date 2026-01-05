import * as cheerio from "cheerio";
const productCache = new Map();
const CACHE_TLE = 1000 * 60 * 60 * 24;
export const loader = async ({ request }) => {
  console.log("🟢 [START] /api/scrape-products (Cheerio Scraper + Pagination)");

  const url = new URL(request.url);
  const collectionUrl = url.searchParams.get("collectionUrl");

  if (!collectionUrl) {
    return new Response(
      JSON.stringify({ success: false, error: "collectionUrl missing" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  console.log(`🕸️ Scraping products from → ${collectionUrl}`);
  // if cache load from cache memory
  const cacheKey = collectionUrl;
  if (productCache.has(cacheKey)) {
    const entry = productCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TLE) {
      console.log(`⚡ CACHE HIT (PRODUCTS) → ${collectionUrl}`);
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          total: entry.data.length,
          products: entry.data,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
  } else {
    console.log(`⏳ Cache expired → re-fetching products`);
  }
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml",
  };

  // 🧹 Clean text helper
  const cleanTxt = (t = "") =>
    t
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .trim();

  // 🚫 Garbage patterns filter
  const unwantedPatterns = [
    /quick\s*links/i,
    /subscribe/i,
    /contact\s*us/i,
    /added\s*successfully/i,
    /newsletter/i,
    /policy/i,
    /terms/i,
    /privacy/i,
    /ask the experts/i,
    /shipping/i,
    /private limited/i,
    /account/i,
    /our story/i,
    /podcast /i,
  ];
  const isGarbage = (text) =>
    unwantedPatterns.some((p) => p.test(text)) || text.length < 2;

  const base = new URL(collectionUrl).origin;
  const seen = new Set();
  const products = [];

  let page = 1;
  let hasNext = true;

  // 🌀 PAGINATION LOOP
  while (hasNext && page <= 20) {
    const pageUrl = `${collectionUrl}${collectionUrl.includes("?") ? "&" : "?"}page=${page}`;
    console.log(`📄 Scraping page ${page}: ${pageUrl}`);

    try {
      const res = await fetch(pageUrl, { headers });
      if (!res.ok) {
        console.warn(`⚠️ ${pageUrl} failed with ${res.status}`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // 🕸️ Selectors (same as your original — UNTOUCHED)
      $(
        ".grid-product, .product-card, .product-item, .product-block, .collection-grid-item, .collection-card, .grid__item, .collection-item, .collection-block, .template-list-collections,.ProductItem,.collection,li.wizzy-result-product,.wizzy-search-results,.product-list__inner ,.product-container,li.productgrid--item,li.grid__item,.product-list,.boost-sd__product-list,#gf-products,li.grid__item,.row ",
      ).each((i, el) => {
        if (i > 80) return; // limit for performance

        // 🔹 Title extraction
        let title = "";
        [
          ".product-title",
          ".grid-product__title",
          ".card__heading",
          ".collection-grid-item__title",
          ".collection-card__title",
          ".collection-title",
          ".collection-item__title",
          ".product-block__title",
          ".grid-view-item__title",
          ".ProductItem __Title",
          ".product-card__title",
          ".pro_title_cust",
          ".product-item-title",
          ".grid-product__type",
          ".productitem--title",
          ".card__heading",
          ".product-item__info-inner",
          '.boost-sd__product-title',
          ".t4s-product-title",
          ".card__heading",
        ].some((sel) => {
          const t = cleanTxt($(el).find(sel).first().text());
          if (t && !isGarbage(t)) {
            title = t;
            return true;
          }
        });

        // 🔹 Product link
        let link = $(el).find("a").attr("href") || "";
        if (link && !link.startsWith("http")) {
          link = base + link;
        }

        // 🔹 Product image
let image =
  $(el).find(".collection-image img").attr("src") ||
  $(el).find(".collection-image img").attr("data-src") ||
  $(el).find(".collection-image img").attr("data-srcset") ||
  $(el).find(".fs-product-main-image-wrapper img").attr("src") ||
  $(el).find(".fs-product-main-image-wrapper img").attr("data-src") ||
  $(el).find(".fs-product-main-image-wrapper img").attr("data-srcset") ||
  $(el).find(".result-product-item-image img").attr("src") ||
  $(el).find(".result-product-item-image img").attr("data-src") ||
  $(el).find(".result-product-item-image img").attr("data-srcset") ||
  $(el).find(".product-item__image-wrapper img").attr("src") ||
  $(el).find(".product-item__image-wrapper img").attr("data-src") ||
  $(el).find(".product-item__image-wrapper img").attr("data-srcset") ||
  $(el).find(".proimg img").attr("src") ||
  $(el).find(".proimg img").attr("data-src") ||
  $(el).find(".proimg img").attr("data-srcset") ||
  $(el).find(".rimage__image").attr("src") ||
  $(el).find(".rimage__image").attr("data-src") ||
  $(el).find(".rimage__image").attr("data-srcset") ||
  $(el).find(".rimage__image").attr("srcset") ||
  $(el).find(".product-block__image").attr("src") ||
  $(el).find(".product-block__image").attr("data-src") ||
  $(el).find(".product-block__image").attr("data-srcset") ||
  $(el).find(".ProductItem__Image").attr("src") ||
  $(el).find(".ProductItem__Image").attr("data-src") ||
  $(el).find(".ProductItem__Image").attr("data-srcset") ||
  $(el).find(".productitem--image img").attr("src") ||
  $(el).find(".productitem--image img").attr("data-src") ||
  $(el).find(".productitem--image img").attr("data-srcset") ||
  $(el).find(".product-card__image").attr("src") ||
  $(el).find(".product-card__image").attr("data-src") ||
  $(el).find(".product-card__image").attr("data-srcset") ||
  $(el).find(".product-item__primary-image").attr("data-srcset") ||
  $(el).find(".product-item__primary-image").attr("srcset") ||
  $(el).find("img").attr("src") ||
  $(el).find("img").attr("data-src") ||
  $(el).find("img").attr("data-srcset") ||
  $(el).find(".boost-sd__product-image img").attr("src") ||
  $(el).find(".boost-sd__product-image img").attr("data-src") ||
  $(el).find(".boost-sd__product-image img").attr("data-srcset") ||
  $(el).find(".t4s-product-img img").attr("src") ||
  $(el).find(".t4s-product-img img").attr("data-src") ||
  $(el).find(".t4s-product-img img").attr("data-srcset") ||
    $(el).find(".media img").attr("src") ||
  $(el).find(".media img").attr("data-src") ||
  $(el).find(".media img").attr("data-srcset") ||
  "";

// Helper for srcset
function extractFromSrcSet(srcset) {
  if (!srcset) return "";
  const first = srcset.split(",")[0].trim();
  return first.split(" ")[0].trim();
}

// 🔥 FIRST: handle srcset BEFORE normalization
if (image && image.includes("w")) {
  image = extractFromSrcSet(image);
}

// 🔥 THEN normalize URL
if (image?.startsWith("//")) image = "https:" + image;

if (image && !image.startsWith("http"))
  image = `${base}/${image.replace(/^\/+/, "")}`;

// Last fallback
if (!image)
  image =
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png";

        // 🔹 Price extraction
        let price = "";
        [
          ".price",
          ".collection-price",
          ".product-price",
          ".rte",
          ".product-block__price",
          ".ProductItem__Price",
          ".ProductItem__PriceList",
          ".f-price-item",
          ".grid-product__price--original",
          ".grid-product__price a",
          ".product-price__item",
          ".price-item",
          ".wizzy-product-item-price",
          ".price price--highlight",
          ".cvc-money",
          ".fs-price",
          ".money",
          ".price-item",
          ".price price--highlight",
          ".boost-sd__format-currency",
        ].some((sel) => {
          const p = cleanTxt($(el).find(sel).first().text());
          if (p && !isGarbage(p)) {
            price = p;
            return true;
          }
        });

        // 🔹 Description extraction (untouched logic)
        let description = "";
        const descSelectors = [
          ".collection-description",
          ".rte",
          ".collection-item__description",
          ".product-block__description",
          ".product-card__description",
          ".collapsible-content__inner .rte",
          ".grid-product__des",
          ".productitem--description p",
        ];

        for (const sel of descSelectors) {
          const plainText = cleanTxt($(el).find(sel).first().text());
          if (plainText && !isGarbage(plainText)) {
            description =
              plainText.length > 200
                ? plainText.slice(0, 200) + "..."
                : plainText;
            break;
          }
        }

        if (!description) {
          const possibleDesc = $(el)
            .find(
              "div[class*='desc'], section[class*='desc'], div[class*='pro'], div[class*='detail']",
            )
            .find("ul li")
            .map((i, li) => cleanTxt($(li).text()))
            .get()
            .filter((t) => t && !isGarbage(t));

          if (possibleDesc.length > 2) {
            description = possibleDesc.join(", ");
            if (description.length > 200)
              description = description.slice(0, 200) + "...";
          }
        }

        if (!description) {
          const genericSelectors = [
            ".product-features li",
            ".details-list li",
            "ul li",
            "p",
          ];
          for (const sel of genericSelectors) {
            const texts = $(el)
              .find(sel)
              .map((i, li) => cleanTxt($(li).text()))
              .get()
              .filter((t) => t && !isGarbage(t));

            if (texts.length > 2) {
              description = texts.join(", ");
              if (description.length > 200)
                description = description.slice(0, 200) + "...";
              break;
            }

            const plainText = cleanTxt($(el).find(sel).first().text());
            if (plainText && !isGarbage(plainText)) {
              description =
                plainText.length > 200
                  ? plainText.slice(0, 200) + "..."
                  : plainText;
              break;
            }
          }
        }

        if (!description) {
          const fallbackText = cleanTxt($(el).text());
          description =
            fallbackText.length > 200
              ? fallbackText.slice(0, 200) + "..."
              : fallbackText;
        }

        // 🔹 Rating extraction
        let Rating = "";
        [
          ".jdgm-prev-badge__text",
          ".opinew-stars-plugin-product-list span",
          ".product__card__reviews span",
          ".rating span",
          ".product-review__rating",
          ".card__badge",
          ".prapp-stars span",
        ].some((sel) => {
          const R = cleanTxt($(el).find(sel).first().text());
          if (R && !isGarbage(R)) {
            Rating = R.length > 180 ? R.slice(0, 177) + "..." : R;
            return true;
          }
        });

        // 🔹 Deduplication key
        const uniqueKey = link || `${title}-${image}`;
        if (seen.has(uniqueKey)) return;
        seen.add(uniqueKey);

        if (title && image && !isGarbage(title)) {
          products.push({ title, image, link, price, description, Rating });
        }
      });

      console.log(`✅ Page ${page} scraped → ${products.length} total so far`);

      // Check for next page
      const next = $("a[rel='next']").attr("href");
      if (!next) {
        console.log("🚫 No next page found, stopping pagination.");
        hasNext = false;
      } else {
        page++;
        await new Promise((r) => setTimeout(r, 1000)); // polite delay
      }
    } catch (err) {
      console.error(`💥 Error scraping page ${page}:`, err.message);
      break;
    }
  }

  if (!products.length) {
    return new Response(
      JSON.stringify({ success: false, error: "No products found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  console.log("✅ Scraped total:", products.length);
  console.log("🖼️ Example product:", products[0]);
  productCache.set(cacheKey, {
    timestamp: Date.now(),
    data: products,
  });
  console.log(`💾 Cached products for: ${collectionUrl}`);
  return new Response(
    JSON.stringify({ success: true, total: products.length, products }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
