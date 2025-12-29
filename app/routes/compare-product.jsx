import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const userId = url.searchParams.get("user");
  const shopifyId = url.searchParams.get("shopify");
  const scrapedTitle = url.searchParams.get("scraped");
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
  // Shopify product
  if (type === "shopify") {
    const res = await fetch(`https://${session.shop}/products.json`, {
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
      },
    });
    const data = await res.json();
    const sp = data.products.find((p) => `shopify-${p.id}` === shopifyId);
    if (sp) {
      userProduct = {
        title: sp.title,
        description: sp.body_html || "",
        price: sp.variants?.[0].price || "N/A",
      };
    }
  }
  if (!userProduct) {
    throw new Response("Product not found", { status: 404 });
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
          userProduct:{
            ...userProduct,
            isBoosted:userProduct.isBoosted || false,
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
                      disabled={!productId}
                      onClick={() => {
                        if (type === "manual") {
                          navigate(`/boost-product/${productId}`);
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
