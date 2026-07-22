import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Nuelo-inspired minimal palette - clean black/white/grey
const BLACK = rgb(0.06, 0.06, 0.06);
const DARK_GREY = rgb(0.25, 0.25, 0.25);
const MED_GREY = rgb(0.50, 0.50, 0.50);
const LIGHT_GREY = rgb(0.75, 0.75, 0.75);
const VERY_LIGHT_GREY = rgb(0.96, 0.96, 0.96);
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
    let logoW = 0;
    let logoH = 0;
    if (logoBytes) {
      try {
        logoImage = await pdfDoc.embedPng(logoBytes);
        const logoAspect = logoImage.width / logoImage.height;
        const logoMaxW = 140;
        const logoMaxH = 28;
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

    // ─── HEADER ───
    // Small brand tagline at very top
    page.drawText('LATE NIGHT RICKY', {
      x: 50, y: pageH - 35, size: 8, font: helveticaBold, color: MED_GREY,
    });

    // Logo (right side)
    if (logoImage) {
      page.drawImage(logoImage, {
        x: width - 50 - logoW, y: pageH - 40 - (logoH / 2),
        width: logoW, height: logoH,
      });
    }

    // INVOICE title (large, bold)
    page.drawText('INVOICE', {
      x: 50, y: pageH - 85, size: 28, font: helveticaBold, color: BLACK,
    });

    // Invoice number
    page.drawText(invoice.invoiceNumber || '—', {
      x: 50, y: pageH - 110, size: 11, font: helveticaBold, color: DARK_GREY,
    });

    y = pageH - 145;

    // ─── TWO-COLUMN: Bill To (left) + Meta (right) ───
    const leftX = 50;
    const rightX = 320;

    // LEFT: BILL TO
    page.drawText('B I L L  T O', {
      x: leftX, y, size: 7, font: helveticaBold, color: MED_GREY,
    });
    y -= 16;
    page.drawText(invoice.clientName || 'Client', {
      x: leftX, y, size: 11, font: helveticaBold, color: BLACK,
    });
    y -= 14;
    if (invoice.clientCompany) {
      page.drawText(invoice.clientCompany, {
        x: leftX, y, size: 9, font: helvetica, color: DARK_GREY,
      });
      y -= 12;
    }
    if (invoice.clientEmail) {
      page.drawText(invoice.clientEmail, {
        x: leftX, y, size: 9, font: helvetica, color: MED_GREY,
      });
    }

    // RIGHT: Meta info
    let ry = pageH - 145;
    const metaRightX = width - 50;

    const metaItems = [
      { label: 'D A T E  I S S U E D', value: formatDate(invoice.sentAt || new Date()) },
      { label: 'D U E  D A T E', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt' },
      { label: 'P A Y M E N T  T E R M S', value: invoice.paymentTermsLabel || 'Net 30' },
      { label: 'I N V O I C E  N U M B E R', value: invoice.invoiceNumber || '—' },
    ];

    metaItems.forEach((item) => {
      const labelW = helveticaBold.widthOfTextAtSize(item.label, 7);
      page.drawText(item.label, {
        x: metaRightX - labelW, y: ry, size: 7, font: helveticaBold, color: MED_GREY,
      });
      const valueW = helveticaBold.widthOfTextAtSize(item.value, 9);
      page.drawText(item.value, {
        x: metaRightX - valueW, y: ry - 12, size: 9, font: helveticaBold, color: BLACK,
      });
      ry -= 32;
    });

    y = Math.min(y - 20, ry) - 15;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('P R O J E C T', {
        x: leftX, y, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText(invoice.projectTitle, {
        x: leftX + 80, y, size: 10, font: helveticaBold, color: BLACK,
      });
      if (invoice.lineItems) {
        let count = 0;
        if (Array.isArray(invoice.lineItems)) {
          count = invoice.lineItems.length;
        } else {
          try { count = JSON.parse(String(invoice.lineItems || '[]')).length; } catch { count = 0; }
        }
        const itemText = count === 1 ? '1 item' : `${count} items`;
        page.drawText(itemText, {
          x: leftX + 80 + helveticaBold.widthOfTextAtSize(invoice.projectTitle, 10) + 8,
          y, size: 9, font: helvetica, color: MED_GREY,
        });
      }
      y -= 22;
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
      // Table header - minimal underline style
      page.drawText('S E R V I C E  D E S C R I P T I O N', {
        x: 50, y: y - 2, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText('A M O U N T', {
        x: width - 50, y: y - 2, size: 7, font: helveticaBold, color: MED_GREY,
      });
      y -= 8;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 1, color: BLACK,
      });
      y -= 18;

      lineItems.forEach((item: any, idx: number) => {
        if (y < 140) {
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
          x: 50, y, size: 10, font: helveticaBold, color: BLACK,
        });
        if (category) {
          page.drawText(String(category).substring(0, 35), {
            x: 50, y: y - 12, size: 8, font: helvetica, color: MED_GREY,
          });
        }

        const amtStr = formatCurrency(amount);
        const amtW = helveticaBold.widthOfTextAtSize(amtStr, 10);
        page.drawText(amtStr, {
          x: width - 50 - amtW, y, size: 10, font: helveticaBold, color: BLACK,
        });

        y -= category ? 30 : 22;
      });

      y -= 5;
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
    const subLabelW = helvetica.widthOfTextAtSize('Subtotal:', 9);
    const subValueW = helvetica.widthOfTextAtSize(subStr, 9);
    page.drawText('Subtotal:', {
      x: totalsRightX - subLabelW - subValueW - 20, y, size: 9, font: helvetica, color: MED_GREY,
    });
    page.drawText(subStr, {
      x: totalsRightX - subValueW, y, size: 9, font: helvetica, color: BLACK,
    });
    y -= 20;

    // Discount
    if (discountEnabled && discountAmount > 0) {
      const discLabel = `${discountPercent}% Discount`;
      const discStr = `-${formatCurrency(discountAmount)}`;
      const discLabelW = helvetica.widthOfTextAtSize(discLabel, 9);
      const discValueW = helvetica.widthOfTextAtSize(discStr, 9);
      page.drawText(discLabel, {
        x: totalsRightX - discLabelW - discValueW - 20, y, size: 9, font: helvetica, color: MED_GREY,
      });
      page.drawText(discStr, {
        x: totalsRightX - discValueW, y, size: 9, font: helvetica, color: rgb(0.5, 0.1, 0.1),
      });
      y -= 20;
    }

    // VAT
    if (invoice.vatEnabled && (invoice.taxRate || 0) > 0) {
      const tax = Number(invoice.taxRate || 0);
      const taxAmount = (subtotal - discountAmount) * (tax / 100);
      const vatLabel = `VAT (${tax}%)`;
      const vatStr = formatCurrency(taxAmount);
      const vatLabelW = helvetica.widthOfTextAtSize(vatLabel, 9);
      const vatValueW = helvetica.widthOfTextAtSize(vatStr, 9);
      page.drawText(vatLabel, {
        x: totalsRightX - vatLabelW - vatValueW - 20, y, size: 9, font: helvetica, color: MED_GREY,
      });
      page.drawText(vatStr, {
        x: totalsRightX - vatValueW, y, size: 9, font: helvetica, color: BLACK,
      });
    } else {
      const vatLabelW = helvetica.widthOfTextAtSize('VAT:', 9);
      const naW = helvetica.widthOfTextAtSize('N/A', 9);
      page.drawText('VAT:', {
        x: totalsRightX - vatLabelW - naW - 20, y, size: 9, font: helvetica, color: MED_GREY,
      });
      page.drawText('N/A', {
        x: totalsRightX - naW, y, size: 9, font: helvetica, color: MED_GREY,
      });
    }
    y -= 24;

    // Separator + Total
    page.drawLine({
      start: { x: 320, y: y + 6 }, end: { x: width - 50, y: y + 6 },
      thickness: 1, color: BLACK,
    });
    y -= 8;

    const totalStr = formatCurrency(total);
    const totalLabelW = helveticaBold.widthOfTextAtSize('Total:', 13);
    const totalValueW = helveticaBold.widthOfTextAtSize(totalStr, 13);
    page.drawText('Total:', {
      x: totalsRightX - totalLabelW - totalValueW - 20, y, size: 13, font: helveticaBold, color: BLACK,
    });
    page.drawText(totalStr, {
      x: totalsRightX - totalValueW, y, size: 13, font: helveticaBold, color: BLACK,
    });
    y -= 35;

    // ─── PAYMENT SCHEDULE ───
    const scheduleRaw = invoice.paymentSchedule || [];
    const schedule = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]');

    if (schedule.length > 0) {
      if (y < 200) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 60;
      }

      page.drawText('P A Y M E N T  S C H E D U L E', {
        x: 50, y, size: 7, font: helveticaBold, color: MED_GREY,
      });
      y -= 18;

      // Table header
      page.drawText('I N S T A L L M E N T', {
        x: 50, y: y - 2, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText('%', {
        x: 250, y: y - 2, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText('D U E', {
        x: 300, y: y - 2, size: 7, font: helveticaBold, color: MED_GREY,
      });
      page.drawText('A M O U N T', {
        x: width - 50, y: y - 2, size: 7, font: helveticaBold, color: MED_GREY,
      });
      y -= 8;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 0.5, color: LIGHT_GREY,
      });
      y -= 16;

      schedule.forEach((item: any) => {
        page.drawText(String(item.label || 'Payment'), {
          x: 50, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 250, y, size: 9, font: helvetica, color: BLACK,
        });
        page.drawText(String(item.due || '—'), {
          x: 300, y, size: 9, font: helvetica, color: BLACK,
        });
        const schedAmtStr = formatCurrency((total * (item.percent || 0)) / 100);
        const schedW = helveticaBold.widthOfTextAtSize(schedAmtStr, 9);
        page.drawText(schedAmtStr, {
          x: width - 50 - schedW, y, size: 9, font: helveticaBold, color: BLACK,
        });
        y -= 22;
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
      x: 50, y, size: 7, font: helveticaBold, color: MED_GREY,
    });
    y -= 16;

    // Light grey block
    const bankLines = 4 + (swiftCode ? 1 : 0) + (iban ? 1 : 0);
    const bankBlockH = bankLines * 16 + 16;
    page.drawRectangle({
      x: 50, y: y - bankBlockH + 10, width: width - 100, height: bankBlockH,
      color: VERY_LIGHT_GREY,
    });

    const labelX = 65;
    const valueX = 180;
    const col2LabelX = 310;
    const col2ValueX = 420;
    const lineH = 16;

    y -= 4;
    page.drawText('Bank:', { x: labelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankName, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
    page.drawText('Sort Code:', { x: col2LabelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankSortCode, { x: col2ValueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= lineH;
    page.drawText('Account Name:', { x: labelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankAccountName, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
    page.drawText('Account No:', { x: col2LabelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankAccountNumber, { x: col2ValueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= lineH;
    if (swiftCode) {
      page.drawText('SWIFT:', { x: labelX, y, size: 9, font: helvetica, color: MED_GREY });
      page.drawText(swiftCode, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
      y -= lineH;
    }
    if (iban) {
      page.drawText('IBAN:', { x: labelX, y, size: 9, font: helvetica, color: MED_GREY });
      page.drawText(iban, { x: valueX, y, size: 9, font: helveticaBold, color: BLACK });
      y -= lineH;
    }
    y -= 20;

    // ─── NOTES & TERMS ───
    if (invoice.notes) {
      if (y < 140) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 60;
      }
      page.drawText('N O T E S  &  T E R M S', {
        x: 50, y, size: 7, font: helveticaBold, color: MED_GREY,
      });
      y -= 14;

      const notesText = String(invoice.notes);
      const notesMaxWidth = width - 100;
      const lines = wrapText(notesText, helvetica, 9, notesMaxWidth);
      lines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 50, y, size: 9, font: helvetica, color: DARK_GREY });
        y -= 13;
      });
    }

    // ─── FOOTER ───
    if (y < 50) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
    }

    // Light grey footer line
    page.drawLine({
      start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 },
      thickness: 0.5, color: LIGHT_GREY,
    });

    page.drawText(`${companyName}`, {
      x: 50, y: 42, size: 7, font: helveticaBold, color: BLACK,
    });
    page.drawText('This is an invoice for services rendered. Payment is due by the date specified above. Thank you for your business.', {
      x: 50, y: 30, size: 7, font: helvetica, color: MED_GREY,
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
