export const action = async ({ request }) => {
  try {
    const body = await request.json();
    const { userProduct, scrapedProduct } = body;

    if (!userProduct || !scrapedProduct) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing products",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // -------------------------
    // BASIC SCORE FROM LENGTH
    // -------------------------
    const titleScore = Math.min(20, userProduct.title.length / 4);
    const descScore = Math.min(20, userProduct.description.length / 12);

    // -------------------------
    // COMPETITOR CHECK
    // -------------------------
    let competitorScore = 0;

    if (scrapedProduct?.title) {
      const userWords = userProduct.title.toLowerCase().split(" ");
      const compWords = scrapedProduct.title.toLowerCase().split(" ");

      const matches = userWords.filter((w) => compWords.includes(w));
      competitorScore = Math.min(5, matches.length * 1.5);
    }

    // -------------------------
    // RAW SCORE
    // -------------------------
    let rawScore = Math.floor(titleScore + descScore + competitorScore);

    // AI BOOST BONUS
    if (userProduct.isBoosted) {
      rawScore += 25;
    }

    // FINAL SCORE CAP
    const score = Math.max(10, Math.min(rawScore, 95));

    // -------------------------
    // MESSAGE LOGIC (SINGLE)
    // -------------------------
    let message;

    if (userProduct.isBoosted) {
      if (score >= 70) {
        message = "🚀 Great job! Your AI-boosted product is highly optimized.";
      } else {
        message = "Good boost! A few tweaks can push this even higher.";
      }
    } else {
      if (score < 30) {
        message = "Your product can perform much better — try boosting!";
      } else if (score < 50) {
        message = "Decent, but AI boost can significantly improve performance.";
      } else {
        message = "Good attempt — boosting will make it excellent.";
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        score,
        message,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
