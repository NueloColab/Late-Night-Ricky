import { db } from './src/lib/db/index.ts'
import { siteSections } from './src/lib/db/schema.ts'
import { eq } from 'drizzle-orm'

const rows = await db.select().from(siteSections).where(eq(siteSections.page, 'showreel'))
console.log('Showreel sections:')
for (const r of rows) {
  console.log(`  section=${r.section}, id=${r.id}`)
  console.log(`  content=`, JSON.stringify(r.content).slice(0,100))
  console.log(`  videos=`, JSON.stringify(r.videos).slice(0,100))
  console.log(`  images=`, JSON.stringify(r.images).slice(0,100))
  console.log('---')
}
process.exit(0)
