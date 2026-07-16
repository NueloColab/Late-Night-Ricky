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
const WHITE = rgb(1, 1, 1);
const WARM_GREY = rgb(0.45, 0.42, 0.39);

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

function drawPageBackground(page: any, width: number, height: number) {
  page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE });
  // Subtle warm side accent
  page.drawRectangle({ x: 0, y: 0, width: 6, height, color: DARK_BROWN });
  // Top band
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: DARK_BROWN });
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

    drawPageBackground(page, width, height);

    // ─── Header ───
    page.drawText('LATE NIGHT RICKY', {
      x: 50, y: height - 40, size: 20, font: helveticaBold, color: CREAM,
    });
    page.drawText('International DJ & Grammy Winning Producer', {
      x: 50, y: height - 56, size: 8, font: helveticaOblique, color: GOLD,
    });

    // INVOICE label right-aligned
    page.drawText('INVOICE', {
      x: width - 150, y: height - 45, size: 28, font: helveticaBold, color: CREAM,
    });

    // Gold accent line at bottom of header band
    page.drawLine({
      start: { x: 50, y: height - 70 },
      end: { x: width - 50, y: height - 70 },
      thickness: 1.5, color: GOLD,
    });

    let y = height - 95;

    // ─── Company Details (right) ───
    const rightX = width - 220;
    let companyY = y;

    if (companyName) {
      page.drawText(companyName, {
        x: rightX, y: companyY, size: 10, font: helveticaBold, color: DARK_BROWN,
      });
      companyY -= 14;
    }
    if (companyAddress) {
      const addrLines = wrapText(companyAddress, helvetica, 8, 180);
      addrLines.slice(0, 3).forEach((line) => {
        page.drawText(line, {
          x: rightX, y: companyY, size: 8, font: helvetica, color: WARM_GREY,
        });
        companyY -= 11;
      });
    }
    if (companyNumber) {
      page.drawText(`Company No: ${companyNumber}`, {
        x: rightX, y: companyY, size: 8, font: helvetica, color: WARM_GREY,
      });
      companyY -= 11;
    }
    if (vatNumber) {
      page.drawText(`VAT No: ${vatNumber}`, {
        x: rightX, y: companyY, size: 8, font: helvetica, color: WARM_GREY,
      });
      companyY -= 11;
    }

    // ─── BILL TO (left) ───
    page.drawText('BILL TO', {
      x: 50, y, size: 7.5, font: helveticaBold, color: GOLD,
    });
    y -= 16;
    page.drawText(invoice.clientName || 'Client', {
      x: 50, y, size: 12, font: helveticaBold, color: BLACK,
    });
    y -= 14;
    if (invoice.clientCompany) {
      page.drawText(invoice.clientCompany, {
        x: 50, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      y -= 12;
    }
    if (invoice.clientEmail) {
      page.drawText(invoice.clientEmail, {
        x: 50, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      y -= 12;
    }

    // ─── Invoice Meta ───
    y = Math.min(y, companyY) - 15;

    // Thin separator
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 0.5, color: rgb(0.85, 0.82, 0.78),
    });
    y -= 15;

    // Meta grid: 2 columns
    const metaLeft = [
      { label: 'INVOICE NUMBER', value: invoice.invoiceNumber },
      { label: 'DATE ISSUED', value: formatDate(invoice.sentAt || new Date()) },
    ];
    const metaRight = [
      { label: 'DUE DATE', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt' },
      { label: 'PAYMENT TERMS', value: invoice.paymentTermsLabel || 'Net 30' },
    ];

    let metaY = y;
    for (let i = 0; i < metaLeft.length; i++) {
      page.drawText(metaLeft[i].label, {
        x: 50, y: metaY, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      page.drawText(metaLeft[i].value, {
        x: 50, y: metaY - 12, size: 10, font: helveticaBold, color: BLACK,
      });
      page.drawText(metaRight[i].label, {
        x: 300, y: metaY, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      page.drawText(metaRight[i].value, {
        x: 300, y: metaY - 12, size: 10, font: helveticaBold, color: BLACK,
      });
      metaY -= 32;
    }
    y = metaY - 5;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('PROJECT', {
        x: 50, y, size: 7, font: helveticaBold, color: GOLD,
      });
      page.drawText(invoice.projectTitle, {
        x: 50, y: y - 12, size: 10, font: helveticaBold, color: BLACK,
      });
      y -= 28;
    }

    // ─── Separator ───
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 0.5, color: rgb(0.85, 0.82, 0.78),
    });
    y -= 18;

    // ─── Line Items Table ───
    const lineItemsRaw = invoice.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table header - dark brown bar
      page.drawRectangle({
        x: 50, y: y - 18, width: width - 100, height: 20,
        color: DARK_BROWN,
      });
      page.drawText('SERVICE DESCRIPTION', {
        x: 60, y: y - 13, size: 7.5, font: helveticaBold, color: CREAM,
      });
      page.drawText('QTY', {
        x: 355, y: y - 13, size: 7.5, font: helveticaBold, color: CREAM,
      });
      page.drawText('RATE', {
        x: 400, y: y - 13, size: 7.5, font: helveticaBold, color: CREAM,
      });
      page.drawText('AMOUNT', {
        x: 465, y: y - 13, size: 7.5, font: helveticaBold, color: CREAM,
      });
      y -= 24;

      lineItems.forEach((item: any, idx: number) => {
        // Check if we need a new page
        if (y < 100) {
          page = pdfDoc.addPage([595, 842]);
          height = 842;
          drawPageBackground(page, width, height);
          y = height - 80;
        }

        const isOld = !!item.description;
        const desc = String(isOld ? item.description : item.serviceName || '').substring(0, 45);
        const category = item.serviceCategory;
        const qty = Number(isOld ? item.quantity : item.quantity || 1);
        const rate = Number(isOld ? item.rate : item.price || 0);
        const amount = Number(isOld ? item.amount : qty * rate);

        // Alternating row bg - warm cream
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 16, width: width - 100, height: 20,
            color: LIGHT_CREAM,
          });
        }

        page.drawText(desc, {
          x: 60, y, size: 9, font: helvetica, color: BLACK,
        });
        if (category) {
          page.drawText(String(category).substring(0, 30), {
            x: 60, y: y - 10, size: 7, font: helvetica, color: WARM_GREY,
          });
        }
        page.drawText(String(qty), {
          x: 355, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(rate), {
          x: 400, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(amount), {
          x: 465, y, size: 9, font: helveticaBold, color: BLACK,
        });
        y -= category ? 28 : 20;
      });

      y -= 10;
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

    // Totals box background
    const totalsBoxLines = 2 + (discountEnabled && discountAmount > 0 ? 1 : 0) + (invoice.vatEnabled && (invoice.taxRate || 0) > 0 ? 1 : 1);
    const totalsBoxHeight = totalsBoxLines * 18 + 24;
    page.drawRectangle({
      x: totalsX - 15, y: y - totalsBoxHeight + 10, width: width - totalsX + 15 - 50, height: totalsBoxHeight,
      color: LIGHT_CREAM,
    });

    page.drawText('Subtotal:', {
      x: totalsX, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    page.drawText(formatCurrency(subtotal), {
      x: totalsX + 130, y, size: 9, font: helvetica, color: BLACK,
    });
    y -= 18;

    // Discount
    if (discountEnabled && discountAmount > 0) {
      page.drawText(`${discountPercent}% Discount:`, {
        x: totalsX, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText(`-${formatCurrency(discountAmount)}`, {
        x: totalsX + 130, y, size: 9, font: helvetica, color: rgb(0.6, 0.2, 0.2),
      });
      y -= 18;
    }

    // VAT
    if (invoice.vatEnabled && (invoice.taxRate || 0) > 0) {
      const tax = Number(invoice.taxRate || 0);
      const taxAmount = (subtotal - discountAmount) * (tax / 100);
      page.drawText(`VAT (${tax}%):`, {
        x: totalsX, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText(formatCurrency(taxAmount), {
        x: totalsX + 130, y, size: 9, font: helvetica, color: BLACK,
      });
    } else {
      page.drawText('VAT:', {
        x: totalsX, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText('N/A', {
        x: totalsX + 130, y, size: 9, font: helvetica, color: WARM_GREY,
      });
    }
    y -= 18;

    // Separator line
    page.drawLine({
      start: { x: totalsX, y: y + 4 },
      end: { x: width - 50, y: y + 4 },
      thickness: 1, color: DARK_BROWN,
    });

    // Total - bold, larger
    page.drawText('TOTAL:', {
      x: totalsX, y: y - 12, size: 12, font: helveticaBold, color: DARK_BROWN,
    });
    page.drawText(formatCurrency(total), {
      x: totalsX + 130, y: y - 12, size: 12, font: helveticaBold, color: DARK_BROWN,
    });
    y -= 35;

    // ─── Payment Schedule ───
    const scheduleRaw = invoice.paymentSchedule || [];
    const schedule = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]');

    if (schedule.length > 0) {
      if (y < 180) {
        page = pdfDoc.addPage([595, 842]);
        height = 842;
        drawPageBackground(page, width, height);
        y = height - 80;
      }

      y -= 5;
      page.drawText('PAYMENT SCHEDULE', {
        x: 50, y, size: 7, font: helveticaBold, color: GOLD,
      });
      y -= 16;

      page.drawRectangle({
        x: 50, y: y - 14, width: width - 100, height: 18,
        color: DARK_BROWN,
      });
      page.drawText('INSTALLMENT', {
        x: 60, y: y - 10, size: 7, font: helveticaBold, color: CREAM,
      });
      page.drawText('%', {
        x: 260, y: y - 10, size: 7, font: helveticaBold, color: CREAM,
      });
      page.drawText('DUE', {
        x: 320, y: y - 10, size: 7, font: helveticaBold, color: CREAM,
      });
      page.drawText('AMOUNT', {
        x: 465, y: y - 10, size: 7, font: helveticaBold, color: CREAM,
      });
      y -= 18;

      schedule.forEach((item: any, idx: number) => {
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 18,
            color: LIGHT_CREAM,
          });
        }
        page.drawText(String(item.label || 'Payment'), {
          x: 60, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 260, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(String(item.due || '—'), {
          x: 320, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency((total * (item.percent || 0)) / 100), {
          x: 465, y, size: 9, font: helveticaBold, color: BLACK,
        });
        y -= 20;
      });
      y -= 10;
    }

    // ─── Bank Details ───
    if (y < 220) {
      page = pdfDoc.addPage([595, 842]);
      height = 842;
      drawPageBackground(page, width, height);
      y = height - 80;
    }

    y -= 5;
    page.drawText('BANK DETAILS FOR PAYMENT', {
      x: 50, y, size: 7, font: helveticaBold, color: GOLD,
    });
    y -= 16;

    // Bank details background block - cream with left brown border
    const bankLines = 4 + (swiftCode ? 1 : 0) + (iban ? 1 : 0);
    const bankBlockH = bankLines * 15 + 20;
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: width - 100, height: bankBlockH,
      color: LIGHT_CREAM,
    });
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: 3, height: bankBlockH,
      color: GOLD,
    });

    const bankX = 65;
    page.drawText('Bank:', {
      x: bankX, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    page.drawText(bankName, {
      x: bankX + 100, y, size: 9, font: helveticaBold, color: BLACK,
    });
    y -= 15;
    page.drawText('Account Name:', {
      x: bankX, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    page.drawText(bankAccountName, {
      x: bankX + 100, y, size: 9, font: helveticaBold, color: BLACK,
    });
    y -= 15;
    page.drawText('Sort Code:', {
      x: bankX, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    page.drawText(bankSortCode, {
      x: bankX + 100, y, size: 9, font: helveticaBold, color: BLACK,
    });
    y -= 15;
    page.drawText('Account No:', {
      x: bankX, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    page.drawText(bankAccountNumber, {
      x: bankX + 100, y, size: 9, font: helveticaBold, color: BLACK,
    });
    y -= 15;
    if (swiftCode) {
      page.drawText('SWIFT:', {
        x: bankX, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText(swiftCode, {
        x: bankX + 100, y, size: 9, font: helveticaBold, color: BLACK,
      });
      y -= 15;
    }
    if (iban) {
      page.drawText('IBAN:', {
        x: bankX, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText(iban, {
        x: bankX + 100, y, size: 9, font: helveticaBold, color: BLACK,
      });
      y -= 15;
    }
    y -= 15;

    // ─── Notes & Terms ───
    if (invoice.notes) {
      if (y < 140) {
        page = pdfDoc.addPage([595, 842]);
        height = 842;
        drawPageBackground(page, width, height);
        y = height - 80;
      }
      page.drawText('NOTES & TERMS', {
        x: 50, y, size: 7, font: helveticaBold, color: GOLD,
      });
      y -= 14;

      const notesText = String(invoice.notes);
      const maxWidth = width - 100;
      const lines = wrapText(notesText, helvetica, 9, maxWidth);
      lines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 50, y, size: 9, font: helvetica, color: WARM_GREY });
        y -= 13;
      });
      y -= 10;
    }

    // ─── Footer ───
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      height = 842;
      drawPageBackground(page, width, height);
      y = height - 80;
    }

    // Footer band
    page.drawRectangle({
      x: 0, y: 35, width, height: 40,
      color: DARK_BROWN,
    });
    page.drawText(`${companyName}  |  International DJ & Grammy Winning Producer  |  Payment is due by the date specified above`, {
      x: 50, y: 57, size: 7, font: helvetica, color: CREAM,
    });
    page.drawText('latenightricky@gmail.com', {
      x: 50, y: 45, size: 7, font: helvetica, color: GOLD,
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