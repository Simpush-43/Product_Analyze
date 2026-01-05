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
function descManage(html = "") {
  return html.replace(/<[^>]+>/g, "");
}
// AI boosteed
function IsAiBoosted() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "linear-gradient(135deg,#7c3aed,#2563eb)",
          color: "white",
          fontSize: "12px",
          fontWeight: 600,
          padding: "4px 8px",
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        ✨ AI Boosted
      </div>
    </>
  );
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
  // graphql side bar
  async function fetchProductsGraphQL(shop, accessToken) {
    const query = `
    {
      products(first: 50) {
        edges {
          node {
            id
            title
            descriptionHtml
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

    const res = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();

    return (
      json.data?.products?.edges.map(({ node }) => ({
        id: `shopify-${node.id.split("/").pop()}`,
        title: node.title,
        description: node.descriptionHtml || "",
        price: node.variants.edges[0]?.node.price || "N/A",
        image:
          node.images.edges[0]?.node.url ||
          "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
        source: "shopify",
      })) || []
    );
  }

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
    // fallback
    if (shopifyProducts.length === 0) {
      shopifyProducts = await fetchProductsGraphQL(shop, session.accessToken);
    }
  } catch (err) {
    console.log("REST failed → trying GraphQL", err);
    shopifyProducts = await fetchProductsGraphQL(shop, session.accessToken);
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
                <div style={{ position: "relative" }}>
                  {p.isBoosted && <IsAiBoosted />}
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
                </div>
                <s-stack direction="vertical" gap="extraTight">
                  <s-text varient="headingSm">Title:{p.title}</s-text>
                  <s-text tone="subdued">Price:₹ {p.price}</s-text>
                  <ReadMoreText text={p.description} />
                </s-stack>
              </s-card>
              <div
                style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem" }}
              ></div>
            </>
          ))}
          {shopifyProducts.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "1.4rem",
                }}
              >
                {shopifyProducts.map((p) => (
                  <s-card
                    key={p.id}
                    padding="none"
                    borderRadius="large"
                    shadow="base"
                    style={{
                      overflow: "hidden",
                      transition: "transform .2s, box-shadow .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(0,0,0,0.06)";
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative" }}>
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                        }}
                      />

                      {/* Shopify badge */}
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "#10b981",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}
                      >
                        🛍 Shopify
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "0.9rem" }}>
                      <s-text variant="headingSm" truncate>
                        {p.title}
                      </s-text>

                      <s-text
                        tone="subdued"
                        style={{
                          marginTop: "4px",
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        ₹ {p.price}
                      </s-text>

                      <div style={{ marginTop: "6px" }}>
                        <ReadMoreText text={descManage(p.description)} />
                      </div>
                    </div>
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
