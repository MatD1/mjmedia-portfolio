import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  // Get all published projects for public view
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
        featured: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, featured } = input;
      const items = await ctx.db.project.findMany({
        where: {
          published: true,
          ...(featured !== undefined && { featured }),
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
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

  // Get single project by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({
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

  // Admin: Get all projects (including unpublished)
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
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(published !== undefined && { published }),
      };

      const items = await ctx.db.project.findMany({
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

  // Admin: Create new project
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1).max(1000),
        content: z.string().optional(),
        images: z.array(z.string()).default([]),
        techStack: z.array(z.string()).default([]),
        liveUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        featured: z.boolean().default(false),
        published: z.boolean().default(false),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Admin: Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().min(1).max(1000),
        content: z.string().optional(),
        images: z.array(z.string()).default([]),
        techStack: z.array(z.string()).default([]),
        liveUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        featured: z.boolean().default(false),
        published: z.boolean().default(false),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.project.update({
        where: { id },
        data,
      });
    }),

  // Admin: Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.delete({
        where: { id: input.id },
      });
    }),

  // Admin: Toggle published status
  togglePublished: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        select: { published: true },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return ctx.db.project.update({
        where: { id: input.id },
        data: { published: !project.published },
      });
    }),

  // Get project counts for admin dashboard
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, published, featured] = await Promise.all([
      ctx.db.project.count(),
      ctx.db.project.count({ where: { published: true } }),
      ctx.db.project.count({ where: { featured: true } }),
    ]);

    return { total, published, featured };
  }),
});
