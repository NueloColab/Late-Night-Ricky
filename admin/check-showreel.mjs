import { db } from './src/lib/db/index.ts'
import { siteSections } from './src/lib/db/schema.ts'
import { eq } from 'drizzle-orm'

const rows = await db.select().from(siteSections).where(eq(siteSections.page, 'showreel'))
console.log(JSON.stringify(rows, null, 2))
process.exit(0)
