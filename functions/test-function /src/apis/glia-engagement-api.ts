import type { FunctionConfig, HttpResponse, LoggerInterface, UnknownResponse } from '../types';

import { HttpRequest } from './http-request';

export class GliaEngagementApi {
  private httpRequest: HttpRequest;

  constructor(
    private config: FunctionConfig,
    logger: LoggerInterface,
  ) {
    this.httpRequest = new HttpRequest(config, logger);
  }

  fetchEngagementDetails(token: string, engagementId: string): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('authorization', `Bearer ${token}`);

    const requestOptions = {
      headers,
      method: 'GET',
    };

    const url = `${this.config.glia.apiDomain}/engagements/${engagementId}`;
    return this.httpRequest.fetchWithRetry<UnknownResponse>(url, requestOptions, 'fetchEngagementDetails');
  }

  async sendMessage(token: string, engagementId: string, message: string): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);

    const body = {
      attachment: {
        content: `<speak>${message}</speak>`,
        type: 'ssml',
      },
      content: '',
      type: 'chat',
    };

    const requestOptions = {
      body: JSON.stringify(body),
      headers,
      method: 'PUT',
    };

    return this.httpRequest.fetchWithRetry<UnknownResponse>(
      `${this.config.glia.apiDomain}/engagements/${engagementId}/chat_messages/${this.generateUuid()}`,
      requestOptions,
      'sendMessage',
    );
  }

  async createEngagementRequest(visitorToken: string, visitorPhoneNumber: string): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${visitorToken}`);
    headers.append('Accept', 'application/vnd.salemove.v1+json');
    headers.append('Content-Type', 'application/json');

    const requestOptions = {
      body: JSON.stringify({
        media: 'phone',
        media_options: {
          one_way: true,
          phone_number: visitorPhoneNumber,
        },
        operator_id: '',
        site_id: this.config.glia.siteId,
        source: 'visitor_integrator',
      }),
      headers,
      method: 'POST',
    };

    const url = `${this.config.glia.apiDomain}/engagement_requests`;

    return this.httpRequest.fetchWithRetry<UnknownResponse>(url, requestOptions, 'createEngagementRequest');
  }

  private generateUuid() {
    return crypto.randomUUID();
  }
}
