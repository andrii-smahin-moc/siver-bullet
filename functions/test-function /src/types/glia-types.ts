import * as vi from 'valibot';

import { GliaNewVisitorResponseSchema } from '../schemas';

export type GliaNewVisitorResponse = vi.InferOutput<typeof GliaNewVisitorResponseSchema>;
