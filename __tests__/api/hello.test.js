// Mock the Cloudflare context before importing
jest.mock(
  '@cloudflare/next-on-pages',
  () => ({
    getRequestContext: jest.fn(() => ({
      env: {
        MY_KV_NAMESPACE: {
          get: jest.fn(),
          put: jest.fn(),
        },
      },
    })),
  }),
  { virtual: true }
);

import { GET } from '../../app/api/hello/route';

describe('/api/hello', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns Hello World response', async () => {
    const mockRequest = new Request('http://localhost:3000/api/hello');

    const response = await GET(mockRequest);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('Hello World');
  });

  it('returns a Response object', async () => {
    const mockRequest = new Request('http://localhost:3000/api/hello');

    const response = await GET(mockRequest);

    expect(response).toBeInstanceOf(Response);
  });
});
