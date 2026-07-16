import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// LNR brand colours
const DARK_BROWN = rgb(0.165, 0.102, 0.039);    // #2a1a0a
const CREAM = rgb(0.910, 0.831, 0.722);          // #e8d4b8
const MEDIUM_BROWN = rgb(0.353, 0.227, 0.102); // #5a3a1a
const LIGHT_CREAM = rgb(0.941, 0.902, 0.847);   // #f0e6d8
const GOLD = rgb(0.788, 0.663, 0.431);           // #c9a96e
const BLACK = rgb(0.067, 0.067, 0.067);
const GREY = rgb(0.4, 0.4, 0.4);

async function getSettings() {
  try {
    const { siteSections } = await import('@/lib/db/schema');
    const rows = await db
      .select()
      .from(siteSections)
      .where(and(eq(siteSections.page, 'global'), eq(siteSections.section, 'settings')))
      .limit(1);
    if (rows.length > 0 && rows[0].content) {
      const parsed = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
      return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0);
}

function formatDate(dateStr: string | Date | null | undefined) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

function sanitizePdfText(text: string | null | undefined): string {
  if (!text) return '';
  // WinAnni (Helvetica) cannot encode newlines, tabs, or control characters
  return String(text).replace(/[\r\n\t]/g, ' ').replace(/[^\x20-\xFF]/g, '');
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, Number(params.id)));
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Sanitize all text fields — WinAnni fonts (Helvetica) cannot encode newlines or control chars
    const s = sanitizePdfText;
    invoice.clientName = s(invoice.clientName);
    invoice.clientEmail = s(invoice.clientEmail);
    invoice.clientCompany = s(invoice.clientCompany);
    invoice.projectTitle = s(invoice.projectTitle);
    invoice.invoiceNumber = s(invoice.invoiceNumber);
    invoice.notes = s(invoice.notes);
    invoice.paymentTermsLabel = s(invoice.paymentTermsLabel);
    invoice.dueDate = s(invoice.dueDate);

    const settings = await getSettings();
    const bankName = s(settings.bankName) || 'Tide';
    const bankAccountName = s(settings.bankAccountName) || 'Late Night Ricky';
    const bankSortCode = s(settings.bankSortCode) || '04-06-05';
    const bankAccountNumber = s(settings.bankAccountNumber) || '23690693';
    const companyName = s(settings.companyName) || 'Fricktion Music Ltd';
    const companyAddress = s(settings.companyAddress) || '';
    const companyNumber = s(settings.companyNumber) || '';
    const vatNumber = s(settings.vatNumber) || '';
    const swiftCode = s(settings.swiftCode) || '';
    const iban = s(settings.iban) || '';

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    const { width } = page.getSize();
    let height = 842;

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // ─── Background ───
    page.drawRectangle({
      x: 0, y: 0, width, height,
      color: LIGHT_CREAM,
    });

    // ─── Header band (dark brown) ───
    page.drawRectangle({
      x: 0, y: height - 140, width, height: 140,
      color: DARK_BROWN,
    });

    // Logo text
    page.drawText('LATE NIGHT RICKY', {
      x: 50, y: height - 55, size: 22, font: helveticaBold, color: CREAM,
    });
    page.drawText('International DJ & Grammy Winning Producer', {
      x: 50, y: height - 78, size: 9, font: helveticaOblique, color: GOLD,
    });

    // INVOICE label (right side)
    page.drawText('INVOICE', {
      x: width - 140, y: height - 55, size: 26, font: helveticaBold, color: CREAM,
    });

    // Decorative line under header
    page.drawLine({
      start: { x: 50, y: height - 110 },
      end: { x: width - 50, y: height - 110 },
      thickness: 1, color: GOLD,
    });

    let y = height - 155;

    // ─── COMPANY DETAILS (right column, top) ───
    const metaX = width - 220;
    let metaY = height - 155;

    if (companyName) {
      page.drawText(companyName, {
        x: metaX, y: metaY, size: 11, font: helveticaBold, color: BLACK,
      });
      metaY -= 16;
    }
    if (companyAddress) {
      const addrLines = wrapText(companyAddress, helvetica, 9, 180);
      addrLines.slice(0, 3).forEach((line) => {
        page.drawText(line, {
          x: metaX, y: metaY, size: 9, font: helvetica, color: GREY,
        });
        metaY -= 12;
      });
    }
    if (companyNumber) {
      page.drawText(`Company No: ${companyNumber}`, {
        x: metaX, y: metaY, size: 9, font: helvetica, color: GREY,
      });
      metaY -= 14;
    }
    if (vatNumber) {
      page.drawText(`VAT No: ${vatNumber}`, {
        x: metaX, y: metaY, size: 9, font: helvetica, color: GREY,
      });
      metaY -= 14;
    }
    metaY -= 8;

    // ─── BILL TO ───
    page.drawText('BILL TO', {
      x: 50, y, size: 9, font: helveticaBold, color: MEDIUM_BROWN,
    });
    y -= 18;
    page.drawText(invoice.clientName || 'Client', {
      x: 50, y, size: 13, font: helveticaBold, color: BLACK,
    });
    y -= 16;
    if (invoice.clientCompany) {
      page.drawText(invoice.clientCompany, {
        x: 50, y, size: 10, font: helvetica, color: GREY,
      });
      y -= 14;
    }
    if (invoice.clientEmail) {
      page.drawText(invoice.clientEmail, {
        x: 50, y, size: 10, font: helvetica, color: GREY,
      });
      y -= 14;
    }

    // ─── Invoice Meta (right column, below company) ───
    const metaItems = [
      { label: 'DATE ISSUED', value: formatDate(invoice.sentAt || new Date()) },
      { label: 'DUE DATE', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt' },
      { label: 'PAYMENT TERMS', value: invoice.paymentTermsLabel || 'Net 30' },
      { label: 'INVOICE NUMBER', value: invoice.invoiceNumber },
    ];

    metaItems.forEach((item) => {
      page.drawText(item.label, {
        x: metaX, y: metaY, size: 8, font: helveticaBold, color: MEDIUM_BROWN,
      });
      page.drawText(item.value, {
        x: metaX + 110, y: metaY, size: 10, font: helveticaBold, color: BLACK,
      });
      metaY -= 18;
    });

    y = Math.min(y, metaY) - 20;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('PROJECT', {
        x: 50, y, size: 9, font: helveticaBold, color: MEDIUM_BROWN,
      });
      page.drawText(invoice.projectTitle, {
        x: 110, y, size: 11, font: helveticaBold, color: BLACK,
      });
      y -= 22;
    }

    // ─── Separator ───
    y -= 8;
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 0.5, color: GOLD,
    });
    y -= 22;

    // ─── Line Items Table ───
    const lineItemsRaw = invoice.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table header
      page.drawRectangle({
        x: 50, y: y - 5, width: width - 100, height: 24,
        color: DARK_BROWN,
      });
      page.drawText('SERVICE DESCRIPTION', {
        x: 60, y: y, size: 9, font: helveticaBold, color: CREAM,
      });
      page.drawText('QTY', {
        x: 350, y, size: 9, font: helveticaBold, color: CREAM,
      });
      page.drawText('RATE', {
        x: 400, y, size: 9, font: helveticaBold, color: CREAM,
      });
      page.drawText('AMOUNT', {
        x: 470, y, size: 9, font: helveticaBold, color: CREAM,
      });
      y -= 32;

      lineItems.forEach((item: any, idx: number) => {
        const isOld = !!item.description;
        const desc = String(isOld ? item.description : item.serviceName || '').substring(0, 45);
        const category = item.serviceCategory;
        const qty = Number(isOld ? item.quantity : item.quantity || 1);
        const rate = Number(isOld ? item.rate : item.price || 0);
        const amount = Number(isOld ? item.amount : qty * rate);

        // Alternating row bg
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 4, width: width - 100, height: 22,
            color: rgb(0.95, 0.92, 0.88),
          });
        }

        page.drawText(desc, {
          x: 60, y, size: 10, font: helvetica, color: BLACK,
        });
        if (category) {
          page.drawText(category, {
            x: 60, y: y - 11, size: 8, font: helvetica, color: GREY,
          });
        }
        page.drawText(String(qty), {
          x: 350, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(rate), {
          x: 400, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(amount), {
          x: 470, y, size: 10, font: helveticaBold, color: BLACK,
        });
        y -= 24;
      });

      y -= 12;
    }

    // ─── Totals ───
    const totalsX = width - 230;
    const subtotal = Number(invoice.subtotal || 0);
    const total = Number(invoice.total || 0);

    // Get discount info
    const discountRaw = invoice.discount || {};
    const discount = typeof discountRaw === 'string' ? JSON.parse(discountRaw) : discountRaw;
    const discountEnabled = discount?.enabled || false;
    const discountPercent = discount?.percent || 0;
    const discountAmount = discountEnabled ? (subtotal * discountPercent) / 100 : 0;

    // Subtotal
    page.drawText('Subtotal:', {
      x: totalsX, y, size: 10, font: helveticaBold, color: GREY,
    });
    page.drawText(formatCurrency(subtotal), {
      x: totalsX + 130, y, size: 10, font: helveticaBold, color: BLACK,
    });
    y -= 18;

    // Discount
    if (discountEnabled && discountAmount > 0) {
      page.drawText(`${discountPercent}% Discount:`, {
        x: totalsX, y, size: 10, font: helveticaBold, color: GREY,
      });
      page.drawText(`-${formatCurrency(discountAmount)}`, {
        x: totalsX + 130, y, size: 10, font: helveticaBold, color: rgb(0.6, 0.2, 0.2),
      });
      y -= 18;
    }

    // VAT
    if (invoice.vatEnabled && (invoice.taxRate || 0) > 0) {
      const tax = Number(invoice.taxRate || 0);
      const taxAmount = (subtotal - discountAmount) * (tax / 100);
      page.drawText(`VAT (${tax}%):`, {
        x: totalsX, y, size: 10, font: helveticaBold, color: GREY,
      });
      page.drawText(formatCurrency(taxAmount), {
        x: totalsX + 130, y, size: 10, font: helveticaBold, color: BLACK,
      });
      y -= 18;
    } else {
      page.drawText('VAT:', {
        x: totalsX, y, size: 10, font: helveticaBold, color: GREY,
      });
      page.drawText('N/A', {
        x: totalsX + 130, y, size: 10, font: helveticaBold, color: GREY,
      });
      y -= 18;
    }

    // Separator
    page.drawLine({
      start: { x: totalsX, y: y + 4 },
      end: { x: width - 50, y: y + 4 },
      thickness: 1, color: DARK_BROWN,
    });
    y -= 4;

    // Total
    page.drawText('TOTAL:', {
      x: totalsX, y, size: 14, font: helveticaBold, color: DARK_BROWN,
    });
    page.drawText(formatCurrency(total), {
      x: totalsX + 130, y, size: 14, font: helveticaBold, color: DARK_BROWN,
    });
    y -= 30;

    // ─── Payment Schedule ───
    const scheduleRaw = invoice.paymentSchedule || [];
    const schedule = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]');

    if (schedule.length > 0) {
      y -= 10;
      page.drawText('PAYMENT SCHEDULE', {
        x: 50, y, size: 9, font: helveticaBold, color: MEDIUM_BROWN,
      });
      y -= 18;

      page.drawRectangle({
        x: 50, y: y - 5, width: width - 100, height: 22,
        color: DARK_BROWN,
      });
      page.drawText('INSTALLMENT', {
        x: 60, y, size: 9, font: helveticaBold, color: CREAM,
      });
      page.drawText('%', {
        x: 240, y, size: 9, font: helveticaBold, color: CREAM,
      });
      page.drawText('DUE', {
        x: 300, y, size: 9, font: helveticaBold, color: CREAM,
      });
      page.drawText('AMOUNT', {
        x: 470, y, size: 9, font: helveticaBold, color: CREAM,
      });
      y -= 28;

      schedule.forEach((item: any, idx: number) => {
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 4, width: width - 100, height: 20,
            color: rgb(0.95, 0.92, 0.88),
          });
        }
        page.drawText(String(item.label || 'Payment'), {
          x: 60, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 240, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(String(item.due || '—'), {
          x: 300, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency((total * (item.percent || 0)) / 100), {
          x: 470, y, size: 10, font: helveticaBold, color: BLACK,
        });
        y -= 22;
      });
      y -= 12;
    }

    // ─── Bank Details ───
    if (y < 240) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: LIGHT_CREAM });
      y = 780;
      height = 842;
    }

    y -= 10;
    page.drawText('BANK DETAILS FOR PAYMENT', {
      x: 50, y, size: 9, font: helveticaBold, color: MEDIUM_BROWN,
    });
    y -= 18;

    // Bank details background block
    const bankBlockHeight = 14 * (4 + (swiftCode ? 1 : 0) + (iban ? 1 : 0)) + 16;
    page.drawRectangle({
      x: 50, y: y - bankBlockHeight + 10, width: width - 100, height: bankBlockHeight,
      color: rgb(0.941, 0.902, 0.847),
    });

    page.drawText(`Bank: ${bankName}`, {
      x: 60, y, size: 10, font: helvetica, color: BLACK,
    });
    y -= 14;
    page.drawText(`Account Name: ${bankAccountName}`, {
      x: 60, y, size: 10, font: helvetica, color: BLACK,
    });
    y -= 14;
    page.drawText(`Sort Code: ${bankSortCode}`, {
      x: 60, y, size: 10, font: helvetica, color: BLACK,
    });
    y -= 14;
    page.drawText(`Account No: ${bankAccountNumber}`, {
      x: 60, y, size: 10, font: helvetica, color: BLACK,
    });
    y -= 14;
    if (swiftCode) {
      page.drawText(`SWIFT: ${swiftCode}`, {
        x: 60, y, size: 10, font: helvetica, color: BLACK,
      });
      y -= 14;
    }
    if (iban) {
      page.drawText(`IBAN: ${iban}`, {
        x: 60, y, size: 10, font: helvetica, color: BLACK,
      });
      y -= 14;
    }
    y -= 10;

    // ─── Notes & Terms ───
    if (invoice.notes) {
      if (y < 140) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: LIGHT_CREAM });
        y = 780;
        height = 842;
      }
      page.drawText('NOTES & TERMS', {
        x: 50, y, size: 9, font: helveticaBold, color: MEDIUM_BROWN,
      });
      y -= 16;

      const notesText = String(invoice.notes);
      const maxWidth = width - 100;
      const lines = wrapText(notesText, helvetica, 9, maxWidth);
      lines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 50, y, size: 9, font: helvetica, color: GREY });
        y -= 13;
      });
      y -= 10;
    }

    // ─── Footer ───
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: LIGHT_CREAM });
      y = 780;
      height = 842;
    }
    const footerY = 60;
    page.drawLine({
      start: { x: 50, y: footerY + 25 },
      end: { x: width - 50, y: footerY + 25 },
      thickness: 0.5, color: GOLD,
    });
    page.drawText(`${companyName} · International DJ & Grammy Winning Producer · Payment is due by the date specified above. Thank you for your business.`, {
      x: 50, y: footerY + 8, size: 8, font: helvetica, color: GREY,
    });
    page.drawText('Contact: latenightricky@gmail.com', {
      x: 50, y: footerY - 6, size: 8, font: helvetica, color: GREY,
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LNR-Invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Invoice PDF error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
