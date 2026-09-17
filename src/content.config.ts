import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const materialSchema = z.object({
  title: z.string(),
  description: z.string(),
  cover: z.string().nullish(),
  cover_alt: z.string().nullish(),
  pdf: z.string().nullish(),
});

const articles = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/articles",
  }),
  schema: materialSchema,
});

const conferences = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/conferences",
  }),
  schema: materialSchema,
});

export const collections = { articles, conferences };