import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.UserWhereInput | undefined = input?.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : undefined;

      const users = await ctx.db.user.findMany({
        where,
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      const nextCursor = users.length === (input?.limit ?? 20) ? users[users.length - 1]!.id : undefined;

      return { items: users, nextCursor };
    }),

  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "VIEWER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: { id: true, role: true },
      });
      return updated;
    }),
});


