/**
 * This file is used to wrap the onInvoke function
 * and provide the kvStoreFactory to the onInvoke function
 * during the local development process.
 */
import { onInvoke } from './src/function';

export default {
  async fetch(request: Request, environment: Record<string, unknown>): Promise<Response> {
    return onInvoke(request, environment);
  },
};
