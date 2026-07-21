import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// LNR brand colours - matching Nuelo's brown palette
const BRAND_BROWN = rgb(0.165, 0.102, 0.039);    // #2a1a0a - deep brown
const BRAND_CREAM = rgb(0.910, 0.831, 0.722);     // #e8d4b8 - warm cream
const BRAND_GOLD = rgb(0.788, 0.663, 0.431);      // #c9a96e - gold accent
const BLACK = rgb(0.04, 0.04, 0.04);
const DARK_GREY = rgb(0.25, 0.25, 0.25);
const MED_GREY = rgb(0.45, 0.45, 0.45);
const LIGHT_GREY = rgb(0.7, 0.7, 0.7);
const VERY_LIGHT_GREY = rgb(0.96, 0.93, 0.90);   // warm light
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

async function getLogoBytes(): Promise<Buffer | null> {
  try {
    // Fetch logo from the deployed site (works on Vercel)
    const response = await fetch('https://late-night-ricky.vercel.app/assets/ricky-logo.png');
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch {
    // ignore
  }
  return null;
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
    const pageH = 842;
    let y = pageH;

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed logo
    const logoBytes = await getLogoBytes();
    let logoImage: any = null;
    const logoDims = { width: 0, height: 0 };
    let logoW = 0;
    let logoH = 0;
    if (logoBytes) {
      try {
        logoImage = await pdfDoc.embedPng(logoBytes);
        const logoAspect = logoImage.width / logoImage.height;
        const logoMaxW = 180;
        const logoMaxH = 32;
        if (logoAspect > logoMaxW / logoMaxH) {
          logoW = logoMaxW;
          logoH = logoMaxW / logoAspect;
        } else {
          logoH = logoMaxH;
          logoW = logoMaxH * logoAspect;
        }
      } catch {
        logoImage = null;
      }
    }

    // ─── WHITE BACKGROUND ───
    page.drawRectangle({ x: 0, y: 0, width, height: pageH, color: WHITE });

    // ─── TOP HEADER BAND (brown) ───
    const headerH = 80;
    page.drawRectangle({
      x: 0, y: pageH - headerH, width, height: headerH,
      color: BRAND_BROWN,
    });

    // Logo (left side of header) or text fallback
    if (logoImage) {
      page.drawImage(logoImage, {
        x: 40, y: pageH - 55 - (logoH / 2),
        width: logoW, height: logoH,
      });
    } else {
      page.drawText('LATE NIGHT RICKY', {
        x: 45, y: pageH - 48, size: 16, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('International DJ & Grammy Winning Producer', {
        x: 45, y: pageH - 62, size: 7, font: helvetica, color: BRAND_GOLD,
      });
    }

    // INVOICE label (right)
    page.drawText('INVOICE', {
      x: width - 155, y: pageH - 52, size: 24, font: helveticaBold, color: BRAND_CREAM,
    });

    // Gold line at bottom of header
    page.drawLine({
      start: { x: 40, y: pageH - headerH + 2 },
      end: { x: width - 40, y: pageH - headerH + 2 },
      thickness: 1.5, color: BRAND_GOLD,
    });

    y = pageH - headerH - 25;

    // ─── TWO-COLUMN: Bill To (left) + Company/Meta (right) ───
    // Left: BILL TO
    page.drawText('BILL TO', {
      x: 50, y, size: 7, font: helveticaBold, color: BRAND_GOLD,
    });
    y -= 16;
    page.drawText(invoice.clientName || 'Client', {
      x: 50, y, size: 12, font: helveticaBold, color: BLACK,
    });
    y -= 15;
    if (invoice.clientCompany) {
      page.drawText(invoice.clientCompany, {
        x: 50, y, size: 9, font: helvetica, color: DARK_GREY,
      });
      y -= 13;
    }
    if (invoice.clientEmail) {
      page.drawText(invoice.clientEmail, {
        x: 50, y, size: 9, font: helvetica, color: MED_GREY,
      });
    }

    // Right: Company details + Invoice meta
    const rightX = width - 230;
    let rightY = pageH - headerH - 25;

    if (companyName) {
      page.drawText(companyName, {
        x: rightX, y: rightY, size: 10, font: helveticaBold, color: BRAND_BROWN,
      });
      rightY -= 14;
    }
    if (companyAddress) {
      const addrLines = wrapText(companyAddress, helvetica, 8, 200);
      addrLines.slice(0, 3).forEach((line) => {
        page.drawText(line, {
          x: rightX, y: rightY, size: 8, font: helvetica, color: MED_GREY,
        });
        rightY -= 11;
      });
    }
    if (companyNumber) {
      page.drawText(`Company No: ${companyNumber}`, {
        x: rightX, y: rightY, size: 7.5, font: helvetica, color: MED_GREY,
      });
      rightY -= 10;
    }
    if (vatNumber) {
      page.drawText(`VAT No: ${vatNumber}`, {
        x: rightX, y: rightY, size: 7.5, font: helvetica, color: MED_GREY,
      });
      rightY -= 10;
    }

    rightY -= 8;
    page.drawLine({
      start: { x: rightX, y: rightY },
      end: { x: width - 50, y: rightY },
      thickness: 0.5, color: LIGHT_GREY,
    });
    rightY -= 12;

    const metaItems = [
      { label: 'DATE ISSUED', value: formatDate(invoice.sentAt || new Date()) },
      { label: 'DUE DATE', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt' },
      { label: 'PAYMENT TERMS', value: invoice.paymentTermsLabel || 'Net 30' },
    ];

    metaItems.forEach((item) => {
      page.drawText(item.label, {
        x: rightX, y: rightY, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText(item.value, {
        x: rightX, y: rightY - 12, size: 9, font: helveticaBold, color: BLACK,
      });
      rightY -= 28;
    });

    y = Math.min(y - 20, rightY) - 10;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('PROJECT', {
        x: 50, y, size: 7, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText(invoice.projectTitle, {
        x: 130, y, size: 10, font: helveticaBold, color: BLACK,
      });
      y -= 24;
    }

    // ─── Divider ───
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 0.5, color: LIGHT_GREY,
    });
    y -= 22;

    // ─── LINE ITEMS TABLE ───
    const lineItemsRaw = invoice.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table header - dark brown bar with cream text
      page.drawRectangle({
        x: 50, y: y - 24, width: width - 100, height: 28,
        color: BRAND_BROWN,
      });
      page.drawText('SERVICE DESCRIPTION', {
        x: 60, y: y - 16, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('QTY', {
        x: 345, y: y - 16, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('RATE', {
        x: 400, y: y - 16, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('AMOUNT', {
        x: 465, y: y - 16, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      y -= 34;

      lineItems.forEach((item: any, idx: number) => {
        if (y < 120) {
          page = pdfDoc.addPage([595, 842]);
          page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
          y = 842 - 80;
        }

        const desc = String(item.serviceName || item.description || '').substring(0, 45);
        const category = item.serviceCategory;
        const qty = Number(item.quantity || 1);
        const rate = Number(item.price || item.rate || 0);
        const amount = Number(item.amount || qty * rate);

        // Alternating warm cream row
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 28,
            color: VERY_LIGHT_GREY,
          });
        }

        page.drawText(desc, {
          x: 60, y: y + 2, size: 9.5, font: helvetica, color: BRAND_BROWN,
        });
        if (category) {
          page.drawText(String(category).substring(0, 30), {
            x: 60, y: y - 10, size: 7.5, font: helvetica, color: WARM_GREY,
          });
        }
        page.drawText(String(qty), {
          x: 345, y: y + 2, size: 9.5, font: helvetica, color: BRAND_BROWN,
        });
        page.drawText(formatCurrency(rate), {
          x: 400, y: y + 2, size: 9.5, font: helvetica, color: BRAND_BROWN,
        });
        page.drawText(formatCurrency(amount), {
          x: 465, y: y + 2, size: 9.5, font: helveticaBold, color: BRAND_BROWN,
        });
        y -= category ? 32 : 24;
      });

      y -= 10;
    }

    // ─── TOTALS ───
    const subtotal = Number(invoice.subtotal || 0);
    const total = Number(invoice.total || 0);

    const discountRaw = invoice.discount || {};
    const discount = typeof discountRaw === 'string' ? JSON.parse(discountRaw) : discountRaw;
    const discountEnabled = discount?.enabled || false;
    const discountPercent = discount?.percent || 0;
    const discountAmount = discountEnabled ? (subtotal * discountPercent) / 100 : 0;

    // Right-align values at this x position (right margin with padding)
    const rightAlign = width - 60;

    // Warm cream totals background - spans most of the page width
    const totalsX = 280;
    const totalsW = width - 50 - totalsX; // right edge at width-50
    const totalsLines = 1 + (discountEnabled && discountAmount > 0 ? 1 : 0) + 1 + 1;
    const totalsBoxH = totalsLines * 22 + 20;
    page.drawRectangle({
      x: totalsX, y: y - totalsBoxH + 10, width: totalsW, height: totalsBoxH,
      color: VERY_LIGHT_GREY,
    });

    page.drawText('Subtotal', {
      x: totalsX + 12, y, size: 9, font: helvetica, color: WARM_GREY,
    });
    // Right-align the value
    const subtotalStr = formatCurrency(subtotal);
    const subtotalW = helvetica.widthOfTextAtSize(subtotalStr, 9);
    page.drawText(subtotalStr, {
      x: rightAlign - subtotalW, y, size: 9, font: helvetica, color: BRAND_BROWN,
    });
    y -= 22;

    if (discountEnabled && discountAmount > 0) {
      const discountLabel = `${discountPercent}% Discount`;
      page.drawText(discountLabel, {
        x: totalsX + 12, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      const discountStr = `-${formatCurrency(discountAmount)}`;
      const discountW = helvetica.widthOfTextAtSize(discountStr, 9);
      page.drawText(discountStr, {
        x: rightAlign - discountW, y, size: 9, font: helvetica, color: rgb(0.6, 0.2, 0.2),
      });
      y -= 22;
    }

    if (invoice.vatEnabled && (invoice.taxRate || 0) > 0) {
      const tax = Number(invoice.taxRate || 0);
      const taxAmount = (subtotal - discountAmount) * (tax / 100);
      page.drawText(`VAT (${tax}%)`, {
        x: totalsX + 12, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      const vatStr = formatCurrency(taxAmount);
      const vatW = helvetica.widthOfTextAtSize(vatStr, 9);
      page.drawText(vatStr, {
        x: rightAlign - vatW, y, size: 9, font: helvetica, color: BRAND_BROWN,
      });
    } else {
      page.drawText('VAT', {
        x: totalsX + 12, y, size: 9, font: helvetica, color: WARM_GREY,
      });
      page.drawText('N/A', {
        x: rightAlign - helvetica.widthOfTextAtSize('N/A', 9), y, size: 9, font: helvetica, color: WARM_GREY,
      });
    }
    y -= 22;

    // Separator
    page.drawLine({
      start: { x: totalsX + 12, y: y + 6 },
      end: { x: width - 50, y: y + 6 },
      thickness: 1, color: BRAND_BROWN,
    });

    // TOTAL - right-aligned
    page.drawText('TOTAL', {
      x: totalsX + 12, y: y - 8, size: 13, font: helveticaBold, color: BRAND_BROWN,
    });
    const totalStr = formatCurrency(total);
    const totalW = helveticaBold.widthOfTextAtSize(totalStr, 13);
    page.drawText(totalStr, {
      x: rightAlign - totalW, y: y - 8, size: 13, font: helveticaBold, color: BRAND_BROWN,
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
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 80;
      }

      page.drawText('PAYMENT SCHEDULE', {
        x: 50, y, size: 7, font: helveticaBold, color: BRAND_GOLD,
      });
      y -= 20;

      // Table header - dark brown
      page.drawRectangle({
        x: 50, y: y - 20, width: width - 100, height: 24,
        color: BRAND_BROWN,
      });
      page.drawText('INSTALLMENT', {
        x: 60, y: y - 12, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('%', {
        x: 260, y: y - 12, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('DUE', {
        x: 320, y: y - 12, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('AMOUNT', {
        x: 465, y: y - 12, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      y -= 28;

      schedule.forEach((item: any, idx: number) => {
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 24,
            color: VERY_LIGHT_GREY,
          });
        }
        page.drawText(String(item.label || 'Payment'), {
          x: 60, y: y, size: 9.5, font: helvetica, color: BRAND_BROWN,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 260, y: y, size: 9.5, font: helvetica, color: BRAND_BROWN,
        });
        page.drawText(String(item.due || '—'), {
          x: 320, y: y, size: 9.5, font: helvetica, color: BRAND_BROWN,
        });
        const schedAmtStr = formatCurrency((total * (item.percent || 0)) / 100);
        page.drawText(schedAmtStr, {
          x: 490 - helveticaBold.widthOfTextAtSize(schedAmtStr, 9.5), y: y, size: 9.5, font: helveticaBold, color: BRAND_BROWN,
        });
        y -= 26;
      });
      y -= 14;
    }

    // ─── BANK DETAILS ───
    if (y < 220) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
      y = 842 - 80;
    }

    y -= 5;
    page.drawText('BANK DETAILS', {
      x: 50, y, size: 7, font: helveticaBold, color: BRAND_GOLD,
    });
    y -= 18;

    // Bank block: warm cream background with gold left border - full width for padding
    const bankLines = 4 + (swiftCode ? 1 : 0) + (iban ? 1 : 0);
    const bankBlockH = bankLines * 18 + 24;
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: width - 100, height: bankBlockH,
      color: VERY_LIGHT_GREY,
    });
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: 4, height: bankBlockH,
      color: BRAND_GOLD,
    });

    const labelX = 68;
    const valueX = 175;
    const col2LabelX = 310;
    const col2ValueX = 410;
    const lineH = 18;

    y -= 6;  // top padding inside block
    page.drawText('Bank:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankName, { x: valueX, y, size: 9, font: helveticaBold, color: BRAND_BROWN });
    page.drawText('Sort Code:', { x: col2LabelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankSortCode, { x: col2ValueX, y, size: 9, font: helveticaBold, color: BRAND_BROWN });
    y -= lineH;
    page.drawText('Account Name:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankAccountName, { x: valueX, y, size: 9, font: helveticaBold, color: BRAND_BROWN });
    page.drawText('Account No:', { x: col2LabelX, y, size: 9, font: helvetica, color: WARM_GREY });
    page.drawText(bankAccountNumber, { x: col2ValueX, y, size: 9, font: helveticaBold, color: BRAND_BROWN });
    y -= lineH;
    if (swiftCode) {
      page.drawText('SWIFT:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
      page.drawText(swiftCode, { x: valueX, y, size: 9, font: helveticaBold, color: BRAND_BROWN });
      y -= lineH;
    }
    if (iban) {
      page.drawText('IBAN:', { x: labelX, y, size: 9, font: helvetica, color: WARM_GREY });
      page.drawText(iban, { x: valueX, y, size: 9, font: helveticaBold, color: BRAND_BROWN });
      y -= lineH;
    }
    y -= 20;

    // ─── NOTES & TERMS ───
    if (invoice.notes) {
      if (y < 160) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 80;
      }
      page.drawText('NOTES & TERMS', {
        x: 50, y, size: 7, font: helveticaBold, color: BRAND_GOLD,
      });
      y -= 16;

      const notesText = String(invoice.notes);
      const notesMaxWidth = width - 120;  // generous margins
      const lines = wrapText(notesText, helvetica, 9, notesMaxWidth);
      lines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 60, y, size: 9, font: helvetica, color: WARM_GREY });
        y -= 14;
      });
    }

    // ─── FOOTER ───
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
    }

    // Dark brown footer band
    page.drawRectangle({
      x: 0, y: 30, width, height: 42,
      color: BRAND_BROWN,
    });
    page.drawText(`${companyName}  |  International DJ & Grammy Winning Producer  |  Payment is due by the date specified above`, {
      x: 50, y: 53, size: 7, font: helvetica, color: BRAND_CREAM,
    });
    page.drawText('latenightricky@gmail.com', {
      x: 50, y: 40, size: 7, font: helvetica, color: BRAND_GOLD,
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