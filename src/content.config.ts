import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';

const lessons=defineCollection({
  loader:glob({pattern:'**/*.md',base:'./src/content/lessons'}),
  schema:z.object({
    lessonId:z.string().regex(/^(?:[1-9]|1[0-3])-[1-9]$/),
    lang:z.enum(['fr','en']),
    title:z.string().min(5),
    description:z.string().min(30),
    summary:z.array(z.string().min(5)).min(3),
    formula:z.string().min(1),
    pitfall:z.string().min(15),
    source:z.string().regex(/^dlc-handout-[\w-]+\.pdf$/),
    sourcePages:z.array(z.number().int().positive()).min(1),
    pdfPages:z.number().int().positive(),
    quiz:z.object({
      question:z.string().min(10),
      options:z.array(z.string().min(1)).min(2),
      answer:z.number().int().nonnegative(),
      explanation:z.string().min(20),
    }).refine(q=>q.answer<q.options.length,{message:'quiz.answer must index an existing option (starting at 0).'}),
  }),
});
const notes=defineCollection({
  loader:glob({pattern:'**/*.md',base:'./src/content/notes'}),
  schema:z.object({lang:z.enum(['fr','en']),title:z.string(),description:z.string(),source:z.string()}),
});
export const collections={lessons,notes};
