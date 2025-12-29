import { useLoaderData, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// 🔹 Simple helper to clean HTML from Shopify's body_html
function cleanDescription(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  return text.trim().length > 150
    ? text.trim().substring(0, 150) + "..."
    : text.trim();
}

export const loader = async ({ request, params }) => {
  const { shopName } = params;
  await authenticate.admin(request);
  if (!shopName) return { error: "No store name provided" };

  const url = new URL(request.url);
  const backendUrl = `${url.origin}/api/shop-collections?shop=${shopName}`;
  const res = await fetch(backendUrl);
  const data = await res.json();

  if (!data.success) return { error: data.error };

  const fetchCollections =
    data.collections?.map((c) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      description: cleanDescription(c.body_html),
      image:
        c.image ||
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
        link:c.link,
    })) || [];

  return { shopName, fetchCollections, nextSinceId: data.nextSinceId };
};

export default function StoreCollections() {
  const { shopName, error, fetchCollections, nextSinceId } = useLoaderData();
  const [collections, setCollections] = useState(fetchCollections || []);
  const [loading, setLoading] = useState(false);
  const [nextId, setNextId] = useState(nextSinceId);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        !loading &&
        nextId
      ) {
        setLoading(true);
        try {
          const res = await fetch(
            `/api/shop-collections?shop=${shopName}&since_id=${nextId}`
          );
          const data = await res.json();
          if (data.success && data.collections?.length) {
            const newCollections = data.collections.map((c) => ({
              id: c.id,
              title: c.title,
              handle: c.handle,
              link:c.link,
              description: cleanDescription(c.body_html),
              image:
                c.image?.src ||
                "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
            }));
            setCollections((prev) => [...prev, ...newCollections]);
            setNextId(data.nextSinceId);
          } else {
            setNextId(null);
          }
        } catch {
          console.error("Error fetching more collections");
        } finally {
          setLoading(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextId, loading, shopName]);

  if (error)
    return (
      <s-page title="Error ⚠️">
        <s-card padding="loose">
          <s-text>{error}</s-text>
        </s-card>
      </s-page>
    );

  return (
    <s-page title={`Collections — ${shopName}`}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {collections.map((c) => (
          <s-card key={c.id} padding="loose" borderRadius="large">
            <img
              src={c.image}
              alt={c.title}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
                marginBottom: "0.8rem",
              }}
            />
            <s-text variant="headingSm">{c.title}</s-text>
            {c.description && (
              <s-text
                as="p"
                variant="bodySm"
                tone="subdued"
                style={{ margin: "0.5rem 0" }}
              >
                {c.description}
              </s-text>
            )}
              <s-button size="slim" fullWidth variant="secondary" onClick={()=>navigate(`/collection-products/${shopName}?collectionUrl=${encodeURIComponent(c.link)}`)}>
                View Collection →
              </s-button>
          </s-card>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <s-text>Loading more collections...</s-text>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <s-button variant="secondary" onClick={() => navigate(-1)}>
          🔙 Back
        </s-button>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
