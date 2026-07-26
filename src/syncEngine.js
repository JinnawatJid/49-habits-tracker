// Frictionless Multi-Device Sync Engine using Cloud Key-Value API

const SYNC_API_ENDPOINT = 'https://api.jsonbin.io/v3/b'; // Or free public KV store

// Generate a clean 6-character Sync Code (e.g. "HABIT-742")
export const generateSyncCode = () => {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `HABIT-${randomNum}`;
};

// Fetch data from Cloud by Sync Code
export const fetchCloudData = async (syncCode) => {
  try {
    const response = await fetch(`https://kv.valkey.dev/get/${syncCode}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (e) {
    // Graceful fallback if offline
    console.log('Offline or sync fallback:', e);
  }
  return null;
};

// Save data to Cloud by Sync Code
export const pushCloudData = async (syncCode, payload) => {
  try {
    await fetch(`https://kv.valkey.dev/set/${syncCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.log('Offline push fallback:', e);
  }
};
