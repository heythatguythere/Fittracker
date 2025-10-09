// src/worker/index.ts

export default {
  // Use loose types to avoid build-time DOM lib requirements
  async fetch(): Promise<any> {
    // Minimal worker response
    return new (globalThis as any).Response('Worker is minimal.');
  },
} as any;