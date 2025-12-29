import { queryHuggingFace } from "../utils/hf";
export const action = async ({ request }) => {
  try {
    console.log("staritng the boost")
    const { userProduct } = await request.json();
    if (!userProduct) {
      return new Response(
      JSON.stringify({
        success: false,
        error: "Product is missing",
      }),
        { status: 400, headers: { "Content-Type": "application/json" }});
    }
    if (!userProduct?.title || !userProduct?.description) {
      return new Response(
      JSON.stringify({
        success: false,
        error: "Product title or description is missing",
      }),
        { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const prompt = `
You are an expert Shopify SEO Copywriter with 10 years of experience. 
Your goal is to rewrite product details to rank high on Google and convert visitors into buyers.

INPUT DATA:
- Original Title: "${userProduct.title}"
- Original Description: "${userProduct.description}"

INSTRUCTIONS:
1. TITLE: Create a new title that is 50-75 characters long. It must be catchy, include the main keyword, and look professional.
2. DESCRIPTION: Write a persuasive sales description (approx 100-150 words). 
   - Start with a strong "Hook" sentence.
   - Focus on BENEFITS (how it helps the user), not just features.
   - Use a warm, exciting tone.
   - End with a short Call to Action (e.g., "Order yours today!").

OUTPUT FORMAT:
Please return the response in this exact format (do not add conversational text):

**Title:**
[Insert New Title Here]

**Description:**
[Insert New Description Here]
    `;
    const response = await queryHuggingFace(prompt);
    const aiContent = response?.choices?.[0]?.message?.content || "";
    return new Response(
      JSON.stringify({
        success: true,
        boosted: aiContent,
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
