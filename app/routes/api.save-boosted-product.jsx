import prisma from "../db.server";
import { authenticate } from "../shopify.server";
export const action = async ({ request }) => {
  await authenticate.admin(request);
  try {
    const { productId, title, description } = await request.json();
    if (!productId || !title || !description) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing data",
        }),
        { status: 400 },
      );
    }
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        description,
        isBoosted:true,
      },
    });
    return new Response(JSON.stringify({ success: true, product: updated }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 },
    );
  }
};
