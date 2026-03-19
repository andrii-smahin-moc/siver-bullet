import type { FunctionConfig } from '../types/config-types';
import type { GliaTranscriptMessage } from '../types/glia-types';
import type { KvStoreFactory } from '../types/kv-storage-types';
import type { LoggerInterface } from '../types/logger-types';
import type { GliaChatMessagePayload, GliaEngagementStartPayload, InitializeRequestPayload } from '../types/request-payload-types';
import type { ServiceResponse } from '../types/response-payload-types';

import { GliaAIService } from './glia-ai-service';
import { GliaAPIService } from './glia-api-service';
import { GliaKVService } from './glia-kv-service';

type IncomingUtterancePayload = {
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
};

type SuggestionMessage = {
  attachment: {
    content: string;
    type: 'ssml';
  };
  content: string;
  type: 'suggestion';
};

type TransferMessage = {
  properties: {
    media: 'text';
    notifications: {
      failure: string;
      queue_closed: string;
      success: string;
    };
    queue_id: string;
    version: '0';
  };
  type: 'transfer';
};

type UtteranceResponse = {
  confidence_level: number;
  messages: Array<SuggestionMessage | TransferMessage>;
};

export class TestingService {
  private gliaApiService: GliaAPIService;
  private gliaAiService: GliaAIService;
  private gliaKVService: GliaKVService;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
    kvStoreFactory: KvStoreFactory,
  ) {
    this.gliaApiService = new GliaAPIService(config, logger);
    this.gliaAiService = new GliaAIService(config);
    this.gliaKVService = new GliaKVService(config, logger, kvStoreFactory);
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

    const isTicketCreated = await this.gliaApiService.createQueueTicket(testVisitor.access_token, siteToken, payload.testingPhoneNumber);
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

  async handleChatMessage(payload: GliaChatMessagePayload): Promise<ServiceResponse<unknown>> {
    return this.handleIncomingMessage({
      content: payload.message.content,
      engagementId: payload.message.engagement_id,
      source: 'handleChatMessage',
      target: payload.message.target,
      timestamp: payload.message.timestamp,
      type: payload.message.type,
    });
  }

  async handleUtterance(payload: IncomingUtterancePayload): Promise<ServiceResponse<UtteranceResponse>> {
    try {
      await this.logger.info(`[handleUtterance] Generating AI response. engagementId=${payload.engagement_id}`);

      let transcript = '';
      const operatorToken = await this.gliaApiService.fetchOperatorToken();
      if (operatorToken) {
        const messages = await this.gliaApiService.fetchTranscript(operatorToken, payload.engagement_id);
        transcript = this.formatTranscript(messages);
      }

      const prompt = this.buildPrompt(transcript);
      const generatedResponse = await this.gliaAiService.invokeModel(this.config.gliaAI.systemMessage, prompt);

      return {
        payload: this.buildResponse(generatedResponse ? [this.createSuggestionMessage(generatedResponse)] : []),
        status: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logger.error(`[handleUtterance] Failed to build utterance response. error=${errorMessage}`);

      return {
        payload: this.buildResponse([]),
        status: true,
      };
    }
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

      const initialPrompt =
        `Generate the first chat message for a newly started customer engagement.` + ` Engagement ID: ${payload.engagement.id}`;
      const message = await this.gliaAiService.invokeModel(this.config.gliaAI.systemMessage, initialPrompt);

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

  private async handleIncomingMessage(parameters: {
    content: string;
    engagementId: string;
    source: 'handleChatMessage' | 'handleUtterance';
    target?: string;
    timestamp: string;
    type: string;
  }): Promise<ServiceResponse<unknown>> {
    const logContext = [
      `engagementId=${parameters.engagementId}`,
      `target=${parameters.target ?? 'n/a'}`,
      `type=${parameters.type}`,
      `timestamp=${parameters.timestamp}`,
    ].join(' ');

    await this.logger.info(`[${parameters.source}] Received message. ${logContext}`);

    if (parameters.target === 'operator') {
      await this.logger.info(`Ignoring chat message event targeted to operator. engagementId=${parameters.engagementId}`);

      return {
        payload: {
          ignored: true,
        },
        status: true,
      };
    }

    const engagementState = await this.gliaKVService.getValue(parameters.engagementId);
    const engagementData = this.parseEngagementState(engagementState.value);

    if (!engagementData) {
      await this.logger.warn(`[${parameters.source}] Missing or invalid engagement state. engagementId=${parameters.engagementId}`);

      return {
        payload: {},
        status: true,
      };
    }

    await this.logger.info(
      `[${parameters.source}] Generating AI reply. engagementId=${parameters.engagementId} visitorId=${engagementData.visitorId}`,
    );

    const operatorToken = await this.gliaApiService.fetchOperatorToken();
    const messages = operatorToken ? await this.gliaApiService.fetchTranscript(operatorToken, parameters.engagementId) : [];
    const transcript = this.formatTranscript(messages);
    const prompt = this.buildPrompt(transcript);

    let generatedResponse: string | null = null;
    try {
      generatedResponse = await this.gliaAiService.invokeModel(this.config.gliaAI.systemMessage, prompt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logger.error(`[${parameters.source}] AI generation failed. error=${errorMessage}`);
    }

    const didSendMessage = generatedResponse
      ? await this.gliaApiService.sendMessage(engagementData.visitorToken, parameters.engagementId, generatedResponse)
      : false;

    await this.logger.info(
      `[${parameters.source}] Reply processed. engagementId=${parameters.engagementId} didSendMessage=${String(didSendMessage)}`,
    );

    return {
      payload: {
        didSendMessage,
      },
      status: true,
    };
  }

  private createSuggestionMessage(content: string): SuggestionMessage {
    return {
      attachment: {
        content: `<speak><p>${content}</p></speak>`,
        type: 'ssml',
      },
      content: '',
      type: 'suggestion',
    };
  }

  private buildResponse(messages: Array<SuggestionMessage | TransferMessage>): UtteranceResponse {
    return {
      confidence_level: this.config.gliaAI.confidence,
      messages,
    };
  }

  private formatTranscript(messages: GliaTranscriptMessage[]): string {
    return messages.map((m) => `${m.sender.name || m.sender.type}: ${m.message || ''}`).join('\n');
  }

  private buildPrompt(transcript: string): string {
    const prompt = this.config.gliaAI.prompt.replace('{conversation_history}', transcript || '');
    return prompt;
  }
}
