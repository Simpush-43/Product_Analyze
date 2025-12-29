import { useState } from "react";
import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setform] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/add-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error);
      return;
    }
  };
  return (
    <>
      <s-page title="Add Your Product">
        <s-card padding="loose">
          <s-text varient="headingSm">Enter product details</s-text>
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            <input
              placeholder="Product Title"
              value={form.title}
              onChange={(e) => setform({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Product Description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setform({ ...form, description: e.target.value })
              }
            />
            <input
              placeholder="Price"
              value={form.price}
              onChange={(e) => setform({ ...form, price: e.target.value })}
            />
            <input
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={(e) => setform({ ...form, image: e.target.value })}
            />
          </div>
          {error && (
            <>
              <s-text tone="critical" style={{ marginTop: "1rem" }}>
                {error}
              </s-text>
            </>
          )}
          <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
            <s-button variant="primary" loading={loading} onClick={submit}>
              Add Product →
            </s-button>
          </div>
        </s-card>
        <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
          <s-button
            variant="primary"
            loading={loading}
            onClick={() => navigate(-1)}
          >
            Go Back →
          </s-button>
        </div>
      </s-page>
    </>
  );
}
export const headers = (args) => boundary.headers(args);
