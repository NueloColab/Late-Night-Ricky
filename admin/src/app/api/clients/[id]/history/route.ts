import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients, quotes, invoices } from '@/lib/db/schema'
import { eq, or, ilike } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const [client] = await db.select().from(clients).where(eq(clients.id, id))
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Find quotes for this client (by name or email)
    const clientQuotes = await db.select().from(quotes).where(
      or(
        client.email ? ilike(quotes.clientEmail, client.email) : undefined,
        ilike(quotes.clientName, client.name)
      )
    ).orderBy(quotes.createdAt)

    // Find invoices for this client (by name or email)
    const clientInvoices = await db.select().from(invoices).where(
      or(
        client.email ? ilike(invoices.clientEmail, client.email) : undefined,
        ilike(invoices.clientName, client.name)
      )
    ).orderBy(invoices.createdAt)

    return NextResponse.json({
      client,
      quotes: clientQuotes,
      invoices: clientInvoices,
    })
  } catch (err) {
    console.error('Client history GET error:', err)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
