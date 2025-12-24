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
  // DataDog monitoring configuration
  DD_API_KEY: v.string(),
  FDMS_VERSION: v.string(),

  // Glia platform configuration
  GLIA_API_DOMAIN: v.string(),

  GLIA_SITE_API_KEY: v.string(),
  GLIA_SITE_API_KEY_SECRET: v.string(),

  GLIA_USER_API_KEY: v.string(),
  GLIA_USER_API_KEY_SECRET: v.string(),

  GLIA_WEBHOOK_URL: v.string(),

  IS_DEV_MOD: v.optional(v.string()),

  REQUEST_TIMEOUT: v.optional(v.string()),
  RETRY_DELAY: v.optional(v.string()),

  SITE_ID: v.string(),
});
