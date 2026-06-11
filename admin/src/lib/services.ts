// LNR Services Catalog — Late Night Ricky specific
// Adapted from project services model: { name, status, fee }

export const LNR_SERVICE_CATEGORIES = [
  'Entertainment & Performance',
  'Production & Technical',
  'Brand & Partnership',
  'Creative & Consulting',
]

export const LNR_SERVICES = [
  // Entertainment & Performance
  { name: 'DJ Set — Wedding', category: 'Entertainment & Performance', price: 1500 },
  { name: 'DJ Set — Corporate Event', category: 'Entertainment & Performance', price: 2000 },
  { name: 'DJ Set — Club Night', category: 'Entertainment & Performance', price: 800 },
  { name: 'DJ Set — Private Party', category: 'Entertainment & Performance', price: 1200 },
  { name: 'DJ Set — Festival', category: 'Entertainment & Performance', price: 3000 },
  { name: 'Event Hosting / MC', category: 'Entertainment & Performance', price: 500 },
  { name: 'Live Performance', category: 'Entertainment & Performance', price: 2500 },

  // Production & Technical
  { name: 'Sound System Hire', category: 'Production & Technical', price: 600 },
  { name: 'Lighting Package', category: 'Production & Technical', price: 400 },
  { name: 'AV Production', category: 'Production & Technical', price: 1500 },
  { name: 'Stage Design', category: 'Production & Technical', price: 2000 },
  { name: 'Technical Rider', category: 'Production & Technical', price: 300 },

  // Brand & Partnership
  { name: 'Brand Partnership', category: 'Brand & Partnership', price: 5000 },
  { name: 'Social Media Promotion', category: 'Brand & Partnership', price: 1000 },
  { name: 'Brand Ambassador', category: 'Brand & Partnership', price: 3500 },
  { name: 'Event Sponsorship', category: 'Brand & Partnership', price: 7500 },
  { name: 'Content Collaboration', category: 'Brand & Partnership', price: 2000 },

  // Creative & Consulting
  { name: 'Music Production', category: 'Creative & Consulting', price: 3000 },
  { name: 'Artist Consulting', category: 'Creative & Consulting', price: 1500 },
  { name: 'Event Strategy', category: 'Creative & Consulting', price: 2500 },
  { name: 'Playlist Curation', category: 'Creative & Consulting', price: 500 },
  { name: 'Remix / Edit', category: 'Creative & Consulting', price: 800 },
]

export function getServicesByCategory(category: string) {
  return LNR_SERVICES.filter((s) => s.category === category)
}

export function getServicesGrouped() {
  const grouped: Record<string, typeof LNR_SERVICES> = {}
  for (const cat of LNR_SERVICE_CATEGORIES) {
    grouped[cat] = LNR_SERVICES.filter((s) => s.category === cat)
  }
  return grouped
}
