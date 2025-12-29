import prisma from '../db.server';
export async function getOrCreateUser(shop) {
  let user = await prisma.user.findUnique({
    where:{shop}, 
  });
  if(!user){
    user = await prisma.user.create({
      data:{shop},
    });
  }
  return user;
}