import { GliaAuthApi, GliaEngagementApi, GliaQueueApi, GliaVisitorApi } from '../apis';
import {
  GliaEngagementRequestSchema,
  GliaNewVisitorResponseSchema,
  GliaOperatorTokenResponseSchema,
  GliaSiteTokenResponseSchema,
  GliaTranscriptResponseSchema,
} from '../schemas';
import type { FunctionConfig, GliaEngagementRequestResult, GliaNewVisitorResponse, GliaTranscriptMessage, LoggerInterface } from '../types';
import { validateSchema } from '../validator';

export class GliaAPIService {
  private gliaAuthApi: GliaAuthApi;
  private gliaVisitorApi: GliaVisitorApi;
  private gliaQueueApi: GliaQueueApi;
  private gliaEngagementApi: GliaEngagementApi;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.gliaAuthApi = new GliaAuthApi(config, logger);
    this.gliaVisitorApi = new GliaVisitorApi(config, logger);
    this.gliaQueueApi = new GliaQueueApi(config, logger);
    this.gliaEngagementApi = new GliaEngagementApi(config, logger);
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
      if (response.ok) {
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

  async createQueueTicket(visitorToken: string, siteToken: string, phoneNumber: string): Promise<boolean> {
    try {
      const response = await this.gliaQueueApi.createQueueTicket(visitorToken, siteToken, phoneNumber);
      return response.ok;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in createQueueTicket';
      await this.logger.error(`Error creating queue ticket: ${message}`);
      return false;
    }
  }

  async sendMessage(visitorToken: string, engagementId: string, message: string): Promise<boolean> {
    try {
      const response = await this.gliaEngagementApi.sendMessage(visitorToken, engagementId, message);
      return response.ok;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in sendMessage';
      await this.logger.error(`Error sending message: ${message}`);
      return false;
    }
  }

  async fetchTranscript(token: string, engagementId: string): Promise<GliaTranscriptMessage[]> {
    try {
      const response = await this.gliaEngagementApi.fetchTranscript(token, engagementId);
      if (response.ok) {
        const validated = validateSchema(GliaTranscriptResponseSchema, response.payload, 'GliaTranscriptResponseSchema');
        if (validated.status) {
          return validated.output;
        }
      }
      return [];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in fetchTranscript';
      await this.logger.error(`Error in fetchTranscript: ${message}`);
      return [];
    }
  }

  async createEngagementRequest(visitorToken: string, visitorPhoneNumber: string): Promise<GliaEngagementRequestResult | null> {
    try {
      const raw = await this.gliaEngagementApi.createEngagementRequest(visitorToken, visitorPhoneNumber);
      const result = validateSchema(GliaEngagementRequestSchema, raw, 'createEngagementRequest');
      if (!result.status) {
        await this.logger.error(`createEngagementRequest: Invalid payload: ${result.message}`);
      }
      return result.status ? result.output : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in transferVisitor';
      await this.logger.error(`transferVisitor failed: ${message}`);
      return null;
    }
  }
}
