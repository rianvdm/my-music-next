import { renderHook, waitFor } from '@testing-library/react';
import { useRandomFact } from '../../app/hooks/useRandomFact';

// Mock fetch globally
global.fetch = jest.fn();

describe('useRandomFact', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial fact value', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useRandomFact());

    expect(result.current).toBe('Did you know');
  });

  it('fetches and returns random fact data', async () => {
    const mockFact = 'The Beatles recorded Abbey Road in 1969';

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockFact }),
    });

    const { result } = renderHook(() => useRandomFact());

    await waitFor(() => {
      expect(result.current).toBe(mockFact);
    });

    expect(fetch).toHaveBeenCalledWith('https://kv-fetch-random-fact.rian-db8.workers.dev/');
  });

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useRandomFact());

    await waitFor(() => {
      expect(result.current).toBe('Did you know? There was an error loading a random fact.');
    });
  });

  it('only fetches once on mount', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'Test fact' }),
    });

    const { rerender } = renderHook(() => useRandomFact());

    // Rerender the hook
    rerender();
    rerender();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
