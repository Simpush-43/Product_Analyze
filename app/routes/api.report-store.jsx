import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { shopName } = await request.json();
const raw = shopName.trim().toLowerCase();
    if (!shopName || typeof shopName !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid store name" }),
        { status: 400 }
      );
    }

    // Check if store already requested
    const existing = await prisma.storeRequest.findUnique({
      where: { storeName: raw },
    });

    if (existing) {
      // Increase count
      await prisma.storeRequest.update({
        where: { storeName: shopName },
        data: { count: { increment: 1 } },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Store request updated",
        }),
        { status: 200 }
      );
    }

    // Create new request
    await prisma.storeRequest.create({
      data: {
        storeName: shopName,
        reason: "Access restricted / blocked",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Store request submitted",
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Report store error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500 }
    );
  }
};
