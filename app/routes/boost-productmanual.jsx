import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (type==='manual') {
    const productIdraw = url.searchParams.get("productId");
    const productId = Number(productIdraw);
    if (isNaN(productId)) {
      throw new Response("Misiing Product id", { status: 400 });
    }
    const product = await prisma.Product.findUnique({
      where: { id: productId },
    });
    if (!product)
      throw new Response("Not found", {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    return { userProduct: product, source: "manual" };
  }
  throw new Response("Invalid boost type", { status: 400 });
};

export default function BoostProduct() {
  const navigate = useNavigate();
  const [boosted, setBoosted] = useState("");
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");
  const [saving, setsaving] = useState(false);
  const [success, setsuccess] = useState("");
  const { userProduct, source } = useLoaderData();
  useEffect(() => {
    async function boost() {
      setloading(true);
      seterror("");

      try {
        const res = await fetch("/api/boost-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProduct }),
        });

        const data = await res.json();

        if (!data.success) {
          seterror(data.error || "Boost failed");
          return;
        }

        setBoosted(data.boosted);
      } catch (err) {
        seterror("Something went wrong");
      } finally {
        setloading(false);
      }
    }

    boost();
  }, []);
  // helper function for parsing
  function parseBoostedText(text) {
    const titleMatch = text.match(/\*\*Title:\*\*\s*([\s\S]*?)\n/i);
    const descMatch = text.match(/\*\*Description:\*\*\s*([\s\S]*)/i);

    return {
      title: titleMatch?.[1]?.trim() || "",
      description: descMatch?.[1]?.trim() || "",
    };
  }

  // save boosted
  async function saveBoosted() {
    if (source !== "manual") return;

    const parsed = parseBoostedText(boosted);

    if (!parsed.title || !parsed.description) {
      seterror("Failed to parse boosted content");
      return;
    }

    if (!userProduct?.id) {
      seterror("Invalid product ID");
      return;
    }

    setsaving(true);
    seterror("");

    const res = await fetch("/api/save-boosted-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: userProduct.id,
        title: parsed.title,
        description: parsed.description,
      }),
    });

    const data = await res.json();
    setsaving(false);

    if (!data.success) {
      seterror(data.error || "Save failed");
      return;
    }

    setsuccess("✅ Boosted content saved successfully!");
  }

  return (
    <>
      <s-page title="AI Optimized Product">
        <s-card padding="loose">
          {loading ? (
            <s-text>Generating SEO optimized content....</s-text>
          ) : (
            <>
              <s-text varient="headingSm">New Title & Description</s-text>
              <s-text tone="subdued">
                {source === "shopify"
                  ? "This is an AI suggestion. You can manually copy it to Shopify."
                  : "You can save this directly to your product."}
              </s-text>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#f6f6f7",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginTop: "1rem",
                }}
              >
                {boosted}
              </pre>
              <div
                style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}
              >
                {source === "manual" ? (
                  <s-button
                    variant="primary"
                    loading={saving}
                    onClick={saveBoosted}
                  >
                    Save Boosted Version
                  </s-button>
                ) : (
                  <s-button
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(boosted)}
                  >
                    Copy to Clipboard
                  </s-button>
                )}
                {success ? (
                  <s-text tone="success" style={{ marginTop: "1rem" }}>
                    {success}
                  </s-text>
                ) : (
                  <s-text tone="success" style={{ marginTop: "1rem" }}>
                    {error}
                  </s-text>
                )}
                <s-button variant="secondary" onClick={() => navigate(-1)}>
                  Back
                </s-button>
              </div>
            </>
          )}
        </s-card>
      </s-page>
    </>
  );
}
export const headers = (headersArgs) => boundary.headers(headersArgs);
