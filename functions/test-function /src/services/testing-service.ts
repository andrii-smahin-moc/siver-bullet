import {
  FunctionConfig,
  GetResultRequestPayload,
  GliaChatMessagePayload,
  GliaEngagementStartPayload,
  InitializeRequestPayload,
  KvStoreFactory,
  LoggerInterface,
  ServiceResponse,
} from '../types';

import { GliaAIService } from './glia-ai-service';
import { GliaAPIService } from './glia-api-service';
import { GliaKVService } from './glia-kv-service';

export class TestingService {
  private gliaApiService: GliaAPIService;
  private gliaKVService: GliaKVService;
  private gliaAiService: GliaAIService;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
    kvStoreFactory: KvStoreFactory,
  ) {
    this.gliaApiService = new GliaAPIService(config, logger);
    this.gliaKVService = new GliaKVService(config, logger, kvStoreFactory);
    this.gliaAiService = new GliaAIService(config);
  }

  async initializeTest(payload: InitializeRequestPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Initializing test...');

    const siteToken = await this.gliaApiService.fetchSiteToken();
    if (!siteToken) {
      await this.logger.error('Failed to fetch site token during test initialization.');
      return {
        error: 'Failed to fetch site token',
        status: false,
      };
    }

    const testVisitor = await this.gliaApiService.createVisitor(siteToken);
    if (!testVisitor) {
      await this.logger.error('Failed to create test visitor during test initialization.');
      return {
        error: 'Failed to create test visitor',
        status: false,
      };
    }

    await this.gliaKVService.setValue(testVisitor.id, testVisitor.access_token);

    const isTicketCreated = await this.gliaApiService.createQueueTicket(testVisitor.access_token, siteToken, payload.testingQueueId);
    if (!isTicketCreated) {
      await this.logger.error('Failed to create queue ticket during test initialization.');
      return {
        error: 'Failed to create queue ticket',
        status: false,
      };
    }

    await this.logger.info('Test initialized successfully.');
    return {
      payload: {
        testVisitorId: testVisitor.id,
        visitorToken: testVisitor.access_token,
      },
      status: true,
    };
  }

  async getResults(payload: GetResultRequestPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info(`[getResults] Fetching results. isActive=${String(payload.isActive)}`);

    return {
      payload: {},
      status: true,
    };
  }

  async handleChatMessage(payload: GliaChatMessagePayload): Promise<ServiceResponse<unknown>> {
    const chatMessageLogContext = [
      `engagementId=${payload.message.engagement_id}`,
      `target=${payload.message.target}`,
      `type=${payload.message.type}`,
      `timestamp=${payload.message.timestamp}`,
    ].join(' ');

    await this.logger.info(`[handleChatMessage] Received message. ${chatMessageLogContext}`);

    if (payload.message.target === 'operator') {
      await this.logger.info(`Ignoring chat message event targeted to operator. engagementId=${payload.message.engagement_id}`);

      return {
        payload: {
          ignored: true,
        },
        status: true,
      };
    }

    const engagementState = await this.gliaKVService.getValue(payload.message.engagement_id);
    const engagementData = this.parseEngagementState(engagementState.value);

    if (!engagementData) {
      await this.logger.warn(`[handleChatMessage] Missing or invalid engagement state. engagementId=${payload.message.engagement_id}`);

      return {
        payload: {},
        status: true,
      };
    }

    await this.logger.info(
      `[handleChatMessage] Generating AI reply. engagementId=${payload.message.engagement_id} visitorId=${engagementData.visitorId}`,
    );
    const prompt = this.config.gliaAI.prompt.replace('{sutMessage}', payload.message.content);
    const generatedResponse = await this.gliaAiService.invokeModel(this.config.gliaAI.systemMessage, prompt);
    const didSendMessage = await this.gliaApiService.sendMessage(
      engagementData.visitorToken,
      payload.message.engagement_id,
      generatedResponse,
    );

    await this.logger.info(
      `[handleChatMessage] Reply processed. engagementId=${payload.message.engagement_id} didSendMessage=${String(didSendMessage)}`,
    );

    return {
      payload: {
        didSendMessage,
      },
      status: true,
    };
  }

  async handleEngagementStart(payload: GliaEngagementStartPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info(
      `[handleEngagementStart] Received engagement start.` +
        ` engagementId=${payload.engagement.id} visitorId=${payload.engagement.visitor_id} source=${payload.engagement.source}`,
    );

    const visitorToken = await this.gliaKVService.getValue(payload.engagement.visitor_id);

    if (visitorToken) {
      const engagementState = JSON.stringify({
        visitorId: payload.engagement.visitor_id,
        visitorToken: visitorToken.value,
      });

      await this.gliaKVService.setValue(payload.engagement.id, engagementState);
      await this.logger.info(
        `[handleEngagementStart] Stored engagement state. engagementId=${payload.engagement.id} visitorId=${payload.engagement.visitor_id}`,
      );

      const message = await this.generateInitialMessage(payload.engagement.id);

      const didSendMessage = await this.gliaApiService.sendMessage(visitorToken.value, payload.engagement.id, message);
      await this.logger.info(
        `[handleEngagementStart] Initial message processed. engagementId=${payload.engagement.id} didSendMessage=${String(didSendMessage)}`,
      );

      return {
        payload: { didSendMessage },
        status: true,
      };
    }

    await this.logger.warn(
      `[handleEngagementStart] Visitor token not found. engagementId=${payload.engagement.id} visitorId=${payload.engagement.visitor_id}`,
    );

    return {
      payload: {},
      status: true,
    };
  }

  private parseEngagementState(value: string): { visitorId: string; visitorToken: string } | null {
    try {
      const parsedValue = JSON.parse(value) as { visitorId?: unknown; visitorToken?: unknown };

      if (typeof parsedValue.visitorId !== 'string' || typeof parsedValue.visitorToken !== 'string') {
        return null;
      }

      return {
        visitorId: parsedValue.visitorId,
        visitorToken: parsedValue.visitorToken,
      };
    } catch {
      return null;
    }
  }

  private async generateInitialMessage(engagementId: string): Promise<string> {
    const prompt = [
      'Generate the first chat message for a newly started customer engagement.',
      'Keep it short, natural, and helpful.',
      'Do not mention that the message was AI-generated.',
      `Engagement ID: ${engagementId}`,
    ].join(' ');

    try {
      await this.logger.info(`[generateInitialMessage] Generating AI opening message. engagementId=${engagementId}`);

      return await this.gliaAiService.invokeModel(this.config.gliaAI.systemMessage, prompt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating initial message';
      await this.logger.error(
        `[generateInitialMessage] Failed to generate AI opening message. engagementId=${engagementId} error=${errorMessage}`,
      );

      return `Hello! This is an automated message sent at the start of the engagement with ID: ${engagementId}`;
    }
  }
}
