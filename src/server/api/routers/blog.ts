import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const blogRouter = createTRPCRouter({
  // Get all published blogs for public view
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        tag: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, tag } = input;
      const items = await ctx.db.blog.findMany({
        where: {
          published: true,
          ...(tag && { tags: { has: tag } }),
        },
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

  // Get single blog by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Increment view count
      await ctx.db.blog.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      });

      return ctx.db.blog.findUnique({
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

  // Get all unique tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    const blogs = await ctx.db.blog.findMany({
      where: { published: true },
      select: { tags: true },
    });

    const allTags = blogs.flatMap(blog => blog.tags);
    const uniqueTags = [...new Set(allTags)].sort();
    return uniqueTags;
  }),

  // Admin: Get all blogs (including unpublished)
  getAllAdmin: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        search: z.string().optional(),
        published: z.boolean().optional(),
        tag: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, published, tag } = input;
      
      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
            { excerpt: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(published !== undefined && { published }),
        ...(tag && { tags: { has: tag } }),
      };

      const items = await ctx.db.blog.findMany({
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

  // Admin: Create new blog
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        tags: z.array(z.string()).default([]),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blog.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Admin: Update blog
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        tags: z.array(z.string()).default([]),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.blog.update({
        where: { id },
        data,
      });
    }),

  // Admin: Delete blog
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blog.delete({
        where: { id: input.id },
      });
    }),

  // Admin: Toggle published status
  togglePublished: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const blog = await ctx.db.blog.findUnique({
        where: { id: input.id },
        select: { published: true },
      });

      if (!blog) {
        throw new Error("Blog not found");
      }

      return ctx.db.blog.update({
        where: { id: input.id },
        data: { published: !blog.published },
      });
    }),

  // Get blog counts for admin dashboard
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, published, totalViews] = await Promise.all([
      ctx.db.blog.count(),
      ctx.db.blog.count({ where: { published: true } }),
      ctx.db.blog.aggregate({
        _sum: { views: true },
      }),
    ]);

    return { 
      total, 
      published, 
      totalViews: totalViews._sum.views || 0 
    };
  }),
});
