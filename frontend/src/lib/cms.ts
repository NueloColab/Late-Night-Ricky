// CMS lib stub — the test pages import from here
// The real CMS backend runs separately at ADMIN_API_URL

const ADMIN_API = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.ADMIN_API_URL || 'http://localhost:3001';

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' as RequestCache });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('CMS fetch error:', err);
    return null;
  }
}

export async function getSeoMeta(page: string) {
  const data = await fetchJson(`${ADMIN_API}/api/public/sections?page=${page}&section=seo`);
  return data;
}

export async function getFavicon() {
  const data = await fetchJson(`${ADMIN_API}/api/public/sections?page=global&section=favicon`);
  return data?.favicon || '/assets/ricky-logo.png';
}