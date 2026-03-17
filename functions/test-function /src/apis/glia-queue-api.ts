import type { FunctionConfig, HttpResponse, LoggerInterface, UnknownResponse } from '../types';

import { HttpRequest } from './http-request';

export class GliaQueueApi {
  private gliaConfig: FunctionConfig['glia'];

  private httpRequest: HttpRequest;

  constructor(config: FunctionConfig, logger: LoggerInterface) {
    this.gliaConfig = config.glia;
    this.httpRequest = new HttpRequest(config, logger);
  }

  async createQueueTicket(visitorToken: string, siteToken: string, testingPhoneNumber: string): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${visitorToken}`);
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
      media: 'phone',
      media_options: {
        one_way: true,
        phone_number: testingPhoneNumber,
      },
      queue_ids: ['253478f1-62e4-47a4-988f-fe4e7f97bff3'],
      site_id: this.gliaConfig.siteId,
      source: 'visitor_integrator',
      webhooks: [
        {
          events: ['engagement.start', 'engagement.end', 'engagement.request.failure'],
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
