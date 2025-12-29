import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// ------------------------
// Loader
// ------------------------
export const loader = async ({ request, params }) => {
  const { shopName } = params;
  await authenticate.admin(request);

  if (!shopName) return { error: "No store name provided" };

  try {
    const url = new URL(request.url);
    const backendUrl = `${url.origin}/api/shop-info?shop=${shopName}`;
    const res = await fetch(backendUrl);
    const data = await res.json();

    if (!data.success) return { error: data.error || "Failed to fetch info" };

    const store = {
      shop: data.shop || shopName,
      domain: data.domain || "Unknown",
      isShopify: data.isShopify || false,
      currency: data.currency || "N/A",
      meta: data.meta || {},
    };

    return { shopName, store };
  } catch {
    return { error: "Failed to fetch store details. Please try again later." };
  }
};

// ------------------------
// Component
// ------------------------
export default function StoreDetails() {
  const data = useLoaderData();
  const { shopName, store, error } = data || {};
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const fadeStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  };

  const handleGoBack = () => navigate("/search");

  if (error)
    return (
      <s-page title="Store Not Found 😢" subtitle="We couldn’t locate that store.">
        <s-section>
          <s-card borderRadius="large" padding="loose" background="subdued">
            <s-text variant="bodyLg" alignment="center">{error}</s-text>
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <s-button variant="primary" onClick={handleGoBack}>
                🔙 Go Back
              </s-button>
            </div>
          </s-card>
        </s-section>
      </s-page>
    );

  if (!store)
    return (
      <s-page title="Loading..." subtitle="Fetching store details...">
        <s-section>
          <s-card borderRadius="large" padding="loose" background="subdued">
            <s-text alignment="center">Please wait...</s-text>
          </s-card>
        </s-section>
      </s-page>
    );

  // 🧩 Layout for vertical details
  const infoStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    marginTop: "1rem",
    width: "100%",
  };

  const fieldLabel = { fontWeight: 600, color: "#333" };

  return (
    <s-page title={`Store: ${shopName}`} subtitle="Competitor store details">
      <div style={fadeStyle}>
        <s-section>
          <s-card borderRadius="large" padding="extraLoose" background="surface">
            <s-stack direction="vertical" gap="base" alignment="center">
              <s-text variant="headingLg" alignment="center">
                🏪 {store.meta?.name || shopName}
              </s-text>
              <s-text variant="subdued" alignment="center">
                {store.meta?.description || "No description available"}
              </s-text>

              <s-divider />

              <div style={infoStyle}>
                <s-text variant="bodyLg">
                  <span style={fieldLabel}>🌐 Domain:</span> {store.meta?.domain || store.domain}
                </s-text>
                <s-text variant="bodyLg">
                  <span style={fieldLabel}>🛍 Shopify Domain:</span> {store.meta?.myshopify_domain || "N/A"}
                </s-text>
                <s-text variant="bodyLg">
                  <span style={fieldLabel}>💰 Currency:</span> {store.currency}
                </s-text>
                <s-text variant="bodyLg">
                  <span style={fieldLabel}>📍 Location:</span>{" "}
                  {`${store.meta?.city || "Unknown"}, ${store.meta?.province || ""}, ${store.meta?.country || ""}`}
                </s-text>
                <s-text variant="bodyLg">
                  <span style={fieldLabel}>🧾 Published Products:</span> {store.meta?.published_products_count || 0}
                </s-text>
                <s-text variant="bodyLg">
                  <span style={fieldLabel}>🗂 Collections:</span> {store.meta?.published_collections_count || 0}
                </s-text>
              </div>
<div className="flex justify-center mt-6">
<s-button variant="primary" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition" onClick={() => navigate(`/products/${shopName}`)}>
  🛍 See Products
</s-button>

      </div>
              <s-divider />
            </s-stack>
          </s-card>
        </s-section>
        <s-section>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <s-button variant="secondary" onClick={handleGoBack}>
              🔙 Back to Search
            </s-button>
          </div>
        </s-section>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
