// src/worker/index.ts

export default {
  async fetch(): Promise<{ status: number; body: string }> {
    // This worker doesn't do anything, it just passes the request through.
    // This is just to satisfy the Cloudflare plugin requirement.
    return {
      status: 200,
      body: 'Worker is minimal.'
    };
  },
};