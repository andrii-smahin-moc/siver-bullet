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

import { GliaAPIService } from './glia-api-service';
import { GliaKVService } from './glia-kv-service';

export class TestingService {
  private gliaApiService: GliaAPIService;
  private gliaKVService: GliaKVService;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
    kvStoreFactory: KvStoreFactory,
  ) {
    this.gliaApiService = new GliaAPIService(config, logger);
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
    await this.logger.info(`Getting results for isActive: ${payload.isActive}`);

    return {
      payload: {},
      status: true,
    };
  }

  async handleChatMessage(payload: GliaChatMessagePayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Handling chat message event...');

    return {
      payload: {},
      status: true,
    };
  }

  async handleEngagementStart(payload: GliaEngagementStartPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Handling engagement start event...');

    const visitorToken = await this.gliaKVService.getValue(payload.engagement.visitor_id);

    if (visitorToken) {
      await this.logger.info(`Found visitor token for visitor ID ${payload.engagement.visitor_id}. Sending automated message...`);

      const message = `Hello! This is an automated message sent at the start of the engagement with ID: ${payload.engagement.id}`;

      const didSendMessage = await this.gliaApiService.sendMessage(visitorToken.value, payload.engagement.id, message);
      return {
        payload: { didSendMessage },
        status: true,
      };
    }

    return {
      payload: {},
      status: true,
    };
  }
}
