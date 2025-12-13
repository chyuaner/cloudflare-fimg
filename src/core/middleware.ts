
export type Next = () => Promise<Response>;

export type Middleware = (
  request: Request,
  next: Next
) => Promise<Response>;

/**
 * Runner to execute a stack of middlewares in order.
 */
export async function runMiddlewares(
  request: Request,
  middlewares: Middleware[],
  handler: () => Promise<Response>
): Promise<Response> {
  const runner = async (index: number): Promise<Response> => {
    if (index >= middlewares.length) {
      return handler();
    }
    const middleware = middlewares[index];
    return middleware(request, () => runner(index + 1));
  };
  return runner(0);
}

/**
 * Middleware to handle Cross-Origin Resource Sharing (CORS).
 * Handles preflight OPTIONS requests and adds CORS headers to responses.
 */
export const corsMiddleware: Middleware = async (request, next) => {
  // Handle Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await next();

  // Clone response to ensure headers are mutable (sometimes required depending on Response origin)
  // But usually we can just set headers. If it fails, we might need to recreate the response.
  // For standard Fetch Response, headers are mutable.
  response.headers.set('Access-Control-Allow-Origin', '*');

  return response;
};

/**
 * Middleware to set Cache-Control headers.
 * Sets 'public, max-age=3600' for successful (200) responses.
 */
export const cacheControlMiddleware: Middleware = async (request, next) => {
  const response = await next();
  
  if (response.status === 200) {
    // Force set for now to ensure it works, or change logic to overwrite if needed
    // The previous check `!response.headers.has('Cache-Control')` might be failing if ImageResponse sets a default.
    response.headers.set('Cache-Control', 'public, max-age=3600');
  }
  
  return response;
};
