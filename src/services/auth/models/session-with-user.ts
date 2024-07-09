import { Prisma } from '@prisma/client';

const sessionWithUsers = Prisma.validator<Prisma.UserSessionDefaultArgs>()({
  include: { user: true },
});

export type SessionWithUser = Prisma.UserSessionGetPayload<typeof sessionWithUsers>;
