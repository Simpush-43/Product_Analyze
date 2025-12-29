import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { getOrCreateUser } from "../utils/getUser.server";
export const loader =async ({request})=>{
  await authenticate.admin(request);
  const shop = new URL(request.url).searchParams.get('shop');
  const user = await getOrCreateUser(shop);
  const products = await prisma.Product.findMany({
    where :{userId:user.id},
    orderBy:{createdAt:'desc'}
  });
  return {shop,products};
}