import * as v from 'valibot';

/**
 * Base Environment Schema - Template for your configuration
 *
 * Customize this schema to match your environment variables.
 * Remove fields you don't need, add your custom configuration fields.
 */
export const BaseEnvironmentSchema = v.object({
  // HTTP request configuration
  CALL_RETRIES: v.optional(v.string()),
  CONFIDENCE: v.string(),
  // DataDog monitoring configuration
  DD_API_KEY: v.string(),

  FDMS_VERSION: v.string(),

  // Glia AI configuration
  GLIA_AI_MAX_TOKENS: v.string(),
  GLIA_AI_MODEL: v.string(),

  GLIA_AI_STOP_SEQUENCES: v.optional(v.string()),
  GLIA_AI_TEMPERATURE: v.string(),

  // Glia platform configuration
  GLIA_API_DOMAIN: v.string(),

  GLIA_SITE_API_KEY: v.string(),

  GLIA_SITE_API_KEY_SECRET: v.string(),

  GLIA_TEST_VISITOR_PHONE_NUMBER: v.string(),

  GLIA_USER_API_KEY: v.string(),

  GLIA_USER_API_KEY_SECRET: v.string(),

  GLIA_WEBHOOK_URL: v.string(),

  IS_DEV_MOD: v.optional(v.string()),

  PROMPT: v.string(),

  REQUEST_TIMEOUT: v.optional(v.string()),

  RETRY_DELAY: v.optional(v.string()),

  SITE_ID: v.string(),
  SYSTEM_MESSAGE: v.string(),
});
