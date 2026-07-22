import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// LNR Brand Palette
const BRAND_BROWN = rgb(0.165, 0.102, 0.039);    // #2a1a0a — header/footer bands, primary text
const BRAND_CREAM = rgb(0.910, 0.831, 0.722);     // #e8d4b8 — bank details block background, footer text
const BRAND_GOLD = rgb(0.788, 0.663, 0.431);      // #c9a96e — section labels, dividers, accents
const BLACK = rgb(0.06, 0.06, 0.06);
const DARK_GREY = rgb(0.30, 0.30, 0.30);
const MED_GREY = rgb(0.55, 0.55, 0.55);
const WHITE = rgb(1, 1, 1);

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
  } catch {}
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
  } catch {}
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
    const bankName = s(settings.bankName) || 'HSBC';
    const bankAccountName = s(settings.bankAccountName) || 'Fricktion Music Ltd';
    const bankSortCode = s(settings.bankSortCode) || '40-19-28';
    const bankAccountNumber = s(settings.bankAccountNumber) || '22135833';
    const companyName = s(settings.companyName) || 'Fricktion Music Ltd';
    const swiftCode = s(settings.swiftCode) || '';
    const iban = s(settings.iban) || '';

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    const { width } = page.getSize();
    const pageH = 842;
    let y = pageH;

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const logoBytes = await getLogoBytes();
    let logoImage: any = null;
    let logoW = 0;
    let logoH = 0;
    if (logoBytes) {
      try {
        logoImage = await pdfDoc.embedPng(logoBytes);
        const logoAspect = logoImage.width / logoImage.height;
        const logoMaxW = 140;
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

    page.drawRectangle({ x: 0, y: 0, width, height: pageH, color: WHITE });

    // ─── TOP HEADER BAND (brown) ───
    page.drawRectangle({
      x: 0, y: pageH - 80, width: 595, height: 80,
      color: BRAND_BROWN,
    });

    page.drawText('LATE NIGHT RICKY', {
      x: 50, y: pageH - 35, size: 8, font: helveticaBold, color: BRAND_CREAM,
    });

    if (logoImage) {
      page.drawImage(logoImage, {
        x: width - 50 - logoW, y: pageH - 48 - (logoH / 2),
        width: logoW, height: logoH,
      });
    }

    // Tagline below header band
    page.drawText('Brand Strategy, Communications & Digital Innovation', {
      x: 50, y: pageH - 92, size: 8, font: helvetica, color: BRAND_GOLD,
    });

    // ─── INVOICE title ───
    page.drawText('INVOICE', {
      x: 50, y: pageH - 118, size: 32, font: helveticaBold, color: BRAND_BROWN,
    });

    // Invoice number
    page.drawText(invoice.invoiceNumber || '—', {
      x: 50, y: pageH - 148, size: 14, font: helveticaBold, color: BLACK,
    });

    // ─── TWO-COLUMN INFO ───
    const infoY = pageH - 188;

    // LEFT: BILL TO
    let leftY = infoY;
    page.drawText('B I L L  T O', {
      x: 50, y: leftY, size: 8, font: helveticaBold, color: BRAND_GOLD,
    });
    leftY -= 16;
    page.drawText(invoice.clientName || 'Client', {
      x: 50, y: leftY, size: 13, font: helveticaBold, color: BLACK,
    });
    leftY -= 14;
    if (invoice.clientCompany) {
      page.drawText(invoice.clientCompany, {
        x: 50, y: leftY, size: 10, font: helvetica, color: DARK_GREY,
      });
      leftY -= 12;
    }
    if (invoice.clientEmail) {
      page.drawText(invoice.clientEmail, {
        x: 50, y: leftY, size: 10, font: helvetica, color: MED_GREY,
      });
    }

    // RIGHT: Meta (all right-aligned)
    const rightColX = width - 50;
    let rightY = infoY;

    const drawMetaRow = (label: string, value: string) => {
      const labelW = helveticaBold.widthOfTextAtSize(label, 8);
      const valueW = helveticaBold.widthOfTextAtSize(value, 11);
      page.drawText(label, {
        x: rightColX - labelW, y: rightY, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText(value, {
        x: rightColX - valueW, y: rightY - 14, size: 11, font: helveticaBold, color: BLACK,
      });
      rightY -= 34;
    };

    drawMetaRow('D A T E  I S S U E D', formatDate(invoice.sentAt || new Date()));
    drawMetaRow('D U E  D A T E', invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt');
    drawMetaRow('P A Y M E N T  T E R M S', invoice.paymentTermsLabel || 'Net 30');
    drawMetaRow('I N V O I C E  N U M B E R', invoice.invoiceNumber || '—');

    y = Math.min(leftY, rightY) - 20;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('P R O J E C T', {
        x: 50, y, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText(invoice.projectTitle, {
        x: 130, y, size: 11, font: helveticaBold, color: BLACK,
      });

      let count = 0;
      if (Array.isArray(invoice.lineItems)) {
        count = invoice.lineItems.length;
      } else {
        try { count = JSON.parse(String(invoice.lineItems || '[]')).length; } catch { count = 0; }
      }
      const itemText = count === 1 ? '1 item' : `${count} items`;
      const titleW = helveticaBold.widthOfTextAtSize(invoice.projectTitle, 11);
      page.drawText(itemText, {
        x: 130 + titleW + 8, y, size: 10, font: helvetica, color: MED_GREY,
      });
      y -= 22;
    }

    // ─── Divider ───
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 0.5, color: BRAND_GOLD,
    });
    y -= 20;

    // ─── LINE ITEMS TABLE ───
    const lineItemsRaw = invoice.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table headers
      page.drawText('S E R V I C E  D E S C R I P T I O N', {
        x: 50, y: y - 2, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText('A M O U N T', {
        x: width - 50, y: y - 2, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      y -= 6;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 1.5, color: BRAND_GOLD,
      });
      y -= 18;

      lineItems.forEach((item: any, idx: number) => {
        if (y < 150) {
          page = pdfDoc.addPage([595, 842]);
          page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
          y = 842 - 60;
        }

        const desc = String(item.serviceName || item.description || '').substring(0, 50);
        const category = item.serviceCategory;
        const qty = Number(item.quantity || 1);
        const rate = Number(item.price || item.rate || 0);
        const amount = Number(item.amount || qty * rate);

        page.drawText(desc, {
          x: 50, y, size: 11, font: helveticaBold, color: BLACK,
        });
        if (category) {
          page.drawText(String(category).substring(0, 35), {
            x: 50, y: y - 13, size: 9, font: helvetica, color: MED_GREY,
          });
        }

        const amtStr = formatCurrency(amount);
        const amtW = helveticaBold.widthOfTextAtSize(amtStr, 11);
        page.drawText(amtStr, {
          x: width - 50 - amtW, y, size: 11, font: helveticaBold, color: BLACK,
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

    const totalsRightX = width - 50;

    // Subtotal
    const subStr = formatCurrency(subtotal);
    const subLabelW = helvetica.widthOfTextAtSize('Subtotal:', 10);
    const subValueW = helveticaBold.widthOfTextAtSize(subStr, 10);
    page.drawText('Subtotal:', {
      x: totalsRightX - subLabelW - subValueW - 20, y, size: 10, font: helvetica, color: MED_GREY,
    });
    page.drawText(subStr, {
      x: totalsRightX - subValueW, y, size: 10, font: helveticaBold, color: BLACK,
    });
    y -= 20;

    // Discount
    if (discountEnabled && discountAmount > 0) {
      const discLabel = `${discountPercent}% Discount`;
      const discStr = `-${formatCurrency(discountAmount)}`;
      const discLabelW = helvetica.widthOfTextAtSize(discLabel, 10);
      const discValueW = helveticaBold.widthOfTextAtSize(discStr, 10);
      page.drawText(discLabel, {
        x: totalsRightX - discLabelW - discValueW - 20, y, size: 10, font: helvetica, color: MED_GREY,
      });
      page.drawText(discStr, {
        x: totalsRightX - discValueW, y, size: 10, font: helveticaBold, color: BLACK,
      });
      y -= 20;
    }

    // VAT
    if (invoice.vatEnabled && (invoice.taxRate || 0) > 0) {
      const tax = Number(invoice.taxRate || 0);
      const taxAmount = (subtotal - discountAmount) * (tax / 100);
      const vatLabel = `VAT (${tax}%)`;
      const vatStr = formatCurrency(taxAmount);
      const vatLabelW = helvetica.widthOfTextAtSize(vatLabel, 10);
      const vatValueW = helveticaBold.widthOfTextAtSize(vatStr, 10);
      page.drawText(vatLabel, {
        x: totalsRightX - vatLabelW - vatValueW - 20, y, size: 10, font: helvetica, color: MED_GREY,
      });
      page.drawText(vatStr, {
        x: totalsRightX - vatValueW, y, size: 10, font: helveticaBold, color: BLACK,
      });
    } else {
      const vatLabelW = helvetica.widthOfTextAtSize('VAT:', 10);
      const naW = helvetica.widthOfTextAtSize('N/A', 10);
      page.drawText('VAT:', {
        x: totalsRightX - vatLabelW - naW - 20, y, size: 10, font: helvetica, color: MED_GREY,
      });
      page.drawText('N/A', {
        x: totalsRightX - naW, y, size: 10, font: helvetica, color: MED_GREY,
      });
    }
    y -= 26;

    // Separator line above Total
    page.drawLine({
      start: { x: 320, y: y + 8 }, end: { x: width - 50, y: y + 8 },
      thickness: 1.5, color: BRAND_GOLD,
    });
    y -= 12;

    // Total
    const totalStr = formatCurrency(total);
    const totalLabelW = helveticaBold.widthOfTextAtSize('Total:', 14);
    const totalValueW = helveticaBold.widthOfTextAtSize(totalStr, 14);
    page.drawText('Total:', {
      x: totalsRightX - totalLabelW - totalValueW - 20, y, size: 14, font: helveticaBold, color: BLACK,
    });
    page.drawText(totalStr, {
      x: totalsRightX - totalValueW, y, size: 14, font: helveticaBold, color: BLACK,
    });
    y -= 45;

    // ─── PAYMENT SCHEDULE ───
    const scheduleRaw = invoice.paymentSchedule || [];
    const schedule = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]');

    if (schedule.length > 0) {
      if (y < 220) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 60;
      }

      page.drawText('P A Y M E N T  S C H E D U L E', {
        x: 50, y, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      y -= 18;

      // Headers
      page.drawText('I N S T A L L M E N T', {
        x: 50, y: y - 2, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText('%', {
        x: 250, y: y - 2, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText('D U E', {
        x: 300, y: y - 2, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      page.drawText('A M O U N T', {
        x: width - 50, y: y - 2, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      y -= 6;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 0.5, color: BRAND_GOLD,
      });
      y -= 16;

      schedule.forEach((item: any) => {
        page.drawText(String(item.label || 'Payment'), {
          x: 50, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 230, y, size: 10, font: helvetica, color: BLACK,
        });
        page.drawText(String(item.due || '—'), {
          x: 290, y, size: 10, font: helvetica, color: BLACK,
        });
        const schedAmtStr = formatCurrency((total * (item.percent || 0)) / 100);
        const schedW = helveticaBold.widthOfTextAtSize(schedAmtStr, 10);
        page.drawText(schedAmtStr, {
          x: width - 50 - schedW, y, size: 10, font: helveticaBold, color: BLACK,
        });
        y -= 24;
      });
      y -= 20;
    }

    // ─── BANK DETAILS ───
    if (y < 220) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
      y = 842 - 60;
    }

    page.drawText('B A N K  D E T A I L S  F O R  P A Y M E N T', {
      x: 50, y, size: 8, font: helveticaBold, color: BRAND_GOLD,
    });
    y -= 16;

    const bankRows = [
      { label: 'Bank:', value: bankName, label2: 'Sort Code:', value2: bankSortCode },
      { label: 'Account Name:', value: bankAccountName, label2: 'Account No:', value2: bankAccountNumber },
    ];
    if (swiftCode) bankRows.push({ label: 'SWIFT:', value: swiftCode, label2: '', value2: '' });
    if (iban) bankRows.push({ label: 'IBAN:', value: iban, label2: '', value2: '' });

    // Calculate block height including notes
    let notesLines = 0;
    if (invoice.notes) {
      const notesText = String(invoice.notes);
      const notesMaxWidth = width - 130;
      const lines = wrapText(notesText, helvetica, 9, notesMaxWidth);
      notesLines = Math.min(lines.length, 4);
    }
    const bankBlockH = bankRows.length * 18 + 16 + (notesLines > 0 ? 20 + notesLines * 13 : 0);

    // Cream background block
    page.drawRectangle({
      x: 50, y: y - bankBlockH, width: width - 100, height: bankBlockH,
      color: BRAND_CREAM,
    });

    // Thick gold left border
    page.drawRectangle({
      x: 50, y: y - bankBlockH, width: 4, height: bankBlockH,
      color: BRAND_GOLD,
    });

    let by = y - 14;
    const labelX = 65;
    const valueX = 170;
    const col2LabelX = 300;
    const col2ValueX = 390;

    bankRows.forEach((row) => {
      page.drawText(row.label, { x: labelX, y: by, size: 9, font: helvetica, color: DARK_GREY });
      page.drawText(row.value, { x: valueX, y: by, size: 9, font: helveticaBold, color: BLACK });
      if (row.label2) {
        page.drawText(row.label2, { x: col2LabelX, y: by, size: 9, font: helvetica, color: DARK_GREY });
        page.drawText(row.value2, { x: col2ValueX, y: by, size: 9, font: helveticaBold, color: BLACK });
      }
      by -= 18;
    });

    // Notes inside bank block
    if (invoice.notes) {
      by -= 4;
      page.drawText('N O T E S  &  T E R M S', {
        x: labelX, y: by, size: 8, font: helveticaBold, color: BRAND_GOLD,
      });
      by -= 14;
      const notesText = String(invoice.notes);
      const notesMaxWidth = width - 130;
      const lines = wrapText(notesText, helvetica, 9, notesMaxWidth);
      lines.slice(0, 4).forEach((l) => {
        page.drawText(l, { x: labelX, y: by, size: 9, font: helvetica, color: DARK_GREY });
        by -= 13;
      });
    }

    // ─── FOOTER ───
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
      y = 50;
    }

    // Full-width dark brown footer band
    page.drawRectangle({
      x: 0, y: 0, width: 595, height: 50,
      color: BRAND_BROWN,
    });

    page.drawText(companyName, {
      x: 50, y: 20, size: 8, font: helveticaBold, color: BRAND_CREAM,
    });
    page.drawText('This is an invoice for services rendered. Payment is due by the date specified above. Thank you for your business.', {
      x: 200, y: 20, size: 8, font: helvetica, color: BRAND_CREAM,
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
