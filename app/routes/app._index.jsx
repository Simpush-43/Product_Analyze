import { useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const goToSearch = () => {
    shopify.toast.show("Let's analyze your competitors 🚀");
    navigate("/search");
  };

  return (
    <s-page>
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          paddingTop: "3rem",
        }}
      >
        {/* HERO SECTION */}
        <s-card padding="loose" background="subdued">
          <div
            style={{
              textAlign: "center",
            }}
          >
            <s-text
              variant="headingXl"
              alignment="center"
              style={{ fontSize: "2rem" }}
            >
              <strong>Compare & Boost Your Shopify Products with AI</strong>
            </s-text>
            <br />
            <s-text alignment="center" tone="subdued">
              Analyze competitor stores, compare your products, and generate
              SEO-optimized titles & descriptions that convert visitors into
              buyers.
            </s-text>
            <div style={{ marginTop: "1.5rem" }}>
              {" "}
              <s-button size="large" variant="primary" onClick={goToSearch}>
                🔍 Start Analyzing Stores
              </s-button>
            </div>
          </div>
        </s-card>
        {/* HOW IT WORKS */}
        <div style={{ marginTop: "2rem" }}>
          <s-layout>
            <s-layout-section>
              <s-card padding="loose">
                <s-stack direction="vertical" gap="tight">
                  <s-text variant="headingMd">1️⃣ Search a Store</s-text>
                  <s-text tone="subdued">
                    Enter any Shopify store URL to fetch its products instantly.
                  </s-text>
                </s-stack>
              </s-card>
            </s-layout-section>

            <s-layout-section>
              <s-card padding="loose">
                <s-stack direction="vertical" gap="tight">
                  <s-text variant="headingMd">2️⃣ Compare Products</s-text>
                  <s-text tone="subdued">
                    Compare competitor products with your own or store products.
                  </s-text>
                </s-stack>
              </s-card>
            </s-layout-section>

            <s-layout-section>
              <s-card padding="loose">
                <s-stack direction="vertical" gap="tight">
                  <s-text variant="headingMd">3️⃣ Boost with AI</s-text>
                  <s-text tone="subdued">
                    Generate high-converting SEO titles & descriptions using AI.
                  </s-text>
                </s-stack>
              </s-card>
            </s-layout-section>
          </s-layout>
        </div>

        {/* FOOTER CTA */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e1e3e5",
            textAlign: "center",
            color: "black",
            opacity: "0.74",
          }}
        >
          <s-text tone="subdued">
            Built for Shopify merchants who want higher rankings & conversions.
          </s-text>
          <br />
          <s-text variant="bodySm" tone="subdued">
            🔒 Secure · ⚡ Fast · 🤖 AI Powered
          </s-text>
          <br />
          <s-text variant="bodySm" tone="subdued" style={{ marginTop: "4px" }}>
            © {new Date().getFullYear()} Product Analyzer · Powered by AI
          </s-text>
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
