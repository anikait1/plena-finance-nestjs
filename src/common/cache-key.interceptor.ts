import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  /**
   * Generate the cache key using the following method
   * 1. Add the path to the key.
   * 2. Sort the keys and append them to the key.
   * 3. Optionally include the `userId` from the token.
   */
  trackBy(context: ExecutionContext): string | undefined {
    const request: Request = context.switchToHttp().getRequest();
    if (request.method === 'POST' || request.method === 'DELETE') {
      setTimeout(async () => {
        await this.cacheManager.reset();
      });

      return undefined;
    }

    let cacheKey = `path:${request.path}`;
    const queryParams = Object.keys(request.query);

    if (queryParams.length > 0) {
      cacheKey += ',params:';
      queryParams.sort();

      for (const param of queryParams) {
        cacheKey += `${param}=${request.query[param]}&`;
      }

      // remove the extra '&' at the end
      cacheKey = cacheKey.substring(0, cacheKey.length - 1);
    }

    const authToken = request.headers['authorization'];
    if ('userId' in request) {
      const userId = request.userId;
      cacheKey += `,user:${userId}`;
    }

    return cacheKey;
  }
}
