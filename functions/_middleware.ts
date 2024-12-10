import { getCookieKeyValue } from './utils';
import { getTemplate } from './template';

export async function onRequest(context: { request: Request; next: () => Promise<Response>; env: { CFP_PASSWORD?: string }; }): Promise<Response> {
  const { request, next, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const { error } = Object.fromEntries(searchParams);
  const cookie = request.headers.get('cookie') || '';
  const cookieKeyValue = await getCookieKeyValue(env.CFP_PASSWORD);

  if (
    pathname === '/about' && // Only protect the /about page
    !(cookie.includes(cookieKeyValue)) && // Check if cookie exists
    env.CFP_PASSWORD // Ensure password is set in environment
  ) {
    // Redirect to login if no valid cookie for /about
    return new Response(getTemplate({ redirectPath: pathname, withError: error === '1' }), {
      headers: {
        'content-type': 'text/html',
        'cache-control': 'no-cache'
      }
    });
  } else {
    // Allow access to all other pages
    return await next();
  }
}
