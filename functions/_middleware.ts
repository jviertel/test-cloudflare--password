import { CFP_DISALLOWED_PATHS } from './constants'; // Change to disallowed paths
import { getCookieKeyValue } from './utils';
import { getTemplate } from './template';

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
  env: { CFP_PASSWORD?: string };
}): Promise<Response> {
  const { request, next, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const { error } = Object.fromEntries(searchParams);
  const cookie = request.headers.get('cookie') || '';
  const cookieKeyValue = await getCookieKeyValue(env.CFP_PASSWORD);

  if (
    cookie.includes(cookieKeyValue) || 
    (!CFP_DISALLOWED_PATHS.includes(pathname)) || 
    !env.CFP_PASSWORD
  ) {
    // Correct hash in cookie, not in disallowed paths, or no password set.
    // Continue to next middleware.
    console.log(pathname);
    return await next();
  } else {
    // No cookie or incorrect hash in cookie, and path requires password.
    return new Response(getTemplate({ redirectPath: pathname, withError: error === '1' }), {
      headers: {
        'content-type': 'text/html',
        'cache-control': 'no-cache'
      }
    });
  }
}
