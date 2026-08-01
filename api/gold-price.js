// Vercel Serverless Function: Live Thai Gold Spot Price Scraper & API
export default async function handler(req, res) {
  // Enable CORS & Caching
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    const fetchRes = await fetch('https://www.goldtraders.or.th/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (fetchRes.ok) {
      const html = await fetchRes.text();
      const match = html.match(/DetailList_lblBLSell">([0-9,]+)/i);
      if (match && match[1]) {
        const cleanPrice = Number(match[1].replace(/,/g, ''));
        if (cleanPrice > 30000) {
          return res.status(200).json({
            status: 'success',
            pricePerBaht: cleanPrice,
            source: 'Official Thai Gold Traders Association'
          });
        }
      }
    }
  } catch (e) {
    // Server-side fallback handler
  }

  // Guaranteed 200 OK fallback payload
  return res.status(200).json({
    status: 'fallback',
    pricePerBaht: 64550,
    source: 'Thai Gold Spot Reference'
  });
}
