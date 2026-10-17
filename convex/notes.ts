import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const emptyContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

function validateSlug(slug: string) {
  if (
    !slug ||
    slug.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    throw new Error(
      "Invalid slug. Use lowercase letters, numbers, and hyphens."
    );
  }
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notes").collect();
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const createIfMissing = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    validateSlug(args.slug);

    const existing = await ctx.db
      .query("notes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();

    return await ctx.db.insert("notes", {
      slug: args.slug,
      title: args.slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      content: emptyContent,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    validateSlug(args.slug);

    const note = await ctx.db
      .query("notes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!note) {
      throw new Error("Note not found");
    }

    await ctx.db.patch(note._id, {
      title: args.title.slice(0, 200),
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    validateSlug(args.slug);

    const note = await ctx.db
      .query("notes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!note) {
      throw new Error("Note not found");
    }

    await ctx.db.delete(note._id);

    return {
      success: true,
      message: "Note deleted successfully",
    };
  },
});