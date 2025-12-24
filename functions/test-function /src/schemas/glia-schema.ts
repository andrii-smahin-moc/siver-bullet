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
