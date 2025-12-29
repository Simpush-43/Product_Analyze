import { useLoaderData, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }) => {
  const { shopName } = params;
  await authenticate.admin(request);
  if (!shopName) return { error: "No store name provided" };
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const backendUrl = `${url.origin}/api/shop-products?shop=${shopName}&page=${page}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    console.log("Backend response:", data);

    if (!data.success) return { error: data.error };
    const fetchProducts =
      data.products?.map((p) => ({
        id: p.id,
        images: p.images?.[0]?.src || "https://via.placeholder.com/300",
        title: p.title,
        price: p.variants?.[0]?.price || "N/A",
        handle: p.handle,
        description: p.body_html,
      })) || [];

    console.log("fetched products description are:", fetchProducts.description);
    return { shopName, fetchProducts, page };
  } catch {
    return { error: "Unable to fetch product list." };
  }
};

export default function StoreProducts() {
  const data = useLoaderData();
  const navigate = useNavigate();
  const { shopName, error, fetchProducts, page } = data || {};
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const fadeStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  };

  if (error)
    return (
      <s-page title="Error ⚠️">
        <s-card padding="loose" background="subdued">
          <s-text alignment="center">{error}</s-text>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <s-button variant="secondary" onClick={() => navigate(-1)}>
              🔙 Back
            </s-button>
          </div>
        </s-card>
      </s-page>
    );

  if (!fetchProducts)
    return (
      <s-page title="No Products Found 🛍">
        <s-card padding="loose" background="subdued">
          <s-text alignment="center">No products visible publicly.</s-text>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <s-button variant="secondary" onClick={() => navigate(-1)}>
              🔙 Back
            </s-button>
          </div>
        </s-card>
      </s-page>
    );

  return (
    <s-page title={`Products — ${shopName}`} subtitle={`Page ${page}`}>
      <div style={fadeStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {fetchProducts.map((p) => (
            <s-card
              key={p.id}
              padding="loose"
              background="surface"
              borderRadius="large"
            >
              <img
                src={p.images}
                alt={p.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginBottom: "0.8rem",
                }}
              />
              <s-text variant="headingSm">{p.title}</s-text>
              <s-text tone="subdued">💰 {p.price}</s-text>
              <a
                href={`https://${shopName}.myshopify.com/products/${p.handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <s-button size="slim" fullWidth variant="secondary">
                  View Product →
                </s-button>
              </a>
            </s-card>
          ))}
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <s-button
            variant="secondary"
            disabled={page === 1}
            onClick={() => navigate(`/products/${shopName}?page=${page - 1}`)}
          >
            ⬅ Prev
          </s-button>
          <s-text>Page {page}</s-text>
          <s-button
            variant="primary"
            onClick={() => navigate(`/products/${shopName}?page=${page + 1}`)}
          >
            Next ➡
          </s-button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <s-button variant="secondary" onClick={() => navigate(-1)}>
            🔙 Back to Store
          </s-button>

          <s-button
            variant="primary"
            onClick={() => navigate(`/collections/${shopName}`)}
          >
            🛍 View Collections
          </s-button>
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
