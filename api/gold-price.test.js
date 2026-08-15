import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from './gold-price';

describe('api/gold-price serverless function', () => {
  let req;
  let res;
  let consoleWarnSpy;

  beforeEach(() => {
    req = {};
    res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sets correct CORS and Cache-Control headers', async () => {
    fetch.mockResolvedValue({
      ok: false,
    });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  });

  it('calculates live global gold prices correctly on successful API responses', async () => {
    // Mock gold price XAU/USD = 2700, USD/THB = 35.5
    // rawThbPerBaht = 2700 * 35.5 * (15.244 / 31.1034768) * 0.965 = 45318.995...
    // calculatedSell = Math.round((45318.995 * 1.035) / 50) * 50 = Math.round(46905.16 / 50) * 50 = Math.round(938.103) * 50 = 938 * 50 = 46900
    // calculatedBuy = 46900 - 200 = 46700
    fetch.mockImplementation((url) => {
      if (url === 'https://api.gold-api.com/price/XAU') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ price: 2700 }),
        });
      }
      if (url === 'https://open.er-api.com/v6/latest/USD') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ rates: { THB: 35.5 } }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      pricePerBaht: 46900,
      buyPricePerBaht: 46700,
      isLiveGlobal: true,
      source: 'Automatic Global Market Feed (XAU/USD)',
    });
  });

  it('falls back to default GTA rates if one or both API responses are not ok', async () => {
    fetch.mockImplementation((url) => {
      if (url === 'https://api.gold-api.com/price/XAU') {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      if (url === 'https://open.er-api.com/v6/latest/USD') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ rates: { THB: 35.5 } }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      pricePerBaht: 64200,
      buyPricePerBaht: 64000,
      isLiveGlobal: false,
      source: 'Official Thai Gold Traders Association (GTA)',
    });
  });

  it('falls back to default GTA rates when network fetch throws an error', async () => {
    fetch.mockRejectedValue(new Error('Network timeout'));

    await handler(req, res);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Gold API Server] Live market fetch fallback to GTA official rates:',
      'Network timeout'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      pricePerBaht: 64200,
      buyPricePerBaht: 64000,
      isLiveGlobal: false,
      source: 'Official Thai Gold Traders Association (GTA)',
    });
  });

  it('falls back to default GTA rates if calculatedBuy is <= 30000', async () => {
    // Very low gold price yielding calculatedBuy <= 30000
    fetch.mockImplementation((url) => {
      if (url === 'https://api.gold-api.com/price/XAU') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ price: 1000 }),
        });
      }
      if (url === 'https://open.er-api.com/v6/latest/USD') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ rates: { THB: 30 } }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      pricePerBaht: 64200,
      buyPricePerBaht: 64000,
      isLiveGlobal: false,
      source: 'Official Thai Gold Traders Association (GTA)',
    });
  });

  it('falls back to default GTA rates when API response data contains non-numeric or missing fields', async () => {
    fetch.mockImplementation((url) => {
      if (url === 'https://api.gold-api.com/price/XAU') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ price: 'invalid' }),
        });
      }
      if (url === 'https://open.er-api.com/v6/latest/USD') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ rates: {} }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      pricePerBaht: 64200,
      buyPricePerBaht: 64000,
      isLiveGlobal: false,
      source: 'Official Thai Gold Traders Association (GTA)',
    });
  });
});
