export const loader = async ({ request }) => {
  console.log("🟢 [START] Incoming request to /api/shop-info");

  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");
  console.log("🔍 Query param shop =", shop);

  if (!shop) {
    console.warn("⚠️ No shop provided in URL");
    return new Response(
      JSON.stringify({ success: false, error: "Enter a correct shop name" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Normalize input
  shop = shop.trim().toLowerCase();
  const looksLikeDomain = shop.includes(".") && !shop.endsWith(".");
  console.log("🧩 Looks like domain?", looksLikeDomain);

  // Possible URLs to try
  const possibleDomains = looksLikeDomain
    ? [`https://${shop}`]
    : [`https://${shop}.myshopify.com`, `https://${shop}.com`,`https://${shop}.in`];

  console.log("🌐 Will test these domains:", possibleDomains);

  let meta = {};
  let cart = {};
  let isShopify = false;
  let currency = null;
  let finalDomain = null;

  const commonHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json,text/html,application/xhtml+xml",
  };

  // Try all domains one by one until we get valid response
  for (const baseUrl of possibleDomains) {
    console.log("\n==============================");
    console.log("🌍 Trying base URL:", baseUrl);
    console.log("==============================");

    try {
      // 1️⃣ meta.json
      console.log("📡 Fetching meta.json...");
      const metaRes = await fetch(`${baseUrl}/meta.json`, { headers: commonHeaders });
      console.log("📊 meta.json status =", metaRes.status);

      if (metaRes.ok) {
        meta = await metaRes.json();
        console.log("✅ meta.json data =", meta);
      }

      // 2️⃣ cart.js
      console.log("📡 Fetching cart.js...");
      const cartRes = await fetch(`${baseUrl}/cart.js`, { headers: commonHeaders });
      console.log("📊 cart.js status =", cartRes.status);

      if (cartRes.ok) {
        cart = await cartRes.json();
        console.log("✅ cart.js data =", cart);

        if (cart.token) {
          isShopify = true;
          currency = cart.currency || "N/A";
          finalDomain = baseUrl;
          console.log("🟩 Shopify store confirmed via cart.js");
          break;
        }
      }

      // 3️⃣ products.json fallback
      if (!isShopify) {
        console.log("📡 Trying products.json as fallback...");
        const productRes = await fetch(`${baseUrl}/products.json`, { headers: commonHeaders });
        console.log("📊 products.json status =", productRes.status);

        if (productRes.ok) {
          const data = await productRes.json();
          if (data.products?.length) {
            isShopify = true;
            finalDomain = baseUrl;
            console.log("🟩 Shopify detected via products.json");
            break;
          }
        }
      }

      // 4️⃣ homepage HTML fallback
      if (!isShopify) {
        console.log("📡 Checking homepage for Shopify assets...");
        const homeRes = await fetch(baseUrl, { headers: commonHeaders });
        console.log("📊 homepage status =", homeRes.status);

        if (homeRes.ok) {
          const html = await homeRes.text();
          if (html.includes("cdn.shopify.com") || html.includes("Shopify.theme")) {
            isShopify = true;
            finalDomain = baseUrl;
            console.log("🟩 Shopify detected via homepage HTML");
            break;
          }
        }
      }
    } catch (err) {
      console.error("💥 Error while checking domain:", baseUrl, err.message);
    }
  }

  if (!finalDomain) {
    console.warn("❌ No valid Shopify domain found for", shop);
  }

  const responseData = {
    success: true,
    shop: finalDomain || shop,
    isShopify,
    currency,
    meta,
  };

  console.log("📦 [FINAL] Response data =", responseData);
  console.log("🔚 [END] Loader complete\n-------------------------------------");

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
