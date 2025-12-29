import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getOrCreateUser } from "../utils/getUser.server";
import prisma from "../db.server";
import { useState } from "react";
// for manual description
function ReadMoreText({ text, limit = 90 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = expanded ? text : text.slice(0, limit);

  return (
    <s-text tone="subdued">
      {displayText}
      {isLong && !expanded && "... "}
      {isLong && (
        <span
          style={{
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: 500,
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? " Read less" : " Read more"}
        </span>
      )}
    </s-text>
  );
}
// for shopify descirption
function descManage(html=''){
return html.replace(/<[^>]+>/g, "")
}
// AI boosteed 
function IsAiBoosted(){
  return(
    <>
    <div
    style={{
      position:'absolute',
      top:'10px',
      left:'10px',
      background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
      color:'white',
      fontSize:'12px',
      fontWeight:600,
      padding:'4px 8px',
      borderRadius:'999px',
      display:'flex',
      alignItems:'center',
      gap:'4px',
       boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}
    >
✨ AI Boosted
    </div>
    </>
  )
}
export const loader = async ({ request }) => {
  // ✅ Shopify auth (this already knows the shop)
  const { session } = await authenticate.admin(request);

  const shop = session.shop; // ✅ SAFE & GUARANTEED

  const user = await getOrCreateUser(shop);

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  // 🔹 Shopify products
  let shopifyProducts = [];
  try {
    const res = await fetch(`https://${shop}/products.json?limit=50`, {
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
      },
    });

    const data = await res.json();

    shopifyProducts =
      data.products?.map((p) => ({
        id: `shopify-${p.id}`,
        title: p.title,
        description: p.body_html,
        price: p.variants?.[0]?.price || "N/A",
        image:
          p.images?.[0]?.src ||
          "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
        source: "shopify",
      })) || [];
  } catch (err) {
    console.log("Shopify fetch failed", err);
  }

  return { shop, products, shopifyProducts };
};

export default function Profile() {
  const navigate = useNavigate();
  const { shop, products, shopifyProducts } = useLoaderData();
  const cleanShop = shop.replace(".myshopify.com", "");
  const [activetabs, setactivetabs] = useState("manual");
  return (
    <>
      <s-page title="Your Profile">
        {/* Profile header */}
        <s-card padding="loose" background="surface">
          <s-stack alignment="space-between">
            <s-text varient="headingLg" gap="extraTight">
              ShopName:{cleanShop}
            </s-text>
            <s-text tone="subdued">
              Manual products:<strong>{products.length}</strong> |Shopify:
              <strong>{shopifyProducts.length}</strong>
            </s-text>
          </s-stack>
          <s-button variant="primary" onClick={() => navigate("/add-product")}>
            ➕ Add Product
          </s-button>
        </s-card>
        {/* Empty state */}
        {activetabs === "shopify" && shopifyProducts.length === 0 && (
          <>
            <s-card padding="loose" background="subdued">
              <s-text>No Shopify products found.</s-text>
              <s-text tone="subdued">
                Make sure your store has published products.
              </s-text>
            </s-card>
          </>
        )}
        {products.length === 0 && (
          <>
            <s-card
              padding="loose"
              background="subdued"
              style={{ marginTop: "1.5rem" }}
            >
              <s-stack direction="vertical" alignment="center" gap="loose">
                <s-text variant="headingMd">
                  You haven't added any products yet
                </s-text>
                <s-text tone="subdued">
                  Add your product and compare it with top Shopify stores
                </s-text>
                <s-button
                  variant="primary"
                  onClick={() => navigate("/add-product")}
                >
                  Add your first product
                </s-button>
              </s-stack>
            </s-card>
          </>
        )}
        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "1.2rem",
          }}
        >
          {products.map((p) => (
            <>
              <s-card
                key={p.id}
                padding="loose"
                shadow="base"
                borderRadius="large"
                style={{ transition: "transform .2s" }}
              >
                <div style={{position:'relative'}}>
                  {p.isBoosted && <IsAiBoosted/>}
                  <img
                  src={p.image}
                  alt={p.title}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "0.8rem",
                  }}
                /></div>
                <s-stack direction="vertical" gap='extraTight'>
                  <s-text varient="headingSm">Title:{p.title}</s-text>
                  <s-text tone="subdued">Price:₹ {p.price}</s-text>
                  <ReadMoreText text={p.description}/>
                </s-stack>
              </s-card>
              <div
                style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem" }}
              ></div>
            </>
          ))}
          {shopifyProducts.length > 0 && (
            <>
              <s-text variant="headingMd" style={{ marginTop: "2rem" }}>
                🛍 Shopify Store Products
              </s-text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(220px,2fr))",
                  gap: "1.2rem",
                  marginTop: "1rem",
                }}
              >
                {shopifyProducts.map((p) => (
                  <s-card key={p.id} padding="loose">
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "0.8rem",
                      }}
                    />
                    <s-text variant="headingSm">
                      Title:<strong>{p.title}</strong>
                    </s-text>
                    <ReadMoreText text={descManage(p.description)}/>
                    <s-text tone="subdued">
                      Price:<strong>₹ {p.price}</strong>
                    </s-text>
                  </s-card>
                ))}
              </div>
            </>
          )}
        </div>
        <s-button size="slim" variant="primary" onClick={() => navigate(-1)}>
          back
        </s-button>
      </s-page>
    </>
  );
}
export const headers = (headersArgs) => boundary.headers(headersArgs);
