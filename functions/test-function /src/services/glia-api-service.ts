import { GliaAuthApi, GliaQueueApi, GliaVisitorApi } from '../apis';
import { GliaNewVisitorResponseSchema, GliaOperatorTokenResponseSchema, GliaSiteTokenResponseSchema } from '../schemas';
import type { FunctionConfig, GliaNewVisitorResponse, LoggerInterface } from '../types';
import { validateSchema } from '../validator';

export class GliaAPIService {
  private gliaAuthApi: GliaAuthApi;
  private gliaVisitorApi: GliaVisitorApi;
  private gliaQueueApi: GliaQueueApi;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.gliaAuthApi = new GliaAuthApi(config, logger);
    this.gliaVisitorApi = new GliaVisitorApi(config, logger);
    this.gliaQueueApi = new GliaQueueApi(config, logger);
  }

  async fetchOperatorToken(): Promise<string | null> {
    try {
      const authResponse = await this.gliaAuthApi.fetchBearerToken();
      if (authResponse.ok) {
        const validatedResult = validateSchema(GliaOperatorTokenResponseSchema, authResponse.payload, 'GliaOperatorTokenResponseSchema');
        if (validatedResult.status) {
          return validatedResult.output.token;
        }
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in fetchOperatorToken';
      await this.logger.error(`Error fetching operator token: ${message}`);
      return null;
    }
  }

  async fetchSiteToken(): Promise<string | null> {
    try {
      const authResponse = await this.gliaAuthApi.fetchSiteBearerToken();
      if (authResponse.ok) {
        const validatedResult = validateSchema(GliaSiteTokenResponseSchema, authResponse.payload, 'GliaSiteTokenResponseSchema');
        if (validatedResult.status) {
          return validatedResult.output.access_token;
        }
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in fetchOperatorToken';
      await this.logger.error(`Error fetching operator token: ${message}`);
      return null;
    }
  }

  async createVisitor(siteToken: string): Promise<GliaNewVisitorResponse | null> {
    try {
      const response = await this.gliaVisitorApi.createVisitor(siteToken);
      if (response.ok && response.payload) {
        const validatedResult = validateSchema(GliaNewVisitorResponseSchema, response.payload, 'GliaNewVisitorResponseSchema');
        if (validatedResult.status) {
          return validatedResult.output;
        }
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in createVisitor';
      await this.logger.error(`Error creating visitor: ${message}`);
      return null;
    }
  }

  async createQueueTicket(visitorToken: string, siteToken: string, destinationQueueId: string): Promise<boolean> {
    try {
      const response = await this.gliaQueueApi.createQueueTicket(visitorToken, siteToken, destinationQueueId);
      return response.ok;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in createQueueTicket';
      await this.logger.error(`Error creating queue ticket: ${message}`);
      return false;
    }
  }
}
