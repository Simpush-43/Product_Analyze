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
  if (!shopName) return { fallback: true, reason: "missing_store" };

  const url = new URL(request.url);
  const backendUrl = `${url.origin}/api/shop-collections?shop=${shopName}`;
  try {
    const res = await fetch(backendUrl);
    const data = await res.json();

    if (!data.success)
      return { fallback: true, reason: "restricted", shopName };

    const fetchCollections =
      data.collections?.map((c) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        description: cleanDescription(c.body_html),
        image:
          c.image ||
          "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
        link: c.link,
      })) || [];

    return { shopName, fetchCollections, nextSinceId: data.nextSinceId };
  } catch (error) {
    return {
      fallback: true,
      reason: "security_blocked",
      shopName,
    };
  }
};

export default function StoreCollections() {
  const { shopName, error, fetchCollections, nextSinceId, fallback, reason } =
    useLoaderData();
  const [collections, setCollections] = useState(fetchCollections || []);
  const [loading, setLoading] = useState(false);
  const [nextId, setNextId] = useState(nextSinceId);
  const [reported, setReported] = useState(false);
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
            `/api/shop-collections?shop=${shopName}&since_id=${nextId}`,
          );
          const data = await res.json();
          if (data.success && data.collections?.length) {
            const newCollections = data.collections.map((c) => ({
              id: c.id,
              title: c.title,
              handle: c.handle,
              link: c.link,
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
  // handle to tackle report
  const handleReport = async () => {
    try {
      const res = await fetch("/api/report-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName }),
      });
      if (res.ok) {
        setReported(true);
      }
    } catch (error) {
      console.error("Error in reporting the store", error);
    }
  };
  return (
    <s-page title={`Collections — ${shopName}`}>
      {fallback ? (
        <s-card padding="loose" tone="critical">
          <s-text variant="headingSm">
            ⚠️ Unable to display data for this store
          </s-text>
          <br />
          <s-text tone="subdued" style={{ marginTop: "0.5rem" }}>
            This website does not allow external access to its collections or
            SEO data due to security restrictions.
          </s-text>
          <br />
          <s-text tone="subdued" style={{ marginTop: "0.5rem" }}>
            Store name: <strong>{shopName}</strong>
          </s-text>

          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <s-button
              variant="primary"
              disabled={reported}
              onClick={handleReport}
            >
              {reported ? "✅ Notified" : "Notify developer"}
            </s-button>

            <s-button variant="secondary" onClick={() => navigate(-1)}>
              Go back
            </s-button>
          </div>
          {reported && (
            <s-text tone="success" style={{ marginTop: "0.5rem" }}>
              Thanks! We'll try to support this store soon.
            </s-text>
          )}
        </s-card>
      ) : (
        <>
          {/* ✅ Normal collections UI */}
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
                <s-button
                  size="slim"
                  fullWidth
                  variant="secondary"
                  onClick={() =>
                    navigate(
                      `/collection-products/${shopName}?collectionUrl=${encodeURIComponent(
                        c.link,
                      )}`,
                    )
                  }
                >
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
        </>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
