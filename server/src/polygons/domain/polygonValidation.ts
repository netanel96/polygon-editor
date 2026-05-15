import { z } from 'zod';

export const createPolygonSchema = z.object({
  name: z.string().min(1),

  points: z.array(z.array(z.number())).min(3),
});
