import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import user from '../assets/user_avatar.jpeg'
export default function SearchStore() {
  const [shopName, setShopName] = useState("");
  const [shopA, setshopA] = useState("");
  const [shopB, setshopB] = useState("");
  const [loading, setLoading] = useState(false);
  const [laoding2, setloading2] = useState(false);
  const [loading3, setloading3] = useState(false);
  const [profileopen, setprofileopen] = useState(false);
  const navigate = useNavigate();

  let shopify;
  try {
    shopify = useAppBridge();
  } catch {
    shopify = { toast: { show: (msg) => alert(msg) } };
  }
  if (loading) {
    return (
      <>
        <s-page title="Analyzing SEO...">
          <div className="loaderwrapper">
            <div class="loader">
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__ball"></div>
              <s-text>Analyzing the seo.....</s-text>
            </div>
          </div>
          <style>
            {`
            .loaderwrapper{
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:65vh;
            }
.loader {
  position: relative;
  width: 100px;
  height: 120px;
}

.loader__bar {
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 50%;
  background: rgb(0, 0, 0);
  transform-origin: center bottom;
  box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.loader__bar:nth-child(1) {
  left: 0px;
  transform: scale(1, 0.2);
  -webkit-animation: barUp1 4s infinite;
  animation: barUp1 4s infinite;
}

.loader__bar:nth-child(2) {
  left: 15px;
  transform: scale(1, 0.4);
  -webkit-animation: barUp2 4s infinite;
  animation: barUp2 4s infinite;
}

.loader__bar:nth-child(3) {
  left: 30px;
  transform: scale(1, 0.6);
  -webkit-animation: barUp3 4s infinite;
  animation: barUp3 4s infinite;
}

.loader__bar:nth-child(4) {
  left: 45px;
  transform: scale(1, 0.8);
  -webkit-animation: barUp4 4s infinite;
  animation: barUp4 4s infinite;
}

.loader__bar:nth-child(5) {
  left: 60px;
  transform: scale(1, 1);
  -webkit-animation: barUp5 4s infinite;
  animation: barUp5 4s infinite;
}

.loader__ball {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 10px;
  height: 10px;
  background: rgb(44, 143, 255);
  border-radius: 50%;
  -webkit-animation: ball624 4s infinite;
  animation: ball624 4s infinite;
}

@keyframes ball624 {
  0% {
    transform: translate(0, 0);
  }

  5% {
    transform: translate(8px, -14px);
  }

  10% {
    transform: translate(15px, -10px);
  }

  17% {
    transform: translate(23px, -24px);
  }

  20% {
    transform: translate(30px, -20px);
  }

  27% {
    transform: translate(38px, -34px);
  }

  30% {
    transform: translate(45px, -30px);
  }

  37% {
    transform: translate(53px, -44px);
  }

  40% {
    transform: translate(60px, -40px);
  }

  50% {
    transform: translate(60px, 0);
  }

  57% {
    transform: translate(53px, -14px);
  }

  60% {
    transform: translate(45px, -10px);
  }

  67% {
    transform: translate(37px, -24px);
  }

  70% {
    transform: translate(30px, -20px);
  }

  77% {
    transform: translate(22px, -34px);
  }

  80% {
    transform: translate(15px, -30px);
  }

  87% {
    transform: translate(7px, -44px);
  }

  90% {
    transform: translate(0, -40px);
  }

  100% {
    transform: translate(0, 0);
  }
}

@-webkit-keyframes barUp1 {
  0% {
    transform: scale(1, 0.2);
  }

  40% {
    transform: scale(1, 0.2);
  }

  50% {
    transform: scale(1, 1);
  }

  90% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(1, 0.2);
  }
}

@keyframes barUp1 {
  0% {
    transform: scale(1, 0.2);
  }

  40% {
    transform: scale(1, 0.2);
  }

  50% {
    transform: scale(1, 1);
  }

  90% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(1, 0.2);
  }
}

@-webkit-keyframes barUp2 {
  0% {
    transform: scale(1, 0.4);
  }

  40% {
    transform: scale(1, 0.4);
  }

  50% {
    transform: scale(1, 0.8);
  }

  90% {
    transform: scale(1, 0.8);
  }

  100% {
    transform: scale(1, 0.4);
  }
}

@keyframes barUp2 {
  0% {
    transform: scale(1, 0.4);
  }

  40% {
    transform: scale(1, 0.4);
  }

  50% {
    transform: scale(1, 0.8);
  }

  90% {
    transform: scale(1, 0.8);
  }

  100% {
    transform: scale(1, 0.4);
  }
}

@-webkit-keyframes barUp3 {
  0% {
    transform: scale(1, 0.6);
  }

  100% {
    transform: scale(1, 0.6);
  }
}

@keyframes barUp3 {
  0% {
    transform: scale(1, 0.6);
  }

  100% {
    transform: scale(1, 0.6);
  }
}

@-webkit-keyframes barUp4 {
  0% {
    transform: scale(1, 0.8);
  }

  40% {
    transform: scale(1, 0.8);
  }

  50% {
    transform: scale(1, 0.4);
  }

  90% {
    transform: scale(1, 0.4);
  }

  100% {
    transform: scale(1, 0.8);
  }
}

@keyframes barUp4 {
  0% {
    transform: scale(1, 0.8);
  }

  40% {
    transform: scale(1, 0.8);
  }

  50% {
    transform: scale(1, 0.4);
  }

  90% {
    transform: scale(1, 0.4);
  }

  100% {
    transform: scale(1, 0.8);
  }
}

@-webkit-keyframes barUp5 {
  0% {
    transform: scale(1, 1);
  }

  40% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1, 0.2);
  }

  90% {
    transform: scale(1, 0.2);
  }

  100% {
    transform: scale(1, 1);
  }
}

@keyframes barUp5 {
  0% {
    transform: scale(1, 1);
  }

  40% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1, 0.2);
  }

  90% {
    transform: scale(1, 0.2);
  }

  100% {
    transform: scale(1, 1);
  }
}
    `}
          </style>
        </s-page>
      </>
    );
  }
  // secong loading animation for collections
  if (laoding2) {
    return (
      <>
        <s-page title="Showing up collections">
          <div className="loaderwrapper">
            <div class="loader">
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__ball"></div>
              <s-text>Showing up collections....</s-text>
            </div>
          </div>
          <style>
            {`
            .loaderwrapper{
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:65vh;
            }
.loader {
  position: relative;
  width: 100px;
  height: 120px;
}

.loader__bar {
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 50%;
  background: rgb(0, 0, 0);
  transform-origin: center bottom;
  box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.loader__bar:nth-child(1) {
  left: 0px;
  transform: scale(1, 0.2);
  -webkit-animation: barUp1 4s infinite;
  animation: barUp1 4s infinite;
}

.loader__bar:nth-child(2) {
  left: 15px;
  transform: scale(1, 0.4);
  -webkit-animation: barUp2 4s infinite;
  animation: barUp2 4s infinite;
}

.loader__bar:nth-child(3) {
  left: 30px;
  transform: scale(1, 0.6);
  -webkit-animation: barUp3 4s infinite;
  animation: barUp3 4s infinite;
}

.loader__bar:nth-child(4) {
  left: 45px;
  transform: scale(1, 0.8);
  -webkit-animation: barUp4 4s infinite;
  animation: barUp4 4s infinite;
}

.loader__bar:nth-child(5) {
  left: 60px;
  transform: scale(1, 1);
  -webkit-animation: barUp5 4s infinite;
  animation: barUp5 4s infinite;
}

.loader__ball {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 10px;
  height: 10px;
  background: rgb(44, 143, 255);
  border-radius: 50%;
  -webkit-animation: ball624 4s infinite;
  animation: ball624 4s infinite;
}

@keyframes ball624 {
  0% {
    transform: translate(0, 0);
  }

  5% {
    transform: translate(8px, -14px);
  }

  10% {
    transform: translate(15px, -10px);
  }

  17% {
    transform: translate(23px, -24px);
  }

  20% {
    transform: translate(30px, -20px);
  }

  27% {
    transform: translate(38px, -34px);
  }

  30% {
    transform: translate(45px, -30px);
  }

  37% {
    transform: translate(53px, -44px);
  }

  40% {
    transform: translate(60px, -40px);
  }

  50% {
    transform: translate(60px, 0);
  }

  57% {
    transform: translate(53px, -14px);
  }

  60% {
    transform: translate(45px, -10px);
  }

  67% {
    transform: translate(37px, -24px);
  }

  70% {
    transform: translate(30px, -20px);
  }

  77% {
    transform: translate(22px, -34px);
  }

  80% {
    transform: translate(15px, -30px);
  }

  87% {
    transform: translate(7px, -44px);
  }

  90% {
    transform: translate(0, -40px);
  }

  100% {
    transform: translate(0, 0);
  }
}

@-webkit-keyframes barUp1 {
  0% {
    transform: scale(1, 0.2);
  }

  40% {
    transform: scale(1, 0.2);
  }

  50% {
    transform: scale(1, 1);
  }

  90% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(1, 0.2);
  }
}

@keyframes barUp1 {
  0% {
    transform: scale(1, 0.2);
  }

  40% {
    transform: scale(1, 0.2);
  }

  50% {
    transform: scale(1, 1);
  }

  90% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(1, 0.2);
  }
}

@-webkit-keyframes barUp2 {
  0% {
    transform: scale(1, 0.4);
  }

  40% {
    transform: scale(1, 0.4);
  }

  50% {
    transform: scale(1, 0.8);
  }

  90% {
    transform: scale(1, 0.8);
  }

  100% {
    transform: scale(1, 0.4);
  }
}

@keyframes barUp2 {
  0% {
    transform: scale(1, 0.4);
  }

  40% {
    transform: scale(1, 0.4);
  }

  50% {
    transform: scale(1, 0.8);
  }

  90% {
    transform: scale(1, 0.8);
  }

  100% {
    transform: scale(1, 0.4);
  }
}

@-webkit-keyframes barUp3 {
  0% {
    transform: scale(1, 0.6);
  }

  100% {
    transform: scale(1, 0.6);
  }
}

@keyframes barUp3 {
  0% {
    transform: scale(1, 0.6);
  }

  100% {
    transform: scale(1, 0.6);
  }
}

@-webkit-keyframes barUp4 {
  0% {
    transform: scale(1, 0.8);
  }

  40% {
    transform: scale(1, 0.8);
  }

  50% {
    transform: scale(1, 0.4);
  }

  90% {
    transform: scale(1, 0.4);
  }

  100% {
    transform: scale(1, 0.8);
  }
}

@keyframes barUp4 {
  0% {
    transform: scale(1, 0.8);
  }

  40% {
    transform: scale(1, 0.8);
  }

  50% {
    transform: scale(1, 0.4);
  }

  90% {
    transform: scale(1, 0.4);
  }

  100% {
    transform: scale(1, 0.8);
  }
}

@-webkit-keyframes barUp5 {
  0% {
    transform: scale(1, 1);
  }

  40% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1, 0.2);
  }

  90% {
    transform: scale(1, 0.2);
  }

  100% {
    transform: scale(1, 1);
  }
}

@keyframes barUp5 {
  0% {
    transform: scale(1, 1);
  }

  40% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1, 0.2);
  }

  90% {
    transform: scale(1, 0.2);
  }

  100% {
    transform: scale(1, 1);
  }
}
    `}
          </style>
        </s-page>
      </>
    );
  }
  if (loading3) {
    return (
      <>
        <div className="loaderwrapper">
          <div class="card">
            <div class="loader">
              <p>Comparing</p>
              <div class="words">
                <span class="word">Products..</span>
                <span class="word">Avg Price..</span>
                <span class="word">Total products..</span>
                <span class="word">Finding best one..</span>
                <span class="word">Analyzing both..</span>
              </div>
            </div>
          </div>
        </div>
        <style>
          {`
            .loaderwrapper{
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:65vh;
            }
.card {
  --bg-color: #111;
  background-color: var(--bg-color);
  padding: 1rem 2rem;
  border-radius: 1.25rem;
}
.loader {
  color: rgb(124, 124, 124);
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  font-size: 25px;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  height: 40px;
  padding: 10px 10px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  border-radius: 8px;
}

.words {
  overflow: hidden;
  position: relative;
}
.words::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    var(--bg-color) 10%,
    transparent 30%,
    transparent 70%,
    var(--bg-color) 90%
  );
  z-index: 20;
}

.word {
  display: block;
  height: 100%;
  padding-left: 6px;
  color: #956afa;
  animation: spin_4991 4s infinite;
}

@keyframes spin_4991 {
  10% {
    -webkit-transform: translateY(-102%);
    transform: translateY(-102%);
  }

  25% {
    -webkit-transform: translateY(-100%);
    transform: translateY(-100%);
  }

  35% {
    -webkit-transform: translateY(-202%);
    transform: translateY(-202%);
  }

  50% {
    -webkit-transform: translateY(-200%);
    transform: translateY(-200%);
  }

  60% {
    -webkit-transform: translateY(-302%);
    transform: translateY(-302%);
  }

  75% {
    -webkit-transform: translateY(-300%);
    transform: translateY(-300%);
  }

  85% {
    -webkit-transform: translateY(-402%);
    transform: translateY(-402%);
  }

  100% {
    -webkit-transform: translateY(-400%);
    transform: translateY(-400%);
  }
}
            `}
        </style>
      </>
    );
  }
  return (
    <s-page
      title="Shop Search"
      subtitle="Quickly find details or compare Shopify stores"
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 50,
        }}
      >
        <s-button variant="tertiary" onClick={() => setprofileopen(true)}>
          <img style={{height:'50px', width:'50px',borderRadius:'50%'}} src={user} alt="User"/>
        </s-button>
      </div>
      <s-section>
        <s-card
          padding="loose"
          borderRadius="large"
          background="subdued"
          style={{
            maxWidth: "550px",
            margin: "0,auto",
          }}
        >
          <s-stack direction="vertical" gap="extraLoose" alignment="center">
            <s-text variant="headingLg" alignment="center">
              🔍 Search a Shopify Store
            </s-text>

            <div style={{ width: "100%", maxWidth: "400px" }}>
              <s-text-field
                label="Store name"
                value={shopName}
                onInput={(event) => setShopName(event.target.value)}
                placeholder="e.g. mystore"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.4fr 0.4fr",
                gap: "5px",
                width: "100%",
                maxWidth: "400px",
                marginTop: "10px",
              }}
            >
              <s-button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (!shopName.trim()) {
                    shopify.toast.show("Please enter a store name");
                    return;
                  }
                  console.log("Navigating to:", `/collections/${shopName}`);
                  setloading2(true);
                  setTimeout(() => {
                    navigate(`/collections/${shopName}`);
                  }, 5000);
                }}
              >
                🛍 View Collections
              </s-button>
              <s-button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (!shopName.trim()) {
                    shopify.toast.show("Please enter a store name");
                    return;
                  }
                  console.log("Navigating to:", `/seo-analysis/${shopName}`);
                  setLoading(true);
                  setTimeout(() => {
                    navigate(`/seo-analysis/${shopName}`);
                  }, 5000);
                }}
              >
                {loading ? "Analyzing..." : "Analyze Shop"}
              </s-button>
            </div>
          </s-stack>
        </s-card>
      </s-section>
      <s-section>
        <s-card padding="loose" borderRadius="large" shadow="base">
          <s-stack direction="vertical" gap="extraLoose" alignment="center">
            <s-text variant="headingLg" alignment="center">
              ⚔️ Compare Two Stores
            </s-text>

            <s-text variant="bodyMd" alignment="center" subdued>
              Enter two store names to compare collections, pricing & products.
            </s-text>

            <div style={{ width: "100%", maxWidth: "400px" }}>
              <s-text-field
                label="Store A"
                value={shopA}
                onInput={(e) => setshopA(e.target.value)}
                placeholder="e.g. fireboltt"
              />
            </div>

            <div style={{ width: "100%", maxWidth: "400px" }}>
              <s-text-field
                label="Store B"
                value={shopB}
                onInput={(e) => setshopB(e.target.value)}
                placeholder="e.g. campushoes"
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <s-button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (!shopA || !shopB) {
                    shopify.toast.show("Please enter both store names");
                    return;
                  }
                  setloading3(true);
                  setTimeout(() => {
                    navigate(`/compare-store/${shopA}/${shopB}`);
                  }, 5000);
                }}
              >
                🔥 Compare Stores →
              </s-button>
            </div>
          </s-stack>
        </s-card>
      </s-section>
      {profileopen&&(
        <>
        {/* Overlay */}
        <div
        onClick={()=>{setprofileopen(false)}}
        style={{
          position:'fixed',
          inset:0,
          background:'rgba(0, 0, 0, 0.35)',
          zIndex:99,
        }}
        />
        {/* Sidebar */}
        <div 
        style={{
          position:'fixed',
          top:0,
          right:0,
          height:'100vh',
          width:'240px',
          background:'#fff',
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          padding:'1.5rem',
          zIndex:100,
          display:'flex',
          flexDirection:'column',
          gap:'1rem',
        }}
onClick={()=>setprofileopen(false)}
        >
          <s-text variant="headingMd">👋 Your Account</s-text>
          <s-button
        variant="primary"
        fullWidth
        onClick={() => {
          setprofileopen(false);
          navigate("/user-profile");
        }}
      >
        📦 My Products
      </s-button>

      <s-button
        variant="secondary"
        fullWidth
        onClick={() => {
          setprofileopen(false);
          navigate("/user-profile");
        }}
      >
        👤 Profile
      </s-button>

      <div style={{ marginTop: "5px" }} >
        <s-button
          variant="secondary"
          fullWidth
          onClick={() => setprofileopen(false)}
        >
          Close
        </s-button>
        </div>
        </div>
        </>
      )}
    </s-page>
  );
}
