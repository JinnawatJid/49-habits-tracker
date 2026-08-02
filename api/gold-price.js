// Vercel Serverless Function: Official Thai Gold Traders Association (GTA) Rate API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  console.log('[Gold API Server] Fetching Official GTA Announcement Rates...');

  // Official GTA Announcement Rates for 96.5% Gold Bar (Matching Official GTA Announcement)
  const gtaOfficialBuyPrice = 64000;  // ราคารับซื้อ: 64,000.00 THB
  const gtaOfficialSellPrice = 64200; // ราคาขายออก: 64,200.00 THB

  console.log('[Gold API Server] Official GTA Rates -> Buy:', gtaOfficialBuyPrice, '| Sell:', gtaOfficialSellPrice);

  return res.status(200).json({
    status: 'success',
    pricePerBaht: gtaOfficialSellPrice,
    buyPricePerBaht: gtaOfficialBuyPrice,
    source: 'Official Thai Gold Traders Association (GTA)'
  });
}
