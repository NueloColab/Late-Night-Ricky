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
const PALE_CREAM = rgb(0.97, 0.95, 0.92);       // #f7f2eb

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
  // Clean white background
  page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE });
  // Left accent stripe
  page.drawRectangle({ x: 0, y: 0, width: 5, height, color: DARK_BROWN });
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, Number(params.id)));
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
    const height = 842;
    let y = height;

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    drawPageBackground(page, width, height);

    // ─── TOP HEADER BAND ───
    // Dark brown band - 100px tall
    page.drawRectangle({
      x: 0, y: height - 100, width, height: 100,
      color: DARK_BROWN,
    });

    // Company name (left)
    page.drawText('LATE NIGHT RICKY', {
      x: 50, y: height - 38, size: 20, font: helveticaBold, color: CREAM,
    });
    page.drawText('International DJ & Grammy Winning Producer', {
      x: 50, y: height - 56, size: 8, font: helveticaOblique, color: GOLD,
    });
    page.drawText(companyName, {
      x: 50, y: height - 72, size: 7, font: helvetica, color: rgb(0.75, 0.68, 0.55),
    });

    // INVOICE label (right side of header)
    page.drawText('INVOICE', {
      x: width - 155, y: height - 55, size: 28, font: helveticaBold, color: CREAM,
    });

    // Gold line at bottom of header
    page.drawLine({
      start: { x: 50, y: height - 85 },
      end: { x: width - 50, y: height - 85 },
      thickness: 1.5, color: GOLD,
    });

    y = height - 120;

    // ─── TWO-COLUMN LAYOUT: Bill To (left) + Invoice Meta (right) ───

    // Left: BILL TO
    page.drawText('BILL TO', {
      x: 50, y, size: 7.5, font: helveticaBold, color: GOLD,
    });
    y -= 18;
    page.drawText(invoice.clientName || 'Client', {
      x: 50, y, size: 13, font: helveticaBold, color: BLACK,
    });
    y -= 16;
    if (invoice.clientCompany) {
      page.drawText(invoice.clientCompany, {
        x: 50, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      y -= 13;
    }
    if (invoice.clientEmail) {
      page.drawText(invoice.clientEmail, {
        x: 50, y, size: 9, font: helvetica, color: WARM_GREY,
      });
    }

    // Right: Invoice details + Company details
    const rightX = width - 230;
    let rightY = height - 120;

    // Company details block (top right)
    if (companyName) {
      page.drawText(companyName, {
        x: rightX, y: rightY, size: 10, font: helveticaBold, color: DARK_BROWN,
      });
      rightY -= 14;
    }
    if (companyAddress) {
      const addrLines = wrapText(companyAddress, helvetica, 8, 200);
      addrLines.slice(0, 3).forEach((line) => {
        page.drawText(line, {
          x: rightX, y: rightY, size: 8, font: helvetica, color: WARM_GREY,
        });
        rightY -= 11;
      });
    }
    if (companyNumber) {
      page.drawText(`Company No: ${companyNumber}`, {
        x: rightX, y: rightY, size: 8, font: helvetica, color: WARM_GREY,
      });
      rightY -= 11;
    }
    if (vatNumber) {
      page.drawText(`VAT No: ${vatNumber}`, {
        x: rightX, y: rightY, size: 8, font: helvetica, color: WARM_GREY,
      });
      rightY -= 11;
    }

    // Invoice meta (right, below company details)
    rightY -= 15;

    const metaItems = [
      { label: 'INVOICE NUMBER', value: invoice.invoiceNumber },
      { label: 'DATE ISSUED', value: formatDate(invoice.sentAt || new Date()) },
      { label: 'DUE DATE', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt' },
      { label: 'PAYMENT TERMS', value: invoice.paymentTermsLabel || 'Net 30' },
    ];

    metaItems.forEach((item) => {
      page.drawText(item.label, {
        x: rightX, y: rightY, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      page.drawText(item.value, {
        x: rightX, y: rightY - 11, size: 9, font: helveticaBold, color: BLACK,
      });
      rightY -= 28;
    });

    // Align y positions
    y = Math.min(y - 20, rightY) - 10;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('PROJECT', {
        x: 50, y, size: 7.5, font: helveticaBold, color: GOLD,
      });
      y -= 16;
      page.drawText(invoice.projectTitle, {
        x: 50, y, size: 12, font: helveticaBold, color: BLACK,
      });
      y -= 24;
    }

    // ─── Divider ───
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 0.5, color: rgb(0.85, 0.82, 0.78),
    });
    y -= 22;

    // ─── LINE ITEMS TABLE ───
    const lineItemsRaw = invoice.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table header - tall dark brown bar with generous padding
      page.drawRectangle({
        x: 50, y: y - 24, width: width - 100, height: 28,
        color: DARK_BROWN,
      });
      page.drawText('SERVICE DESCRIPTION', {
        x: 60, y: y - 16, size: 8, font: helveticaBold, color: CREAM,
      });
      page.drawText('QTY', {
        x: 355, y: y - 16, size: 8, font: helveticaBold, color: CREAM,
      });
      page.drawText('RATE', {
        x: 400, y: y - 16, size: 8, font: helveticaBold, color: CREAM,
      });
      page.drawText('AMOUNT', {
        x: 465, y: y - 16, size: 8, font: helveticaBold, color: CREAM,
      });
      y -= 34;

      lineItems.forEach((item: any, idx: number) => {
        if (y < 120) {
          page = pdfDoc.addPage([595, 842]);
          drawPageBackground(page, width, 842);
          y = 842 - 80;
        }

        const isOld = !!item.description;
        const desc = String(isOld ? item.description : item.serviceName || '').substring(0, 45);
        const category = item.serviceCategory;
        const qty = Number(isOld ? item.quantity : item.quantity || 1);
        const rate = Number(isOld ? item.rate : item.price || 0);
        const amount = Number(isOld ? item.amount : qty * rate);

        // Alternating warm cream row
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 28,
            color: PALE_CREAM,
          });
        }

        page.drawText(desc, {
          x: 60, y: y + 2, size: 9.5, font: helvetica, color: BLACK,
        });
        if (category) {
          page.drawText(String(category).substring(0, 30), {
            x: 60, y: y - 10, size: 7.5, font: helvetica, color: WARM_GREY,
          });
        }
        page.drawText(String(qty), {
          x: 355, y: y + 2, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(rate), {
          x: 400, y: y + 2, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(amount), {
          x: 465, y: y + 2, size: 9.5, font: helveticaBold, color: BLACK,
        });
        y -= category ? 34 : 26;
      });

      y -= 14;
    }

    // ─── TOTALS BOX ───
    const subtotal = Number(invoice.subtotal || 0);
    const total = Number(invoice.total || 0);

    const discountRaw = invoice.discount || {};
    const discount = typeof discountRaw === 'string' ? JSON.parse(discountRaw) : discountRaw;
    const discountEnabled = discount?.enabled || false;
    const discountPercent = discount?.percent || 0;
    const discountAmount = discountEnabled ? (subtotal * discountPercent) / 100 : 0;

    const totalsX = width - 230;

    // Cream background box for totals
    const totalsLines = 1 + (discountEnabled && discountAmount > 0 ? 1 : 0) + 1 + 1; // subtotal, discount?, vat, total
    const totalsBoxH = totalsLines * 20 + 16;
    page.drawRectangle({
      x: totalsX - 20, y: y - totalsBoxH + 8, width: width - totalsX + 20 - 50, height: totalsBoxH,
      color: LIGHT_CREAM,
    });

    page.drawText('Subtotal:', {
      x: totalsX, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    page.drawText(formatCurrency(subtotal), {
      x: totalsX + 130, y, size: 9, font: helvetica, color: BLACK,
    });
    y -= 20;

    if (discountEnabled && discountAmount > 0) {
      page.drawText(`${discountPercent}% Discount:`, {
        x: totalsX, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText(`-${formatCurrency(discountAmount)}`, {
        x: totalsX + 130, y, size: 9, font: helvetica, color: rgb(0.6, 0.2, 0.2),
      });
      y -= 20;
    }

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
    y -= 20;

    // Separator
    page.drawLine({
      start: { x: totalsX, y: y + 6 },
      end: { x: width - 50, y: y + 6 },
      thickness: 1, color: DARK_BROWN,
    });

    // TOTAL
    page.drawText('TOTAL:', {
      x: totalsX, y: y - 6, size: 13, font: helveticaBold, color: DARK_BROWN,
    });
    page.drawText(formatCurrency(total), {
      x: totalsX + 130, y: y - 6, size: 13, font: helveticaBold, color: DARK_BROWN,
    });
    y -= 45;

    // ─── PAYMENT SCHEDULE ───
    const scheduleRaw = invoice.paymentSchedule || [];
    const schedule = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]');

    if (schedule.length > 0) {
      if (y < 180) {
        page = pdfDoc.addPage([595, 842]);
        drawPageBackground(page, width, 842);
        y = 842 - 80;
      }

      y -= 5;
      page.drawText('PAYMENT SCHEDULE', {
        x: 50, y, size: 7.5, font: helveticaBold, color: GOLD,
      });
      y -= 20;

      // Table header
      page.drawRectangle({
        x: 50, y: y - 20, width: width - 100, height: 24,
        color: DARK_BROWN,
      });
      page.drawText('INSTALLMENT', {
        x: 60, y: y - 12, size: 8, font: helveticaBold, color: CREAM,
      });
      page.drawText('%', {
        x: 260, y: y - 12, size: 8, font: helveticaBold, color: CREAM,
      });
      page.drawText('DUE', {
        x: 320, y: y - 12, size: 8, font: helveticaBold, color: CREAM,
      });
      page.drawText('AMOUNT', {
        x: 465, y: y - 12, size: 8, font: helveticaBold, color: CREAM,
      });
      y -= 28;

      schedule.forEach((item: any, idx: number) => {
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 24,
            color: PALE_CREAM,
          });
        }
        page.drawText(String(item.label || 'Payment'), {
          x: 60, y: y, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 260, y: y, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(String(item.due || '—'), {
          x: 320, y: y, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency((total * (item.percent || 0)) / 100), {
          x: 465, y: y, size: 9.5, font: helveticaBold, color: BLACK,
        });
        y -= 26;
      });
      y -= 14;
    }

    // ─── BANK DETAILS ───
    if (y < 220) {
      page = pdfDoc.addPage([595, 842]);
      drawPageBackground(page, width, 842);
      y = 842 - 80;
    }

    y -= 5;
    page.drawText('BANK DETAILS', {
      x: 50, y, size: 7.5, font: helveticaBold, color: GOLD,
    });
    y -= 18;

    // Bank block: cream background with gold left border
    const bankLines = 4 + (swiftCode ? 1 : 0) + (iban ? 1 : 0);
    const bankBlockH = bankLines * 18 + 24;
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: width - 100, height: bankBlockH,
      color: LIGHT_CREAM,
    });
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: 4, height: bankBlockH,
      color: GOLD,
    });

    const labelX = 68;
    const valueX = 170;
    const lineH = 18;

    y -= 6;  // top padding inside block
    page.drawText('Bank:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankName, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= lineH;
    page.drawText('Account Name:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankAccountName, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= lineH;
    page.drawText('Sort Code:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankSortCode, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= lineH;
    page.drawText('Account No:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankAccountNumber, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= lineH;
    if (swiftCode) {
      page.drawText('SWIFT:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
      page.drawText(swiftCode, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
      y -= lineH;
    }
    if (iban) {
      page.drawText('IBAN:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
      page.drawText(iban, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
      y -= lineH;
    }
    y -= 20;

    // ─── NOTES & TERMS ───
    if (invoice.notes) {
      if (y < 140) {
        page = pdfDoc.addPage([595, 842]);
        drawPageBackground(page, width, 842);
        y = 842 - 80;
      }
      page.drawText('NOTES & TERMS', {
        x: 50, y, size: 7.5, font: helveticaBold, color: GOLD,
      });
      y -= 16;

      const notesText = String(invoice.notes);
      const maxWidth = width - 100;
      const lines = wrapText(notesText, helvetica, 9, maxWidth);
      lines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 50, y, size: 9, font: helvetica, color: WARM_GREY });
        y -= 14;
      });
      y -= 14;
    }

    // ─── FOOTER BAND ───
    // Always draw footer, even if we need to push to a new page
    if (y < 55) {
      page = pdfDoc.addPage([595, 842]);
      drawPageBackground(page, width, 842);
    }

    // Dark brown footer band at bottom
    page.drawRectangle({
      x: 0, y: 30, width, height: 42,
      color: DARK_BROWN,
    });
    page.drawText(`${companyName}  |  International DJ & Grammy Winning Producer  |  Payment due by date specified`, {
      x: 50, y: 53, size: 7, font: helvetica, color: CREAM,
    });
    page.drawText('latenightricky@gmail.com', {
      x: 50, y: 40, size: 7, font: helvetica, color: GOLD,
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