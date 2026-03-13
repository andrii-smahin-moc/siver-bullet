import { InferOutput } from 'valibot';

import {
  GetResultsRequestSchema,
  GliaChatMessagePayloadSchema,
  GliaEngagementStartPayloadSchema,
  GliaWebhookPayloadSchema,
  InitializeRequestSchema,
  TestRequestPayloadSchema,
} from '../schemas';

export type InitializeRequestPayload = InferOutput<typeof InitializeRequestSchema>;
export type GetResultRequestPayload = InferOutput<typeof GetResultsRequestSchema>;

export type GliaEngagementStartPayload = InferOutput<typeof GliaEngagementStartPayloadSchema>;
export type GliaChatMessagePayload = InferOutput<typeof GliaChatMessagePayloadSchema>;
export type TestRequestPayload = InferOutput<typeof TestRequestPayloadSchema>;
export type GliaWebhookPayload = InferOutput<typeof GliaWebhookPayloadSchema>;

export interface GliaUtterancePayload {
  account_id: string;
  engagement_id: string;
  engine_settings: Record<string, unknown>;
  message_created_at: string;
  message_id: string;
  message_metadata: Record<string, unknown>;
  operator_id: string;
  site_id: string;
  utterance: string;
  visitor_attributes: Record<string, unknown>;
  visitor_id: string;
}

export type RequestPayload = TestRequestPayload | GliaWebhookPayload | GliaUtterancePayload;
