import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const quote = await db.select().from(quotes).where(eq(quotes.id, Number(params.id))).get();
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const navy = rgb(0.106, 0.227, 0.298); // #1B3A4C
    const grey = rgb(0.557, 0.659, 0.745); // #8FA8BE
    const black = rgb(0.067, 0.067, 0.067);
    const lightGrey = rgb(0.89, 0.91, 0.93); // #E3E8ED

    // Header
    page.drawText('LATE NIGHT RICKY', {
      x: 50, y: height - 60, size: 24, font: fontBold, color: navy,
    });
    page.drawText('QUOTE', {
      x: width - 120, y: height - 60, size: 14, font: fontBold, color: grey,
    });
    page.drawLine({ start: { x: 50, y: height - 80 }, end: { x: width - 50, y: height - 80 }, thickness: 1, color: lightGrey });

    // Quote details
    let y = height - 120;
    page.drawText(`Quote #${quote.id}`, { x: 50, y, size: 12, font: fontBold, color: black });
    y -= 22;
    page.drawText(`Date: ${new Date().toLocaleDateString('en-GB')}`, { x: 50, y, size: 10, font, color: grey });
    if (quote.status) {
      y -= 18;
      page.drawText(`Status: ${quote.status.toUpperCase()}`, { x: 50, y, size: 10, font, color: navy });
    }

    // Line items table
    y -= 50;
    const lineItemsRaw = quote.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw) ? lineItemsRaw : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');
    
    if (lineItems.length > 0) {
      // Table header
      page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 22, color: navy });
      page.drawText('Description', { x: 60, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Qty', { x: 350, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Rate', { x: 410, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Amount', { x: 480, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
      y -= 30;

      lineItems.forEach((item: any) => {
        const desc = String(item.description || '').substring(0, 45);
        const qty = Number(item.quantity || 0);
        const rate = Number(item.rate || 0);
        const amount = Number(item.amount || qty * rate);
        page.drawText(desc, { x: 60, y, size: 10, font, color: black });
        page.drawText(String(qty), { x: 350, y, size: 10, font, color: black });
        page.drawText(`£${rate.toLocaleString()}`, { x: 410, y, size: 10, font, color: black });
        page.drawText(`£${amount.toLocaleString()}`, { x: 480, y, size: 10, font, color: black });
        y -= 20;
      });

      y -= 20;
      page.drawLine({ start: { x: 350, y }, end: { x: width - 50, y }, thickness: 1, color: lightGrey });
      y -= 20;
      page.drawText('Subtotal', { x: 350, y, size: 10, font: fontBold, color: black });
      page.drawText(`£${Number(quote.subtotal).toLocaleString()}`, { x: 480, y, size: 10, font: fontBold, color: black });
      y -= 20;
      page.drawText('Total', { x: 350, y, size: 12, font: fontBold, color: navy });
      page.drawText(`£${Number(quote.total).toLocaleString()}`, { x: 480, y, size: 12, font: fontBold, color: navy });
    }

    // Footer
    page.drawLine({ start: { x: 50, y: 80 }, end: { x: width - 50, y: 80 }, thickness: 1, color: lightGrey });
    page.drawText('Late Night Ricky · International DJ & Grammy Winning Producer', {
      x: 50, y: 60, size: 9, font, color: grey,
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Quote PDF error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
