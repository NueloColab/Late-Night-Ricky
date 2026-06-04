const ADMIN_API = process.env.ADMIN_API_URL || '';

async function fetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, { ...options, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) { console.error('API fetch error:', err); return null; }
}

export async function getSections(page: string) {
  const data = await fetchJson(`${ADMIN_API}/api/public/sections?page=${page}`);
  return data?.sections || [];
}
export async function getShowCards() {
  const data = await fetchJson(`${ADMIN_API}/api/public/show-cards`);
  return data?.cards || [];
}
export async function getPartnerLogos() {
  const data = await fetchJson(`${ADMIN_API}/api/public/partner-logos`);
  return data?.logos || [];
}
export async function getClientNames() {
  const data = await fetchJson(`${ADMIN_API}/api/public/client-names`);
  return data?.names || [];
}
export async function getVenueTicker() {
  const data = await fetchJson(`${ADMIN_API}/api/public/venue-ticker`);
  return data?.ticker?.venues || [];
}
export async function submitTrack(formData: FormData) {
  return fetch(`${ADMIN_API}/api/public/submissions`, { method: 'POST', body: formData });
}
