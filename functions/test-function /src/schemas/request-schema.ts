import * as v from 'valibot';

export const InitializeRequestSchema = v.object({
  testingPhoneNumber: v.string(),
});

export const TestRequestPayloadSchema = v.variant('requestType', [
  v.object({
    payload: InitializeRequestSchema,
    requestType: v.literal('initTest'),
  }),
]);

export const GliaEngagementStartPayloadSchema = v.object({
  engagement: v.object({
    id: v.string(),
    source: v.string(),
    visitor_id: v.string(),
  }),
  event_type: v.literal('engagement.start'),
});

export const GliaChatMessagePayloadSchema = v.object({
  message: v.object({
    content: v.string(),
    engagement_id: v.string(),
    target: v.string(),
    timestamp: v.string(),
    type: v.string(),
  }),
  event_type: v.literal('engagement.chat.message'),
});

export const GliaUtterancePayloadSchema = v.object({
  account_id: v.string(),
  engagement_id: v.string(),
  engine_settings: v.record(v.string(), v.unknown()),
  message_created_at: v.string(),
  message_id: v.string(),
  message_metadata: v.record(v.string(), v.unknown()),
  operator_id: v.string(),
  site_id: v.string(),
  utterance: v.string(),
  visitor_attributes: v.record(v.string(), v.unknown()),
  visitor_id: v.string(),
});

export const GliaWebhookPayloadSchema = v.variant('event_type', [GliaEngagementStartPayloadSchema, GliaChatMessagePayloadSchema]);

export const UnionRequestSchema = v.union([TestRequestPayloadSchema, GliaWebhookPayloadSchema, GliaUtterancePayloadSchema]);
