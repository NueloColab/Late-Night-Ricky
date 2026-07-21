import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// LNR brand colours - matching invoice PDF
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
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, Number(params.id)));
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const s = sanitizePdfText;
    quote.clientName = s(quote.clientName);
    quote.clientEmail = s(quote.clientEmail);
    quote.clientCompany = s(quote.clientCompany);
    quote.projectTitle = s(quote.projectTitle);
    quote.notes = s(quote.notes);
    quote.paymentTermsLabel = s(quote.paymentTermsLabel);
    quote.expiryDate = s(quote.expiryDate);

    const settings = await getSettings();
    const companyName = s(settings.companyName) || 'Fricktion Music Ltd';
    const companyAddress = s(settings.companyAddress) || '';
    const companyNumber = s(settings.companyNumber) || '';
    const vatNumber = s(settings.vatNumber) || '';

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

    // QUOTE label (right)
    page.drawText('QUOTE', {
      x: width - 120, y: pageH - 52, size: 24, font: helveticaBold, color: BRAND_CREAM,
    });

    // Gold line at bottom of header
    page.drawLine({
      start: { x: 40, y: pageH - headerH + 2 },
      end: { x: width - 40, y: pageH - headerH + 2 },
      thickness: 1.5, color: BRAND_GOLD,
    });

    y = pageH - headerH - 25;

    // ─── TWO-COLUMN: Quote To (left) + Project (right) with bordered boxes ───
    const boxH = 72;
    const boxW = (width - 110) / 2;

    // Left box: QUOTE TO
    page.drawRectangle({
      x: 50, y: y - boxH, width: boxW, height: boxH,
      color: VERY_LIGHT_GREY,
    });
    page.drawRectangle({
      x: 50, y: y - boxH, width: boxW, height: boxH,
      borderColor: LIGHT_GREY, borderWidth: 0.5,
    });
    page.drawText('QUOTE TO', {
      x: 65, y: y - 14, size: 7, font: helveticaBold, color: MED_GREY,
    });
    page.drawText(quote.clientName || 'Client', {
      x: 65, y: y - 28, size: 11, font: helveticaBold, color: BLACK,
    });
    if (quote.clientCompany) {
      page.drawText(quote.clientCompany, {
        x: 65, y: y - 40, size: 9, font: helvetica, color: DARK_GREY,
      });
    }
    if (quote.clientEmail) {
      page.drawText(quote.clientEmail, {
        x: 65, y: y - 52, size: 8, font: helvetica, color: MED_GREY,
      });
    }

    // Right box: PROJECT
    const rightBoxX = 50 + boxW + 10;
    page.drawRectangle({
      x: rightBoxX, y: y - boxH, width: boxW, height: boxH,
      color: VERY_LIGHT_GREY,
    });
    page.drawRectangle({
      x: rightBoxX, y: y - boxH, width: boxW, height: boxH,
      borderColor: LIGHT_GREY, borderWidth: 0.5,
    });
    page.drawText('PROJECT', {
      x: rightBoxX + 15, y: y - 14, size: 7, font: helveticaBold, color: MED_GREY,
    });
    page.drawText(quote.projectTitle || '—', {
      x: rightBoxX + 15, y: y - 28, size: 11, font: helveticaBold, color: BLACK,
    });
    const itemCount = Array.isArray(quote.lineItems) ? quote.lineItems.length : 0;
    page.drawText(`${itemCount} service${itemCount !== 1 ? 's' : ''} included`, {
      x: rightBoxX + 15, y: y - 42, size: 9, font: helvetica, color: DARK_GREY,
    });

    y -= (boxH + 18);

    // ─── META ROW ───
    const metaH = 40;
    page.drawRectangle({
      x: 50, y: y - metaH, width: width - 100, height: metaH,
      color: VERY_LIGHT_GREY,
    });
    page.drawRectangle({
      x: 50, y: y - metaH, width: width - 100, height: metaH,
      borderColor: LIGHT_GREY, borderWidth: 0.5,
    });

    const metaItems = [
      { label: 'DATE ISSUED', value: formatDate(quote.sentAt || new Date()) },
      { label: 'QUOTE NUMBER', value: quote.quoteNumber || `QT-${String(quote.id).padStart(4, '0')}` },
      { label: 'STATUS', value: quote.status ? quote.status.charAt(0).toUpperCase() + quote.status.slice(1) : 'Draft' },
      { label: 'VALID UNTIL', value: quote.expiryDate ? formatDate(quote.expiryDate) : '30 days' },
    ];

    const metaColW = (width - 100) / 4;
    metaItems.forEach((item, i) => {
      const cx = 50 + (metaColW * i) + (metaColW / 2);
      const labelW = helveticaBold.widthOfTextAtSize(item.label, 7);
      const valueW = helveticaBold.widthOfTextAtSize(item.value, 9);
      page.drawText(item.label, {
        x: cx - (labelW / 2), y: y - 13, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText(item.value, {
        x: cx - (valueW / 2), y: y - 28, size: 9, font: helveticaBold, color: BLACK,
      });
    });

    y -= (metaH + 18);

    // ─── LINE ITEMS TABLE ───
    const lineItemsRaw = quote.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table header - dark brown bar with cream text (2 columns: Description + Amount)
      page.drawRectangle({
        x: 50, y: y - 24, width: width - 100, height: 28,
        color: BRAND_BROWN,
      });
      page.drawText('SERVICE DESCRIPTION', {
        x: 60, y: y - 16, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
      });
      page.drawText('AMOUNT', {
        x: width - 110, y: y - 16, size: 7.5, font: helveticaBold, color: BRAND_CREAM,
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
        const amount = Number(item.amount || Number(item.quantity || 1) * Number(item.price || item.rate || 0));

        // Alternating warm cream row
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 28,
            color: VERY_LIGHT_GREY,
          });
        }

        // Bottom border for each row
        page.drawLine({
          start: { x: 50, y: y - 16 },
          end: { x: width - 50, y: y - 16 },
          thickness: 0.5, color: LIGHT_GREY,
        });

        page.drawText(desc, {
          x: 60, y: y + 2, size: 10.5, font: helveticaBold, color: BLACK,
        });
        if (category) {
          page.drawText(String(category).substring(0, 30), {
            x: 60, y: y - 10, size: 8, font: helvetica, color: BRAND_GOLD,
          });
        }

        const amtStr = formatCurrency(amount);
        const amtW = helveticaBold.widthOfTextAtSize(amtStr, 11);
        page.drawText(amtStr, {
          x: width - 60 - amtW, y: y + 2, size: 11, font: helveticaBold, color: BLACK,
        });
        y -= category ? 32 : 24;
      });

      y -= 10;
    }

    // ─── TOTALS ───
    const subtotal = Number(quote.subtotal || 0);
    const total = Number(quote.total || 0);

    const discountRaw = quote.discount || {};
    const discount = typeof discountRaw === 'string' ? JSON.parse(discountRaw) : discountRaw;
    const discountEnabled = discount?.enabled || false;
    const discountPercent = discount?.percent || 0;
    const discountAmount = discountEnabled ? (subtotal * discountPercent) / 100 : 0;

    const rightAlign = width - 60;
    const totalsX = 280;
    const totalsW = width - 50 - totalsX;

    const totalsLines = 1 + (discountEnabled && discountAmount > 0 ? 1 : 0) + 1 + 1;
    const totalsBoxH = totalsLines * 22 + 20;
    page.drawRectangle({
      x: totalsX, y: y - totalsBoxH + 10, width: totalsW, height: totalsBoxH,
      color: VERY_LIGHT_GREY,
    });

    // Subtotal
    page.drawText('Subtotal', {
      x: totalsX + 12, y, size: 9, font: helvetica, color: WARM_GREY,
    });
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

    if (quote.vatEnabled && (quote.taxRate || 0) > 0) {
      const tax = Number(quote.taxRate || 0);
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

    // TOTAL
    page.drawText('TOTAL', {
      x: totalsX + 12, y: y - 8, size: 13, font: helveticaBold, color: BRAND_BROWN,
    });
    const totalStr = formatCurrency(total);
    const totalW = helveticaBold.widthOfTextAtSize(totalStr, 15);
    page.drawText(totalStr, {
      x: rightAlign - totalW, y: y - 10, size: 15, font: helveticaBold, color: BRAND_BROWN,
    });
    y -= 50;

    // ─── PAYMENT SCHEDULE ───
    const scheduleRaw = quote.paymentSchedule || [];
    const schedule = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]');

    if (schedule.length > 1) {
      if (y < 180) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 80;
      }

      // Warm brown background box for payment schedule
      page.drawRectangle({
        x: 50, y: y - 160, width: width - 100, height: 160,
        color: VERY_LIGHT_GREY,
      });
      page.drawRectangle({
        x: 50, y: y - 160, width: width - 100, height: 160,
        borderColor: BRAND_GOLD, borderWidth: 0.5,
      });

      page.drawText('PAYMENT SCHEDULE', {
        x: 65, y: y - 18, size: 7.5, font: helveticaBold, color: BRAND_GOLD,
      });
      y -= 35;

      // Table header
      page.drawLine({
        start: { x: 50, y: y + 6 },
        end: { x: width - 50, y: y + 6 },
        thickness: 0.5, color: BRAND_GOLD,
      });
      page.drawText('INSTALLMENT', {
        x: 65, y: y - 4, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      page.drawText('%', {
        x: 260, y: y - 4, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      page.drawText('DUE', {
        x: 320, y: y - 4, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      page.drawText('AMOUNT', {
        x: width - 110, y: y - 4, size: 7, font: helveticaBold, color: WARM_GREY,
      });
      y -= 22;

      schedule.forEach((item: any, idx: number) => {
        page.drawLine({
          start: { x: 65, y: y + 8 },
          end: { x: width - 65, y: y + 8 },
          thickness: 0.3, color: LIGHT_GREY,
        });
        page.drawText(String(item.label || 'Payment'), {
          x: 65, y: y - 4, size: 9, font: helveticaBold, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 260, y: y - 4, size: 9, font: helvetica, color: DARK_GREY,
        });
        page.drawText(String(item.due || '—'), {
          x: 320, y: y - 4, size: 9, font: helvetica, color: DARK_GREY,
        });
        const schedAmtStr = formatCurrency((total * (item.percent || 0)) / 100);
        const schedAmtW = helveticaBold.widthOfTextAtSize(schedAmtStr, 9);
        page.drawText(schedAmtStr, {
          x: width - 60 - schedAmtW, y: y - 4, size: 9, font: helveticaBold, color: BLACK,
        });
        y -= 20;
      });
      y -= 20;
    }

    // ─── NOTES & TERMS ───
    if (quote.notes) {
      if (y < 160) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 80;
      }

      // Notes box with border
      const notesLines = wrapText(String(quote.notes), helvetica, 9, width - 140);
      const notesBoxH = notesLines.length * 14 + 35;

      page.drawRectangle({
        x: 50, y: y - notesBoxH, width: width - 100, height: notesBoxH,
        color: VERY_LIGHT_GREY,
      });
      page.drawRectangle({
        x: 50, y: y - notesBoxH, width: width - 100, height: notesBoxH,
        borderColor: LIGHT_GREY, borderWidth: 0.5,
      });

      page.drawText('NOTES & TERMS', {
        x: 65, y: y - 16, size: 7.5, font: helveticaBold, color: BLACK,
      });
      y -= 30;

      notesLines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 65, y, size: 9, font: helvetica, color: WARM_GREY });
        y -= 14;
      });
      y -= 20;
    }

    // ─── FOOTER ───
    if (y < 80) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
    }

    // Simple footer with line
    page.drawLine({
      start: { x: 50, y: 55 },
      end: { x: width - 50, y: 55 },
      thickness: 0.5, color: LIGHT_GREY,
    });
    page.drawText(companyName, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(companyName, 7.5) / 2, y: 40, size: 7.5, font: helveticaBold, color: BRAND_BROWN,
    });
    page.drawText('International DJ & Grammy Winning Producer', {
      x: width / 2 - helvetica.widthOfTextAtSize('International DJ & Grammy Winning Producer', 7) / 2, y: 28, size: 7, font: helvetica, color: MED_GREY,
    });
    page.drawText('This is a quotation for services. Terms and conditions apply.', {
      x: width / 2 - helvetica.widthOfTextAtSize('This is a quotation for services. Terms and conditions apply.', 7) / 2, y: 16, size: 7, font: helvetica, color: MED_GREY,
    });

    const pdfBytes = await pdfDoc.save();
    const quoteNumber = quote.quoteNumber || `QT-${String(quote.id).padStart(4, '0')}`;
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LNR-Quote-${quoteNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Quote PDF error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}