import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import {getOrCreateUser} from '../utils/getUser.server';
export const action = async ({ request }) => {
  const {session} = await authenticate.admin(request);
  const shop = session.shop;
  try {
    const body = await request.json();
    const { title, description, price, image } = body;

    // Validation
    if (!title || !description) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Title & description required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
const user = await getOrCreateUser(shop);
    // Product object
    const product = await prisma.Product.create({
     data:{
      title,
      description,
      price: price || "N/A",
      image:
        image ||
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
        userId:user.id,
     },
    });

    // Return response
    return new Response(
      JSON.stringify({ success: true, product }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log("Error in adding the product", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
