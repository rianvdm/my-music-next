// ABOUTME: Simple API route that returns "Hello World" response, demonstrating Cloudflare edge runtime integration
// ABOUTME: Template route showing how to use Cloudflare bindings like KV storage in Next.js edge functions
export const runtime = 'edge';

export async function GET() {
  const responseText = 'Hello World';

  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
  //    - https://developers.cloudflare.com/pages/functions/bindings/
  // )
  //
  // KV Example:
  // const myKv = getRequestContext().env.MY_KV_NAMESPACE
  // await myKv.put('suffix', ' from a KV store!')
  // const suffix = await myKv.get('suffix')
  // responseText += suffix

  return new Response(responseText);
}
