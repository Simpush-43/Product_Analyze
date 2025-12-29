import * as cheerio from "cheerio";
const compareCache = new Map();
const CACHE_TLE = 1000 * 60 * 60 * 24;
const HEADERS = {
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

// 🚫 Garbage pattern remover
const unwantedPatterns = [
  /quick\s*links/i,
  /subscribe/i,
  /contact\s*us/i,
  /added\s*successfully/i,
  /newsletter/i,
  /policy/i,
  /terms/i,
  /privacy/i,
];
const isGarbage = (txt) =>
  unwantedPatterns.some((p) => p.test(txt)) || txt.length < 2;

/* -----------------------------------------------------
   1️⃣ DOMAIN RESOLVER (Same as Search Collections logic)  
------------------------------------------------------*/
async function resolveDomain(store) {
  store = store
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "");

  const looksLikeDomain = store.includes(".");

  const guesses = looksLikeDomain
    ? [`https://${store}`]
    : [
        `https://${store}.myshopify.com`,
        `https://${store}.com`,
        `https://${store}.in`,
        `https://${store}.store`,
        `https://www.${store}.com`,
        `https://${store}.co`,
      ];

  for (const domain of guesses) {
    try {
      const head = await fetch(domain, { method: "HEAD" });
      if (head.ok) {
        console.log("✅ Domain resolved:", domain);
        return domain;
      }
    } catch {}
  }

  return null;
}

/* -----------------------------------------------------
   2️⃣ PRODUCT SCRAPER (Strong Multi-selector Extraction)
------------------------------------------------------*/
async function scrapeStore(store) {
  if (compareCache.has(store)) {
    const entry = compareCache.get(store);
    if (Date.now() - entry.timestamp < CACHE_TLE) {
      console.log(`⚡ CACHE HIT (COMPARE STORE) → ${store}`);
      return entry.data;
    } else {
      console.log(`⏳ Cache expired → Re-scraping store ${store}`);
    }
  }
  const resolved = await resolveDomain(store);
  if (!resolved) return null;

  const base = new URL(resolved).origin;
  const collUrl = `${base}/collections/all`;

  let page = 1;
  const products = [];
  const seen = new Set();

  while (page <= 5) {
    const pageUrl = `${collUrl}?page=${page}`;
    console.log("📄 Scraping:", pageUrl);

    let res;
    try {
      res = await fetch(pageUrl, { headers: HEADERS });
    } catch {
      break;
    }

    if (!res.ok) break;

    const html = await res.text();
    const $ = cheerio.load(html);

    const items = $(
      ".grid-product, .product-card, .product-item, .product-block, .collection-grid-item, .collection-card, .grid__item, .collection-item, .collection-block, .template-list-collections, .ProductItem, .collection, li.wizzy-result-product, .wizzy-search-results, .product-list__inner, .product-container",
    );

    if (!items.length) break;
    if (items.length === 0) {
      console.log(
        `🚫 Page ${page} has 0 items → stopping pagination for ${store}`,
      );
      break;
    }
    items.each((i, el) => {
      if (i > 80) return;

      // 🔹 TITLE extraction
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
        ".ProductItem__Title",
        ".product-card__title",
        ".pro_title_cust",
        ".product-item-title",
        ".grid-product__type",
        "h2",
        "h3",
      ].some((sel) => {
        const txt = cleanTxt($(el).find(sel).first().text());
        if (txt && !isGarbage(txt)) {
          title = txt;
          return true;
        }
      });

      // Title fallback from URL
      if (!title) {
        const href = $(el).find("a").attr("href");
        if (href) title = cleanTxt(href.split("/").pop().replace(/-/g, " "));
      }

      // 🔹 LINK extraction
      let link = $(el).find("a").attr("href") || "";
      if (link && !link.startsWith("http")) link = base + link;

      // 🔹 IMAGE extraction
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
        $(el).find(".product-card__image").attr("src") ||
        $(el).find(".product-card__image").attr("data-src") ||
        $(el).find(".product-card__image").attr("data-srcset") ||
        $(el).find("img").attr("src") ||
        $(el).find("img").attr("data-src") ||
        $(el).find("img").attr("data-srcset") ||
        "";

      if (image?.startsWith("//")) image = "https:" + image;
      if (image && !image.startsWith("http"))
        image = `${base}/${image.replace(/^\/+/, "")}`;

      if (!image)
        image =
          "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png";

      // 🔹 PRICE extraction
      let price = "";
      [
        ".price",
        ".product-price",
        ".price-item",
        ".price__regular",
        ".price__sale",
        ".money",
        ".ProductItem__Price",
        ".product-price__item",
        ".grid-product__price",
        ".fs-price",
      ].some((sel) => {
        const p = cleanTxt($(el).find(sel).first().text());
        if (p && !isGarbage(p)) {
          price = p;
          return true;
        }
      });

      if (!title || seen.has(title)) return;
      seen.add(title);

      products.push({ title, link, price, image });
    });

    page++;
    await new Promise((r) => setTimeout(r, 700));
  }
  compareCache.set(store, {
    timestamp: Date.now(),
    data: { base, products },
  });
  return { base, products };
}

/* -----------------------------------------------------
   3️⃣ COMPARE LOGIC
------------------------------------------------------*/
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const storeA = url.searchParams.get("shopA");
  const storeB = url.searchParams.get("shopB");

  if (!storeA || !storeB) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Please provide storeA and storeB",
      }),
      { status: 400 },
    );
  }

  console.log("🔍 Comparing stores:", storeA, "vs", storeB);

  const dataA = await scrapeStore(storeA);
  const dataB = await scrapeStore(storeB);

  if (!dataA || !dataB) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Could not resolve one or both stores",
      }),
      { status: 404 },
    );
  }

  const listA = dataA.products;
  const listB = dataB.products;

  // 🔹 AVG PRICE
  const avgPrice = (arr) => {
    const nums = arr
      .map((p) => parseFloat(p.price.replace(/[^0-9.]/g, "")))
      .filter((x) => !isNaN(x));
    if (!nums.length) return 0;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  };

  // 🔹 UNIQUE PRODUCTS
  const uniqueA = listA.filter(
    (p) => !listB.some((q) => q.title.toLowerCase() === p.title.toLowerCase()),
  );
  const uniqueB = listB.filter(
    (p) => !listA.some((q) => q.title.toLowerCase() === p.title.toLowerCase()),
  );

  return new Response(
    JSON.stringify({
      success: true,
      storeA: {
        domain: dataA.base,
        count: listA.length,
        avgPrice: avgPrice(listA),
        products: listA,
      },
      storeB: {
        domain: dataB.base,
        count: listB.length,
        avgPrice: avgPrice(listB),
        products: listB,
      },
      compare: {
        uniqueToA: uniqueA.length,
        uniqueToB: uniqueB.length,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
