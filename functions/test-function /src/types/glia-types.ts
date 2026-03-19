import * as vi from 'valibot';

import { GliaEngagementRequestSchema, GliaNewVisitorResponseSchema } from '../schemas';

export type GliaNewVisitorResponse = vi.InferOutput<typeof GliaNewVisitorResponseSchema>;
export type GliaEngagementRequestResult = vi.InferOutput<typeof GliaEngagementRequestSchema>;

export type GliaTranscriptMessage = {
  message: string | null;
  sender: {
    name?: string | null;
    type: string;
  };
  type: string;
};
