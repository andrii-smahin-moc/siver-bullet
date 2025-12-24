import type { FunctionConfig, HttpResponse, LoggerInterface, UnknownResponse } from '../types';

import { HttpRequest } from './http-request';

export class GliaQueueApi {
  private gliaConfig: FunctionConfig['glia'];

  private httpRequest: HttpRequest;

  constructor(config: FunctionConfig, logger: LoggerInterface) {
    this.gliaConfig = config.glia;
    this.httpRequest = new HttpRequest(config, logger);
  }

  async createQueueTicket(visitorToken: string, siteToken: string, destinationQueueId: string): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${visitorToken}`);
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
      media: 'text',
      queue_ids: [destinationQueueId],
      site_id: this.gliaConfig.siteId,
      source: 'visitor_integrator',
      webhooks: [
        {
          events: ['engagement.start', 'engagement.end', 'engagement.request.failure', 'engagement.chat.message'],
          headers: {
            Authorization: `Bearer ${siteToken}`,
          },
          method: 'POST',
          url: this.gliaConfig.webhookUrl,
        },
      ],
    });

    const requestOptions = {
      body,
      headers,
      method: 'POST',
    };

    const url = `${this.gliaConfig.apiDomain}/queue_tickets`;
    return this.httpRequest.fetchWithRetry<UnknownResponse>(url, requestOptions, 'createQueueTicket');
  }
}
