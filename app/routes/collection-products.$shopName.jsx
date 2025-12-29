import { useLoaderData, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getOrCreateUser } from "../utils/getUser.server";
import prisma from "../db.server";
export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const collectionUrl = url.searchParams.get("collectionUrl");
  console.log("🧩 Frontend loader URL:", url.href);
  console.log("🧩 Extracted collectionUrl:", collectionUrl);

  if (!collectionUrl) return { error: "Collection URL missing" };

  const backendUrl = `${url.origin}/api/collection-products?collectionUrl=${encodeURIComponent(collectionUrl)}`;
  const res = await fetch(backendUrl);
  const data = await res.json();

  if (!data.success) return { error: data.error };

  const initialProducts =
    data.products?.map((p, i) => ({
      id: i,
      title: p.title,
      image: p.image,
      price: p.price,
      description: p.description,
      link: p.link,
      Rating: p.Rating,
    })) || [];
  // comparison products
  const shop = session.shop;
  const user = await getOrCreateUser(shop);

  const Userproducts = await prisma.product.findMany({
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
  } catch (error) {
    console.log("Shopify fetch failed", error);
  }
  return { collectionUrl, initialProducts, Userproducts, shopifyProducts };
};

export default function CollectionProducts() {
  const {
    collectionUrl,
    error,
    initialProducts,
    Userproducts,
    shopifyProducts,
  } = useLoaderData();
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [showCompareModal, setshowCompareModal] = useState(false);
  const [selectedScraped, setselectedScrap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Collection Products";
  }, []);

  if (error)
    return (
      <s-page title="Error ⚠️">
        <s-card padding="loose">
          <s-text>{error}</s-text>
        </s-card>
      </s-page>
    );
  const cardStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "#fff",
  };
  return (
    <s-page title="🛍️ Collection Products">
      <s-layout>
        <s-layout-section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem",
              marginTop: "1rem",
            }}
          >
            {products.map((p) => (
              <s-card
                key={p.id}
                padding="none"
                borderRadius="large"
                shadow="base"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {/* Product Image */}
                <div
                  style={{ width: "100%", height: "200px", overflow: "hidden" }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ padding: "1rem" }}>
                  <s-text variant="headingSm" truncate>
                    Title:{p.title}
                  </s-text>

                  <div style={{ margin: "0.5rem 0" }}>
                    {p.price && (
                      <s-text variant="bodyMd" tone="subdued">
                        💰Price: <strong>{p.price}</strong>
                      </s-text>
                    )}
                    {p.Rating && (
                      <s-text
                        variant="bodyMd"
                        tone="subdued"
                        style={{ display: "block" }}
                      >
                        🌟 Rating: {p.Rating}
                      </s-text>
                    )}
                  </div>

                  {p.description && (
                    <s-text
                      as="p"
                      variant="bodySm"
                      tone="subdued"
                      style={{
                        marginTop: "0.5rem",
                        lineHeight: "1.4",
                      }}
                    >
                      Description:
                      <strong>
                        {p.description.length > 100
                          ? `${p.description.slice(0, 100)}...`
                          : p.description}
                      </strong>
                    </s-text>
                  )}
                </div>

                {/* Product Link */}
                <div style={{ padding: "0 1rem 1rem" }}>
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    <s-button size="slim" fullWidth variant="secondary">
                      View Product →
                    </s-button>
                  </a>
                  <s-button
                    size="slim"
                    variant="primary"
                    onClick={() => {
                      setselectedScrap(p);
                      setshowCompareModal(true);
                    }}
                  >
                    Compare
                  </s-button>
                </div>
              </s-card>
            ))}
          </div>
        </s-layout-section>
      </s-layout>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <s-text>Loading more products...</s-text>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <s-button variant="secondary" onClick={() => navigate(-1)}>
          🔙 Back
        </s-button>
      </div>
      {showCompareModal && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <s-card
              style={{
                width: "780px",
                maxHeight: "85vh",
                overflow: "auto",
                padding: "20px",
                borderRadius: "16px",
              }}
            >
              <div
                style={{
                  background: "#111827",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  color: "white",
                  textAlign:'center'
                }}
              >
                Select your product to compare
              </div>
              {/* Manual product */}
              {Userproducts.length > 0 && (
                <> 
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "16px",
                      marginTop: "10px",
                    }}
                  >
                    {Userproducts.map((up) => (
                      <>
                        <div
                          key={up.id}
                          style={cardStyle}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 6px 16px rgba(0,0,0,0.12)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.boxShadow = "none")
                          }
                          onClick={() =>
                            navigate(
                              `/compare-product?user=${up.id}&type=manual&scraped=${encodeURIComponent(
                                selectedScraped.title || "",
                              )}`,
                            )
                          }
                        >
                          <img
                            src={up.image}
                            alt={up.title}
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              flexShrink: 0,
                            }}
                          />

                          {/* Content */}
                          <div style={{ flex: 1 }}>
                            <s-text variant="headingSm" truncate>
                              Title:<strong>{up.title}</strong>
                            </s-text>
                            <br />
                            <s-text tone="subdued" style={{ fontSize: "12px" }}>
                              Price:₹ {up.price}
                            </s-text>
                            <br />
                            <s-text
                              tone="subdued"
                              style={{
                                fontSize: "12px",
                                marginTop: "4px",
                                lineHeight: "1.3",
                              }}
                            >
                              Description:
                              <strong>
                                {up.description
                                  ? up.description
                                      .replace(/<[^>]+>/g, "")
                                      .slice(0, 60) + "..."
                                  : "No description"}
                              </strong>
                            </s-text>

                            {/* Badge */}
                            <span
                              style={{
                                display: "inline-block",
                                marginTop: "6px",
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                background: "#eef2ff",
                                color: "#3730a3",
                                fontWeight: 500,
                                position: "absolute",
                                right: "25px",
                                top: "50px",
                              }}
                            >
                              Manual
                            </span>
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                </>
              )}
              {/* Shopify products */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                  marginTop: "10px",
                }}
              >
                {shopifyProducts.map((sp) => (
                  <div
                    key={sp.id}
                    style={cardStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(0,0,0,0.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                    onClick={() =>
                      navigate(
                        `/compare-product?shopify=${sp.id}&type=shopify&scraped=${encodeURIComponent(
                          selectedScraped?.title || "",
                        )}`,
                      )
                    }
                  >
                    {/* Image */}
                    <img
                      src={sp.image}
                      alt={sp.title}
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        flexShrink: 0,
                      }}
                    />

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <s-text variant="headingSm" truncate>
                        Title:<strong>{sp.title}</strong>
                      </s-text>

                      <s-text tone="subdued" style={{ fontSize: "12px" }}>
                        Price:₹ {sp.price}
                      </s-text>

                      <s-text
                        tone="subdued"
                        style={{
                          fontSize: "12px",
                          marginTop: "4px",
                          lineHeight: "1.3",
                        }}
                      >
                        Description:
                        <strong>
                          {sp.description
                            ? sp.description
                                .replace(/<[^>]+>/g, "")
                                .slice(0, 60) + "..."
                            : "No description"}
                        </strong>
                      </s-text>

                      {/* Badge */}
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "6px",
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: "#eef2ff",
                          color: "#3730a3",
                          fontWeight: 500,
                          position: "absolute",
                          right: "25px",
                          top: "50px",
                        }}
                      >
                        Shopify
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  textAlign: "right",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s-button
                  variant="secondary"
                  onClick={() => setshowCompareModal(false)}
                >
                  Cancel
                </s-button>
              </div>
            </s-card>
          </div>
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
