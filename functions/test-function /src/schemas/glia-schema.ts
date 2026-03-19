import * as vi from 'valibot';

export const GliaOperatorTokenResponseSchema = vi.object({
  token: vi.string(),
});

export const GliaSiteTokenResponseSchema = vi.object({
  access_token: vi.string(),
});

export const GliaNewVisitorResponseSchema = vi.object({
  access_token: vi.string(),
  id: vi.string(),
});

export const GliaEngagementRequestSchema = vi.object({
  id: vi.string(),
});

export const GliaTranscriptMessageSchema = vi.object({
  message: vi.nullable(vi.string()),
  sender: vi.object({
    name: vi.optional(vi.nullable(vi.string())),
    type: vi.string(),
  }),
  type: vi.string(),
});

export const GliaTranscriptResponseSchema = vi.array(GliaTranscriptMessageSchema);
