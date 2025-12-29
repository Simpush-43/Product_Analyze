import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData ,useNavigate} from "react-router";
import { useEffect, useState } from "react";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const { shopA, shopB } = params;

  const url = new URL(request.url);
  const backend = `${url.origin}/api/compare-stores?shopA=${shopA}&shopB=${shopB}`;
  const res = await fetch(backend);
  return await res.json();
};

export default function CompareStores() {
  const data = useLoaderData();
  const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 200);
  }, []);

  if (!data.success) {
    return (
      <s-page title="Error ⚠️">
        <s-card padding="loose">
          <s-text>{data.error}</s-text>
        </s-card>
      </s-page>
    );
  }

  const A = data.storeA;
  const B = data.storeB;
  const C = data.compare;

  const winnerA = A.count > B.count;
  const priceWinnerA = parseFloat(A.avgPrice) < parseFloat(B.avgPrice);

  return (
    <s-page title="⚔️ Store Comparison Dashboard">
      {/* Animation CSS */}
      <style>{`
        .fadeIn {
          opacity: 0; 
          transform: translateY(20px);
          animation: fadeInUp 0.6s forwards;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .hoverCard {
          transition: 0.3s;
        }
        .hoverCard:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .bar {
          height: 6px;
          border-radius: 6px;
          transition: width 0.8s ease;
        }
          .countNum {
  display: inline-block;
  animation: popIn 0.6s ease;
}
@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
  .statBarContainer {
  background: #e2e8f0;
  border-radius: 12px;
  height: 10px;
  margin-top: 4px;
  overflow: hidden;
}
.statBar {
  height: 10px;
  border-radius: 12px;
  transition: width 1s ease;
}

      `}</style>

      <s-layout>
        {/* ------------------------------------
            🏪 Store Header Cards (animated)
        ------------------------------------ */}
        {/* STORE HEADER ULTRA PREMIUM VERSION */}
        <s-layout-section>
          <div
            className="fadeIn"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              { label: "Store A", data: A, icon: "🏬" },
              { label: "Store B", data: B, icon: "🏪" },
            ].map((store, idx) => (
              <s-card
                key={idx}
                padding="loose"
                borderRadius="large"
                className="hoverCard"
                style={{
                  backdropFilter: "blur(12px)",
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.4)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "26px" }}>{store.icon}</span>

                  <s-text variant="headingMd" style={{ fontWeight: 700 }}>
                    {store.data.domain}
                  </s-text>
                </div>

                <span
                  style={{
                    fontSize: "13px",
                    background: "linear-gradient(90deg, #a5b4fc, #c7d2fe)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontWeight: 500,
                    display: "inline-block",
                    color: "#1e1e1e",
                    marginBottom: "12px",
                  }}
                >
                  {store.label}
                </span>

                {/* Stats */}
                <div style={{ marginTop: "1rem" }}>
                  <s-text>
                    <strong className="countNum">{store.data.count}</strong>{" "}
                    products
                    {idx === 0 && A.count > B.count && (
                      <span style={{ color: "#008060" }}> • 🏆 More</span>
                    )}
                    {idx === 1 && B.count > A.count && (
                      <span style={{ color: "#008060" }}> • 🏆 More</span>
                    )}
                  </s-text>

                  <s-text>
                    Avg Price:{" "}
                    <strong className="countNum">{store.data.avgPrice}</strong>
                  </s-text>
                </div>
              </s-card>
            ))}
          </div>
        </s-layout-section>

        {/* ------------------------------------
            📊 Comparison Overview (Animated Bars)
        ------------------------------------ */}
        <s-layout-section>
          <s-card
            padding="loose"
            borderRadius="large"
            background="subdued"
            className="hoverCard fadeIn"
            style={{
              background: "linear-gradient(180deg, #eef2ff, #f8fafc)",
              border: "1px solid #e2e8f0",
            }}
          >
            <s-text variant="headingMd">📈 Detailed Comparison</s-text>

            <div style={{ marginTop: "1.2rem" }}>
              <s-text>Unique to A • {C.uniqueToA}</s-text>
              <div className="statBarContainer">
                <div
                  className="statBar"
                  style={{
                    width: `${Math.min(C.uniqueToA * 5, 100)}%`,
                    background: "#6366f1",
                  }}
                />
              </div>

              <s-text style={{ marginTop: "10px" }}>
                Unique to B • {C.uniqueToB}
              </s-text>
              <div className="statBarContainer">
                <div
                  className="statBar"
                  style={{
                    width: `${Math.min(C.uniqueToB * 5, 100)}%`,
                    background: "#22c55e",
                  }}
                />
              </div>
            </div>
          </s-card>
        </s-layout-section>

        {/* ------------------------------------
            Side-by-side stats cards 
        ------------------------------------ */}
        <s-layout-section>
          <div
            className="fadeIn"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <s-card padding="loose" borderRadius="large" className="hoverCard">
              <s-text variant="headingSm">Store A Products</s-text>
              <s-text tone="subdued">{A.count} total</s-text>
            </s-card>

            <s-card padding="loose" borderRadius="large" className="hoverCard">
              <s-text variant="headingSm">Store B Products</s-text>
              <s-text tone="subdued">{B.count} total</s-text>
            </s-card>
          </div>
        </s-layout-section>
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <s-button variant="secondary" onClick={() => navigate(-1)}>
          🔙 Back
        </s-button>
      </div>
      </s-layout>
    </s-page>
  );
}

export const headers = (args) => boundary.headers(args);
