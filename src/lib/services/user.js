import { prisma } from "../prisma";

export const UserService = {
  async getCredits(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return user ? user.credits : 0;
  },

  async addCredits(userId, amount) {
    if (amount <= 0) return;
    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  },

  // Grants credits once per Stripe Checkout session. A redelivered
  // checkout.session.completed hits the primary key and is ignored.
  async grantCreditsOnce(sessionId, userId, amount) {
    if (amount <= 0) return false;
    try {
      await prisma.$transaction([
        prisma.creditGrant.create({
          data: { stripeSessionId: sessionId, userId, credits: amount },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: amount } },
        }),
      ]);
      return true;
    } catch (error) {
      if (error?.code === "P2002") return false;
      throw error;
    }
  },

  async deductCredits(userId, amount) {
    if (amount <= 0) return;
    
    // Check if the user has enough credits
    const currentCredits = await this.getCredits(userId);
    if (currentCredits < amount) {
      throw new Error("Insufficient credits available");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });
  },
};

export const getCredits = UserService.getCredits.bind(UserService);
export const grantCreditsOnce = UserService.grantCreditsOnce.bind(UserService);
export const addCredits = UserService.addCredits.bind(UserService);
export const deductCredits = UserService.deductCredits.bind(UserService);
export default UserService;

