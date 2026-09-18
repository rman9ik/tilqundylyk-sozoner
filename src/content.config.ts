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

// Optional link: existing text/PDF tasks remain valid.
const taskSchema = materialSchema.extend({
  learningapps_url: z.string().trim().refine(
    (value) => value === "" || /^https:\/\/(?:www\.)?learningapps\.org\/[^\s]+$/.test(value),
    { message: "Укажите ссылку вида https://learningapps.org/3074561" },
  ).nullish(),
});

const videoSchema = z.object({
  title: z.string(),
  description: z.string(),
  video_url: z.string().nullish(),
  cover: z.string().nullish(),
  cover_alt: z.string().nullish(),
});

const homeSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  title_accent: z.string(),
  description: z.string(),
  about: z.string().nullish(),
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

const dissertations = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/dissertations",
  }),
  schema: materialSchema,
});

const lectures = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/lectures",
  }),
  schema: materialSchema,
});

const tasks = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/tasks",
  }),
  schema: taskSchema,
});

const resources = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/resources",
  }),
  schema: materialSchema,
});

const videos = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/videos",
  }),
  schema: videoSchema,
});

const home = defineCollection({
  loader: glob({
    pattern: "home.md",
    base: "./src/content/home",    
  }),
  schema: homeSchema,
});

export const collections = {
  articles,
  conferences,
  dissertations,
  lectures,
  tasks,
  resources,
  videos,
  home,
};