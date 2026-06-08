import { db } from './db';
import {
  showCards,
  partnerLogos,
  clientNames,
  venueTicker,
  siteSections,
  tracks,
  carouselImages,
} from './db/schema';
import { eq, asc } from 'drizzle-orm';

// CMS query helpers — used by both public pages (Server Components) and API routes
// If DB is empty or unreachable, callers should fall back to hardcoded data

export async function getShowCards() {
  try {
    const cards = await db.select().from(showCards).orderBy(asc(showCards.order));
    return cards.filter(c => c.isActive !== false);
  } catch {
    return [];
  }
}

export async function getPartnerLogos() {
  try {
    const logos = await db.select().from(partnerLogos).orderBy(asc(partnerLogos.order));
    return logos.filter(l => l.isActive !== false);
  } catch {
    return [];
  }
}

export async function getClientNames() {
  try {
    const names = await db.select().from(clientNames).orderBy(asc(clientNames.order));
    return names.filter(n => n.isActive !== false);
  } catch {
    return [];
  }
}

export async function getVenueTicker() {
  try {
    const rows = await db.select().from(venueTicker);
    return rows[0]?.venues ?? [];
  } catch {
    return [];
  }
}

export async function getSiteSections(page: string) {
  try {
    const sections = await db
      .select()
      .from(siteSections)
      .where(eq(siteSections.page, page))
      .orderBy(asc(siteSections.order));
    return sections.filter(s => s.isActive !== false);
  } catch {
    return [];
  }
}

export async function getTracks() {
  try {
    const allTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.isActive, true))
      .orderBy(asc(tracks.order));
    return allTracks;
  } catch {
    return [];
  }
}

export async function getCarouselImages() {
  try {
    const images = await db
      .select()
      .from(carouselImages)
      .where(eq(carouselImages.isActive, true))
      .orderBy(asc(carouselImages.order));
    return images;
  } catch {
    return [];
  }
}
