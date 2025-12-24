import { FunctionConfig, GetResultRequestPayload, InitializeTestRequestPayload, LoggerInterface, ServiceResponse } from '../types';

import { GliaAPIService } from './glia-api-service';

export class TestingService {
  private gliaApiService: GliaAPIService;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.gliaApiService = new GliaAPIService(config, logger);
  }

  async initializeTest(payload: InitializeTestRequestPayload): Promise<ServiceResponse<unknown>> {
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

    return {
      payload: {},
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
}
