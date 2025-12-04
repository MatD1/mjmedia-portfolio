import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	// Get all published posts for public view
	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				cursor: z.number().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;
			const items = await ctx.db.post.findMany({
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

	// Get single post by ID
	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.post.findUnique({
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

	// Admin: Get all posts (including unpublished)
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
						{ name: { contains: search, mode: 'insensitive' as const } },
						{ content: { contains: search, mode: 'insensitive' as const } },
						{ excerpt: { contains: search, mode: 'insensitive' as const } },
					],
				}),
				...(published !== undefined && { published }),
			};

			const items = await ctx.db.post.findMany({
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

	// Admin: Create new post
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				content: z.string().optional(),
				excerpt: z.string().max(500).optional(),
				coverImage: z.string().optional(),
				published: z.boolean().default(false),
			})
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.post.create({
				data: {
					...input,
					createdById: ctx.session.user.id,
				},
			});
		}),

	// Admin: Update post
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).max(255),
				content: z.string().optional(),
				excerpt: z.string().max(500).optional(),
				coverImage: z.string().optional(),
				published: z.boolean().default(false),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.db.post.update({
				where: { id },
				data,
			});
		}),

	// Admin: Delete post
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.post.delete({
				where: { id: input.id },
			});
		}),

	// Admin: Toggle published status
	togglePublished: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const post = await ctx.db.post.findUnique({
				where: { id: input.id },
				select: { published: true },
			});

			if (!post) {
				throw new Error("Post not found");
			}

			return ctx.db.post.update({
				where: { id: input.id },
				data: { published: !post.published },
			});
		}),

	// Get post counts for admin dashboard
	getCounts: protectedProcedure.query(async ({ ctx }) => {
		const [total, published] = await Promise.all([
			ctx.db.post.count(),
			ctx.db.post.count({ where: { published: true } }),
		]);

		return { total, published };
	}),

	getLatest: protectedProcedure.query(async ({ ctx }) => {
		const post = await ctx.db.post.findFirst({
			orderBy: { createdAt: "desc" },
			where: { createdBy: { id: ctx.session.user.id } },
		});

		return post ?? null;
	}),

	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),
});
