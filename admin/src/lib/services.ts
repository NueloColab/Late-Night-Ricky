// LNR Services Catalog — Late Night Ricky specific
// No preset prices — client sets their own

export const LNR_SERVICE_CATEGORIES = [
  'Entertainment & Performance',
  'Production & Technical',
  'Brand & Partnership',
  'Creative & Consulting',
  'Expenses',
]

export const LNR_SERVICES = [
  // Entertainment & Performance
  { name: 'DJ Set', category: 'Entertainment & Performance' },
  { name: 'DJ Set — Wedding', category: 'Entertainment & Performance' },
  { name: 'DJ Set — Corporate Event', category: 'Entertainment & Performance' },
  { name: 'DJ Set — Club Night', category: 'Entertainment & Performance' },
  { name: 'DJ Set — Private Party', category: 'Entertainment & Performance' },
  { name: 'DJ Set — Festival', category: 'Entertainment & Performance' },
  { name: 'Event Hosting / MC', category: 'Entertainment & Performance' },
  { name: 'Live Performance', category: 'Entertainment & Performance' },

  // Production & Technical
  { name: 'Sound System Hire', category: 'Production & Technical' },
  { name: 'Lighting Package', category: 'Production & Technical' },
  { name: 'AV Production', category: 'Production & Technical' },
  { name: 'Stage Design', category: 'Production & Technical' },
  { name: 'Technical Rider', category: 'Production & Technical' },

  // Brand & Partnership
  { name: 'Brand Partnership', category: 'Brand & Partnership' },
  { name: 'Social Media Promotion', category: 'Brand & Partnership' },
  { name: 'Brand Ambassador', category: 'Brand & Partnership' },
  { name: 'Event Sponsorship', category: 'Brand & Partnership' },
  { name: 'Content Collaboration', category: 'Brand & Partnership' },

  // Creative & Consulting
  { name: 'Music Production', category: 'Creative & Consulting' },
  { name: 'Artist Consulting', category: 'Creative & Consulting' },
  { name: 'Event Strategy', category: 'Creative & Consulting' },
  { name: 'Playlist Curation', category: 'Creative & Consulting' },
  { name: 'Remix / Edit', category: 'Creative & Consulting' },

  // Expenses
  { name: 'Travel Expense', category: 'Expenses' },
  { name: 'Accommodation', category: 'Expenses' },
  { name: 'Catering / Rider', category: 'Expenses' },
  { name: 'Equipment Hire', category: 'Expenses' },
  { name: 'Other Expense', category: 'Expenses' },
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
