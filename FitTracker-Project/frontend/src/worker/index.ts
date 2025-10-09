// src/worker/index.ts

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // This worker doesn't do anything, it just passes the request through.
    // This is just to satisfy the Cloudflare plugin requirement.
    return new Response('Worker is minimal.');
  },
};