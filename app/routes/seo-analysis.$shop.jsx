import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useNavigation } from "react-router";
import { useEffect, useState } from "react";
// Circular graphs
const CircleGraph = ({
  size = 120,
  stroke = 10,
  value = 75,
  color = "#4f46e5",
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="20"
          fill="#0f172a"
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
        >
          {Math.round(value)}%
        </text>
      </svg>
    </>
  );
};
export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const { shop } = params;
  console.log("💥 Params inside loader:", params);
  if (!shop) {
    return {
      success: false,
      error: "No shop provided",
    };
  }
  const url = new URL(request.url);
  const backend = `${url.origin}/api/seo-combined?shop=${shop}`;
  const res = await fetch(backend);
  const data = await res.json();
  return data;
};
export default function SeoAnalysis() {
  const data = useLoaderData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isloading = navigation.state === "loading";
  useEffect(() => {
    document.title = "SEO Analysis";
  }, []);
  if (!data.success) {
    return (
      <>
        <s-page title="SEO Error ⚠️">
          <s-card padding="loose">
            <s-text>{data.error || "Something went wrong"}</s-text>
          </s-card>
        </s-page>
      </>
    );
  }
  const { resolveDomain, pagespeed, onpage, indexing } = data;
  const perfScore = pagespeed?.performance ?? 0;
  const seoScore = pagespeed?.finalSEO ?? pagespeed.seo ?? 0;
  // SEO computed score
  const wordScore = Math.min((onpage?.wordCount / 1500) * 100, 100) || 0;
  const imageAltScore =
    onpage?.totalImages > 0
      ? 100 - (onpage?.imageWithoutAlt / onpage?.totalImages) * 100
      : 0;
  const structureScore = onpage?.hasSchemaOrg ? 100 : 40;
  const combinedSEOScore = Math.round(
    (seoScore + wordScore + imageAltScore + structureScore) / 4,
  );
  return (
    <>
      <s-page title="📊 SEO Analysis Dashboard">
        {/* animations */}
        <style>
          {`
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
          transition: width 0.8s ease;
        }
        .badgeSoft {
          font-size: 12px;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 999px;
          color: #64748b;
          display: inline-block;
        }
      `}
        </style>
        <s-layout>
          {/* HEADER CARD - Domain + Quick stats */}
          <s-layout-section>
            <div
              className="fadeIn"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <s-card
                padding="loose"
                borderRadius="large"
                className="hoverCard"
                style={{
                  backdropFilter: "blur(10px)",
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <s-text
                  variant="headingMd"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>🌐</span>
                  <span>{resolveDomain}</span>
                </s-text>
                <span className="badgeSoft" style={{ marginBottom: "12px" }}>
                  SEO Overview
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <CircleGraph
                      value={Math.round(perfScore) || 0}
                      color="#22c55e"
                      size={120}
                    />
                    <s-text variant="bodySm" tone="subdued">
                      Performance
                    </s-text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <CircleGraph
                      value={Math.round(seoScore) || 0}
                      color="#6366f1"
                      size={120}
                    />
                    <s-text variant="bodySm" tone="subdued">
                      SEO Score
                    </s-text>
                  </div>
                  <div>
                    <s-text variant="bodySm" tone="subdued">
                      Indexed Pages
                    </s-text>
                    <s-text variant="headingLg">
                      {indexing?.indexPages ?? "-"}
                    </s-text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <CircleGraph
                      value={combinedSEOScore}
                      color="#0ea5e9"
                      size={120}
                    />
                    <s-text tone="subdued">Advanced SEO Score</s-text>
                  </div>
                </div>
              </s-card>
            </div>
          </s-layout-section>
          {/* PAGESPEED SECTION */}
          <s-layout-section>
            <s-card
              padding="loose"
              borderRadius="large"
              className="hoverCard fadeIn"
              style={{
                background: "linear-gradient(180deg, #eef2ff, #f8fafc)",
                border: "1px solid #e2e8f0",
              }}
            >
              <s-text variant="headingMd">⚡ PageSpeed Insights</s-text>
              <div>
                <s-text>Performance</s-text>
                <div className="statBarContainer">
                  <div
                    className="statBar"
                    style={{
                      width: `${Math.min(perfScore, 100)}%`,
                      background: "#22c55e",
                    }}
                  />
                  <s-text tone="subdued" variant="bodySm">
                    Score:{Math.round(perfScore) || 0}
                  </s-text>
                </div>
                <div>
                  <s-text>SEO</s-text>
                  <div className="statBarContainer">
                    <div
                      className="statBar"
                      style={{
                        width: `${Math.min(seoScore, 100)}%`,
                        background: "#6366f1",
                      }}
                    />
                  </div>
                  <s-text tone="subdued" variant="bodySm">
                    Score:{Math.round(seoScore) || 0}
                  </s-text>
                </div>
                <div>
                  <s-text variant="bodySm" tone="subdued">
                    Core metrics
                  </s-text>
                  <s-text>
                    LCP:<strong>{pagespeed?.lcp || "-"}</strong>
                  </s-text>
                  <s-text>
                    CLS: <strong>{pagespeed?.cls || "-"}</strong>
                  </s-text>
                  <s-text>
                    INP/Interactive:<strong>{pagespeed?.inp || "-"}</strong>
                  </s-text>
                </div>
              </div>
            </s-card>
          </s-layout-section>
          {/* ON-PAGE SEO SECTION */}
          <s-layout-section>
            <s-card
              padding="loose"
              borderRadius="large"
              className="hoverCard fadeIn"
            >
              <s-text variant="headingMd">📝 On-page SEO</s-text>
              <div style={{ marginTop: "1rem" }}>
                <s-text variant="bodySm" tone="subdued">
                  Title
                </s-text>
                <s-text>{onpage?.title || "No title found"}</s-text>
              </div>
              <div style={{ marginTop: "0.8rem" }}>
                <s-text variant="bodySm" tone="subdued">
                  Meta description
                </s-text>
                <s-text>
                  {onpage?.metaDescription || "No meta description found"}
                </s-text>
              </div>
              <div style={{ marginTop: "0.8rem" }}>
                <s-text variant="bodySm" tone="subdued">
                  H1 tags
                </s-text>
                {onpage?.h1s.length ? (
                  <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
                    {onpage.h1s.slice(0, 3).map((h, i) => (
                      <li key={i}>
                        <s-text variant="bodySm">{h}</s-text>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <s-text>No H1 found</s-text>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                  marginTop: "1.2rem",
                }}
              >
                <div>
                  <s-text variant="bodySm" tone="subdued">
                    Approx. word count
                  </s-text>
                  <s-text>{onpage?.wordCount ?? "-"}</s-text>
                </div>
                <div>
                  <s-text variant="bodySm" tone="subdued">
                    Images (missing alt)
                  </s-text>
                  <s-text>
                    {onpage?.imageWithoutAlt ?? 0}/ {onpage?.totalImages ?? 0}
                  </s-text>
                </div>
                <div>
                  <s-text variant="bodySm" tone="subdued">
                    Structured data (schema.org)
                  </s-text>
                  <s-text>
                    {onpage.hasSchemaOrg ? "✅ Present" : "❌ Not detected"}
                  </s-text>
                </div>
              </div>
            </s-card>
          </s-layout-section>
          {/* INDEXING SECTION */}
          <s-layout-section>
            <s-card
              padding="loose"
              borderRadius="large"
              className="hoverCard fadeIn"
            >
              <s-text variant="headingMd">🔍 Indexing (Google)</s-text>
              <s-text variant="bodySm" tone="subdued" style={{ marginTop: 8 }}>
                Rough estimate using <code>site:</code> search.
              </s-text>
              <div style={{ marginTop: "1rem" }}>
                <s-text>
                  Indexed pages:{" "}
                  <strong>{indexing?.indexedPages ?? "Not available"}</strong>
                </s-text>
                {indexing?.host && (
                  <s-text tone="subdued" variant="bodySm">
                    Checked host:{indexing.host}
                  </s-text>
                )}
              </div>
            </s-card>
          </s-layout-section>
          {/* BACK BUTTON */}
          <s-layout-section>
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <s-button variant="secondary" onClick={() => navigate(-1)}>
                🔙 Back
              </s-button>
            </div>
          </s-layout-section>
        </s-layout>
      </s-page>
    </>
  );
}
export const headers = (args) => boundary.headers(args);
