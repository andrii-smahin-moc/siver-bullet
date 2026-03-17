import * as vi from 'valibot';

import { GliaCortexResponseSchema, GliaEngagementRequestSchema, GliaNewVisitorResponseSchema } from '../schemas';

export type GliaNewVisitorResponse = vi.InferOutput<typeof GliaNewVisitorResponseSchema>;
export type GliaEngagementRequestResult = vi.InferOutput<typeof GliaEngagementRequestSchema>;
export type GliaCortexResponse = vi.InferOutput<typeof GliaCortexResponseSchema>;
