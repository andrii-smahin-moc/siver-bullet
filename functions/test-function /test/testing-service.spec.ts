import { describe, expect, it, vi } from 'vitest';

vi.mock('ai', () => ({
  aiClient: {
    initialize: vi.fn(() => ({
      invokeModel: vi.fn(async () => ({
        message: {
          content: [{ text: 'mocked-ai-response' }],
        },
      })),
    })),
  },
}));

import { TestingService } from '../src/services/testing-service';
import { RequestHandler } from '../src/request-handler';
import { validatePayload } from '../src/request-validator';
import {
  FunctionConfig,
  GliaChatMessagePayload,
  GliaEngagementStartPayload,
  GliaUtterancePayload,
  KvStoreFactory,
  LoggerInterface,
} from '../src/types';

const createConfig = (): FunctionConfig => ({
  callRetries: 3,
  dataDog: {
    callRetries: 3,
    customer: 'example',
    ddApiKey: 'dd-api-key',
    functionName: 'test-function',
    isDevMode: true,
    requestTimeout: 5000,
    retryDelay: 1000,
    siteId: 'site-id',
    version: '1.0.0',
  },
  glia: {
    apiDomain: 'https://api.example.com',
    operatorApiKey: 'operator-key',
    operatorApiKeySecret: 'operator-secret',
    siteApiKey: 'site-key',
    siteApiKeySecret: 'site-secret',
    siteId: 'site-id',
    webhookUrl: 'https://webhook.example.com',
  },
  gliaAI: {
    confidence: 0.9,
    maxTokens: 256,
    model: 'glia.micro.v1',
    prompt: 'Reply to: {sutMessage}',
    stopSequences: [],
    systemMessage: 'You are a helpful assistant.',
    temperature: 0.1,
  },
  requestTimeout: 5000,
  retryDelay: 1000,
});

const createLogger = (): LoggerInterface => ({
  error: vi.fn(async () => undefined),
  info: vi.fn(async () => undefined),
  warn: vi.fn(async () => undefined),
});

const createKvStoreFactory = (): KvStoreFactory => ({
  initializeKvStore: vi.fn(() => ({
    get: vi.fn(async () => ({ value: 'visitor-token' })),
    set: vi.fn(async () => undefined),
  })),
});

describe('TestingService.handleChatMessage', () => {
  it('ignores chat message webhooks targeted to operator', async () => {
    const logger = createLogger();
    const testingService = new TestingService(createConfig(), logger, createKvStoreFactory());

    const payload: GliaChatMessagePayload = {
      event_type: 'engagement.chat.message',
      message: {
        content: 'Automated reply',
        engagement_id: 'engagement-id',
        target: 'operator',
        timestamp: '2026-03-12T18:21:35Z',
        type: 'user',
      },
    };

    const response = await testingService.handleChatMessage(payload);

    expect(response).toEqual({
      payload: {
        ignored: true,
      },
      status: true,
    });
    expect(logger.info).toHaveBeenCalledWith('Ignoring chat message event targeted to operator. engagementId=engagement-id');
  });
});

describe('TestingService.handleUtterance', () => {
  it('returns an AI-generated suggestion response wrapped in messages', async () => {
    const logger = createLogger();
    const testingService = new TestingService(createConfig(), logger, createKvStoreFactory());
    const invokeModel = vi.fn(async () => 'mocked-ai-response');

    Object.assign(testingService as object, {
      gliaAiService: {
        invokeModel,
      },
    });

    const payload: GliaUtterancePayload = {
      account_id: 'account-id',
      engagement_id: 'engagement-id',
      engine_settings: {},
      message_created_at: '2026-03-13T15:24:12Z',
      message_id: 'message-id',
      message_metadata: {
        speech_to_text_type: 'audio',
      },
      operator_id: 'operator-id',
      site_id: 'site-id',
      utterance: 'Yep. Wait.',
      visitor_attributes: {},
      visitor_id: 'visitor-id',
    };

    const response = await testingService.handleUtterance(payload);

    expect(invokeModel).toHaveBeenCalledWith('You are a helpful assistant.', 'Reply to: Yep. Wait.');
    expect(response).toEqual({
      payload: {
        confidence_level: 1,
        messages: [
          {
            attachment: {
              content: '<speak><p>mocked-ai-response</p></speak>',
              type: 'ssml',
            },
            content: 'mocked-ai-response',
            type: 'suggestion',
          },
        ],
      },
      status: true,
    });
  });

  it('returns an empty wrapped response when AI generation fails', async () => {
    const logger = createLogger();
    const testingService = new TestingService(createConfig(), logger, createKvStoreFactory());
    const invokeModel = vi.fn(async () => {
      throw new Error('model failed');
    });

    Object.assign(testingService as object, {
      gliaAiService: {
        invokeModel,
      },
    });

    const payload: GliaUtterancePayload = {
      account_id: 'account-id',
      engagement_id: 'engagement-id',
      engine_settings: {},
      message_created_at: '2026-03-13T15:24:12Z',
      message_id: 'message-id',
      message_metadata: {
        speech_to_text_type: 'audio',
      },
      operator_id: 'operator-id',
      site_id: 'site-id',
      utterance: 'Yep. Wait.',
      visitor_attributes: {},
      visitor_id: 'visitor-id',
    };

    const response = await testingService.handleUtterance(payload);

    expect(response).toEqual({
      payload: {
        confidence_level: 1,
        messages: [],
      },
      status: true,
    });
    expect(logger.error).toHaveBeenCalledWith('[handleUtterance] Failed to build utterance response. error=model failed');
  });
});

describe('TestingService.handleEngagementStart', () => {
  it('stores visitor context by engagement id before sending an AI-generated first message', async () => {
    const logger = createLogger();
    const kvStore = {
      get: vi.fn(async () => ({ value: 'visitor-token' })),
      set: vi.fn(async () => undefined),
    };
    const kvStoreFactory: KvStoreFactory = {
      initializeKvStore: vi.fn(() => kvStore),
    };
    const testingService = new TestingService(createConfig(), logger, kvStoreFactory);
    const sendMessage = vi.fn(async () => true);
    const invokeModel = vi.fn(async () => 'ai-generated-opening-message');

    Object.assign(testingService as object, {
      gliaApiService: {
        sendMessage,
      },
      gliaAiService: {
        invokeModel,
      },
    });

    const payload: GliaEngagementStartPayload = {
      engagement: {
        id: 'engagement-id',
        source: 'visitor',
        visitor_id: 'visitor-id',
      },
      event_type: 'engagement.start',
    };

    const response = await testingService.handleEngagementStart(payload);

    expect(kvStore.get).toHaveBeenCalledWith('visitor-id');
    expect(kvStore.set).toHaveBeenCalledWith({
      key: 'engagement-id',
      value: JSON.stringify({
        visitorId: 'visitor-id',
        visitorToken: 'visitor-token',
      }),
    });
    expect(invokeModel).toHaveBeenCalledWith(
      'You are a helpful assistant.',
      expect.stringContaining('Generate the first chat message for a newly started customer engagement.'),
    );
    expect(sendMessage).toHaveBeenCalledWith('visitor-token', 'engagement-id', 'ai-generated-opening-message');
    expect(response).toEqual({
      payload: {
        didSendMessage: true,
      },
      status: true,
    });
  });
});

describe('validatePayload', () => {
  it('accepts the flat utterance request payload', async () => {
    const request = new Request('https://example.com', {
      body: JSON.stringify({
        account_id: 'account-id',
        engagement_id: 'engagement-id',
        engine_settings: {},
        message_created_at: '2026-03-13T15:24:12Z',
        message_id: 'message-id',
        message_metadata: {
          speech_to_text_type: 'audio',
        },
        operator_id: 'operator-id',
        site_id: 'site-id',
        utterance: 'Yep. Wait.',
        visitor_attributes: {},
        visitor_id: 'visitor-id',
      }),
      method: 'POST',
    });

    const result = await validatePayload(request);

    expect(result.status).toBe(true);
    if (!result.status) {
      throw new Error(result.message);
    }

    expect(result.output).toMatchObject({
      engagement_id: 'engagement-id',
      utterance: 'Yep. Wait.',
    });
  });
});

describe('RequestHandler.handleRequest', () => {
  it('routes flat utterance payloads to the utterance handler', async () => {
    const logger = createLogger();
    const requestHandler = new RequestHandler(createConfig(), logger, createKvStoreFactory());
    const handleUtterance = vi.fn(async () => ({
      payload: {
        confidence_level: 1,
        messages: [],
      },
      status: true,
    }));

    Object.assign(requestHandler as object, {
      testingService: {
        handleUtterance,
      },
    });

    const payload: GliaUtterancePayload = {
      account_id: 'account-id',
      engagement_id: 'engagement-id',
      engine_settings: {},
      message_created_at: '2026-03-13T15:24:12Z',
      message_id: 'message-id',
      message_metadata: {
        speech_to_text_type: 'audio',
      },
      operator_id: 'operator-id',
      site_id: 'site-id',
      utterance: 'Yep. Wait.',
      visitor_attributes: {},
      visitor_id: 'visitor-id',
    };

    const response = await requestHandler.handleRequest(payload);

    expect(handleUtterance).toHaveBeenCalledWith(payload);
    expect(response).toEqual({
      payload: {
        confidence_level: 1,
        messages: [],
      },
      status: true,
    });
  });
});
