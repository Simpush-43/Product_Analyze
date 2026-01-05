import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop");

  if (!shopParam) {
    throw new Response("Missing shop context", { status: 400 });
  }

  const { session } = await authenticate.admin(request);
  const type = url.searchParams.get("type");
  const userId = url.searchParams.get("user");
  const shopifyId = url.searchParams.get("shopify");
  const scrapedTitle = url.searchParams.get("scraped");
  // graphql
async function fetchSingleProductGraphQL(shop, accessToken, shopifyId) {
  const pureId = shopifyId.replace("shopify-", "");

  const query = `
    {
      product(id: "gid://shopify/Product/${pureId}") {
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
  `;

  const res = await fetch(
    `https://${shop}/admin/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  const text = await res.text();

  if (!res.ok || text.startsWith("<")) {
    console.error("Shopify GraphQL HTML response:", text.slice(0, 200));
    return null;
  }

  const json = JSON.parse(text);
  const p = json.data?.product;

  if (!p) return null;

  return {
    title: p.title,
    description: p.descriptionHtml || "",
    price: p.variants.edges[0]?.node.price || "N/A",
    image:
      p.images.edges[0]?.node.url ||
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
    source: "shopify-graphql",
  };
}


  if (!type || !scrapedTitle) {
    throw new Response("Missing comparison data", { status: 400 });
  }
  let userProduct = null;
  let productId = null;
  // Manual product
  if (type === "manual") {
    const product = await prisma.product.findUnique({
      where: { id: Number(userId) },
    });
    if (!product) {
      throw new Response("Product not found", { status: 404 });
    }
    userProduct = product;
    productId = product.id;
  }
  // graphql

  // Shopify product
if (type === "shopify") {
  userProduct = await fetchSingleProductGraphQL(
    session.shop,
    session.accessToken,
    shopifyId
  );
}

  return {
    userProduct,
    scrapedProduct: { title: scrapedTitle },
    productId,
    shopifyId,
    type,
  };
};

export default function CompareProduct() {
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState("");
  const { userProduct, scrapedProduct, productId, shopifyId, type } =
    useLoaderData();

  useEffect(() => {
    async function compare() {
      const res = await fetch("/api/compare-single-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProduct: {
            ...userProduct,
            isBoosted: userProduct.isBoosted || false,
          },
          scrapedProduct, // placeholder
        }),
      });

      const data = await res.json();
      setScore(data.score);
      setMessage(data.message);
    }

    compare();
  }, []);

  return (
    <s-page title="Product Comparison Results">
      <s-layout>
        <s-layout-section>
          <s-card padding="loose" background="subdued">
            {score === null ? (
              <s-stack alignment="center">
                <s-text>Analyzing product…</s-text>
              </s-stack>
            ) : (
              <>
                <s-stack direction="vertical" gap="loose">
                  {/* SCORE */}
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      borderRadius: "16px",
                      background:
                        score < 30
                          ? "#fee2e2"
                          : score < 40
                            ? "#fef3c7"
                            : "#dcfce7",
                    }}
                  >
                    <s-text variant="headingLg">Score:</s-text>
                    <div
                      style={{
                        fontSize: "56px",
                        fontWeight: 700,
                        marginTop: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: 500,
                        }}
                      >
                        {score}/100
                      </span>
                    </div>
                  </div>
                  <s-card padding="loose" background="subdued">
                    <s-text variant="bodyLg">{message}</s-text>
                  </s-card>
                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "flex",
                      gap: "1rem",
                    }}
                  >
                    <s-button
                      variant="primary"
                      disabled={!productId && !shopifyId}
                      onClick={() => {
                        if (type === "manual") {
                          navigate(`/boost-productmanual?type=manual&productId=${productId}`);
                        } else {
                          navigate(
                            `/boost-product?type=shopify&shopifyId=${shopifyId}`,
                          );
                        }
                      }}
                    >
                      🚀 Boost Product
                    </s-button>

                    <s-button variant="secondary" onClick={() => navigate(-1)}>
                      Back
                    </s-button>
                  </div>
                </s-stack>
              </>
            )}
          </s-card>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}

export const headers = (args) => boundary.headers(args);
