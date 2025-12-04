import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const storyRouter = createTRPCRouter({
  // Get all published stories for public view
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const items = await ctx.db.story.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          createdBy: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Get single story by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.story.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  // Admin: Get all stories (including unpublished)
  getAllAdmin: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        search: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, published } = input;
      
      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
            { excerpt: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(published !== undefined && { published }),
      };

      const items = await ctx.db.story.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          createdBy: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Admin: Create new story
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.story.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Admin: Update story
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.story.update({
        where: { id },
        data,
      });
    }),

  // Admin: Delete story
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.story.delete({
        where: { id: input.id },
      });
    }),

  // Admin: Toggle published status
  togglePublished: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const story = await ctx.db.story.findUnique({
        where: { id: input.id },
        select: { published: true },
      });

      if (!story) {
        throw new Error("Story not found");
      }

      return ctx.db.story.update({
        where: { id: input.id },
        data: { published: !story.published },
      });
    }),

  // Get story counts for admin dashboard
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, published] = await Promise.all([
      ctx.db.story.count(),
      ctx.db.story.count({ where: { published: true } }),
    ]);

    return { total, published };
  }),
});
