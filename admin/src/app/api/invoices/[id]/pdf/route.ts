import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

// Nuelo-inspired monochrome palette
const BLACK = rgb(0.04, 0.04, 0.04);
const DARK_GREY = rgb(0.25, 0.25, 0.25);
const MED_GREY = rgb(0.45, 0.45, 0.45);
const LIGHT_GREY = rgb(0.7, 0.7, 0.7);
const VERY_LIGHT_GREY = rgb(0.94, 0.94, 0.94);
const WHITE = rgb(1, 1, 1);
const ACCENT = rgb(0.04, 0.04, 0.04); // Near-black accent

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
    // Try multiple paths for the logo
    const paths = [
      path.join(process.cwd(), 'public', 'assets', 'ricky-logo.png'),
      path.join(process.cwd(), 'public', 'ricky-logo.png'),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p);
      }
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

    // ─── TOP HEADER ───
    // Thick black rule
    const headerRuleY = pageH - 52;
    page.drawRectangle({
      x: 0, y: headerRuleY, width, height: 3,
      color: BLACK,
    });

    y = headerRuleY - 12;

    // Logo (left) or text fallback
    if (logoImage) {
      page.drawImage(logoImage, {
        x: 50, y: y - logoH + 8,
        width: logoW, height: logoH,
      });
    } else {
      page.drawText('LATE NIGHT RICKY', {
        x: 50, y: y - 6, size: 18, font: helveticaBold, color: BLACK,
      });
    }

    // INVOICE label (right)
    const invoiceLabel = 'INVOICE';
    const invoiceLabelW = helveticaBold.widthOfTextAtSize(invoiceLabel, 28);
    page.drawText(invoiceLabel, {
      x: width - 50 - invoiceLabelW, y: y - 2, size: 28, font: helveticaBold, color: BLACK,
    });

    // Invoice number below label
    const invNumText = invoice.invoiceNumber || '';
    const invNumW = helvetica.widthOfTextAtSize(invNumText, 10);
    page.drawText(invNumText, {
      x: width - 50 - invNumW, y: y - 20, size: 10, font: helvetica, color: MED_GREY,
    });

    y -= 50;

    // ─── BILL TO + INVOICE META (two columns) ───
    // Left: Bill To
    page.drawText('BILL TO', {
      x: 50, y, size: 7, font: helveticaBold, color: LIGHT_GREY, 
    });
    y -= 14;
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
    let rightY = pageH - 102;

    // Company name
    if (companyName) {
      page.drawText(companyName, {
        x: rightX, y: rightY, size: 10, font: helveticaBold, color: BLACK,
      });
      rightY -= 14;
    }
    // Company address
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

    // Thin separator
    rightY -= 8;
    page.drawLine({
      start: { x: rightX, y: rightY },
      end: { x: width - 50, y: rightY },
      thickness: 0.5, color: LIGHT_GREY,
    });
    rightY -= 12;

    // Invoice details
    const metaItems = [
      { label: 'Date Issued', value: formatDate(invoice.sentAt || new Date()) },
      { label: 'Due Date', value: invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt' },
      { label: 'Payment Terms', value: invoice.paymentTermsLabel || 'Net 30' },
    ];

    metaItems.forEach((item) => {
      page.drawText(item.label, {
        x: rightX, y: rightY, size: 7, font: helvetica, color: MED_GREY,
      });
      page.drawText(item.value, {
        x: rightX + 120, y: rightY, size: 9, font: helveticaBold, color: BLACK,
      });
      rightY -= 16;
    });

    // Align y positions below both columns
    y = Math.min(y - 20, rightY) - 16;

    // ─── PROJECT ───
    if (invoice.projectTitle) {
      page.drawText('PROJECT', {
        x: 50, y, size: 7, font: helveticaBold, color: LIGHT_GREY,
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
    y -= 8;

    // ─── LINE ITEMS TABLE ───
    const lineItemsRaw = invoice.lineItems || '[]';
    const lineItems = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]');

    if (lineItems.length > 0) {
      // Table header
      page.drawRectangle({
        x: 50, y: y - 24, width: width - 100, height: 26,
        color: BLACK,
      });
      page.drawText('SERVICE DESCRIPTION', {
        x: 60, y: y - 16, size: 7.5, font: helveticaBold, color: WHITE,
      });
      page.drawText('QTY', {
        x: 345, y: y - 16, size: 7.5, font: helveticaBold, color: WHITE,
      });
      page.drawText('RATE', {
        x: 400, y: y - 16, size: 7.5, font: helveticaBold, color: WHITE,
      });
      page.drawText('AMOUNT', {
        x: 470, y: y - 16, size: 7.5, font: helveticaBold, color: WHITE,
      });
      y -= 32;

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

        // Alternating row
        if (idx % 2 === 1) {
          page.drawRectangle({
            x: 50, y: y - 14, width: width - 100, height: 26,
            color: VERY_LIGHT_GREY,
          });
        }

        page.drawText(desc, {
          x: 60, y: y + 2, size: 9.5, font: helvetica, color: BLACK,
        });
        if (category) {
          page.drawText(String(category).substring(0, 30), {
            x: 60, y: y - 10, size: 7, font: helvetica, color: MED_GREY,
          });
        }
        page.drawText(String(qty), {
          x: 345, y: y + 2, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(rate), {
          x: 400, y: y + 2, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency(amount), {
          x: 470, y: y + 2, size: 9.5, font: helveticaBold, color: BLACK,
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

    const totalsX = width - 220;

    // Light grey totals background
    const totalsH = (discountEnabled && discountAmount > 0 ? 4 : 3) * 22 + 20;
    page.drawRectangle({
      x: totalsX - 15, y: y - totalsH + 8, width: width - totalsX + 15 - 50, height: totalsH,
      color: VERY_LIGHT_GREY,
    });

    page.drawText('Subtotal', {
      x: totalsX, y, size: 9, font: helvetica, color: MED_GREY,
    });
    page.drawText(formatCurrency(subtotal), {
      x: width - 50, y, size: 9, font: helvetica, color: BLACK,
    });
    y -= 22;

    if (discountEnabled && discountAmount > 0) {
      page.drawText(`${discountPercent}% Discount`, {
        x: totalsX, y, size: 9, font: helvetica, color: MED_GREY,
      });
      page.drawText(`-${formatCurrency(discountAmount)}`, {
        x: width - 50, y, size: 9, font: helvetica, color: rgb(0.7, 0.15, 0.15),
      });
      y -= 22;
    }

    if (invoice.vatEnabled && (invoice.taxRate || 0) > 0) {
      const tax = Number(invoice.taxRate || 0);
      const taxAmount = (subtotal - discountAmount) * (tax / 100);
      page.drawText(`VAT (${tax}%)`, {
        x: totalsX, y, size: 9, font: helvetica, color: MED_GREY,
      });
      page.drawText(formatCurrency(taxAmount), {
        x: width - 50, y, size: 9, font: helvetica, color: BLACK,
      });
    } else {
      page.drawText('VAT', {
        x: totalsX, y, size: 9, font: helvetica, color: MED_GREY,
      });
      page.drawText('N/A', {
        x: width - 50, y, size: 9, font: helvetica, color: MED_GREY,
      });
    }
    y -= 22;

    // Separator line
    page.drawLine({
      start: { x: totalsX, y: y + 6 },
      end: { x: width - 50, y: y + 6 },
      thickness: 1, color: BLACK,
    });

    // TOTAL
    page.drawText('TOTAL', {
      x: totalsX, y: y - 8, size: 13, font: helveticaBold, color: BLACK,
    });
    page.drawText(formatCurrency(total), {
      x: width - 50, y: y - 8, size: 13, font: helveticaBold, color: BLACK,
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
        x: 50, y, size: 7, font: helveticaBold, color: LIGHT_GREY,
      });
      y -= 20;

      // Table header
      page.drawRectangle({
        x: 50, y: y - 20, width: width - 100, height: 24,
        color: BLACK,
      });
      page.drawText('INSTALLMENT', {
        x: 60, y: y - 12, size: 7.5, font: helveticaBold, color: WHITE,
      });
      page.drawText('%', {
        x: 260, y: y - 12, size: 7.5, font: helveticaBold, color: WHITE,
      });
      page.drawText('DUE', {
        x: 320, y: y - 12, size: 7.5, font: helveticaBold, color: WHITE,
      });
      page.drawText('AMOUNT', {
        x: 470, y: y - 12, size: 7.5, font: helveticaBold, color: WHITE,
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
          x: 60, y: y, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(`${item.percent || 0}%`, {
          x: 260, y: y, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(String(item.due || '—'), {
          x: 320, y: y, size: 9.5, font: helvetica, color: BLACK,
        });
        page.drawText(formatCurrency((total * (item.percent || 0)) / 100), {
          x: 470, y: y, size: 9.5, font: helveticaBold, color: BLACK,
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
    page.drawText('BANK DETAILS FOR PAYMENT', {
      x: 50, y, size: 7, font: helveticaBold, color: LIGHT_GREY,
    });
    y -= 18;

    // Bank details in a clean two-column layout
    const bankLabelX = 50;
    const bankValueX = 160;
    const bankCol2LabelX = 300;
    const bankCol2ValueX = 410;
    const bankLineH = 16;

    page.drawText('Bank:', { x: bankLabelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankName, { x: bankValueX, y, size: 9, font: helveticaBold, color: BLACK });
    page.drawText('Sort Code:', { x: bankCol2LabelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankSortCode, { x: bankCol2ValueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= bankLineH;
    page.drawText('Account Name:', { x: bankLabelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankAccountName, { x: bankValueX, y, size: 9, font: helveticaBold, color: BLACK });
    page.drawText('Account No:', { x: bankCol2LabelX, y, size: 9, font: helvetica, color: MED_GREY });
    page.drawText(bankAccountNumber, { x: bankCol2ValueX, y, size: 9, font: helveticaBold, color: BLACK });
    y -= bankLineH;
    if (swiftCode) {
      page.drawText('SWIFT:', { x: bankLabelX, y, size: 9, font: helvetica, color: MED_GREY });
      page.drawText(swiftCode, { x: bankValueX, y, size: 9, font: helveticaBold, color: BLACK });
      y -= bankLineH;
    }
    if (iban) {
      page.drawText('IBAN:', { x: bankLabelX, y, size: 9, font: helvetica, color: MED_GREY });
      page.drawText(iban, { x: bankValueX, y, size: 9, font: helveticaBold, color: BLACK });
      y -= bankLineH;
    }
    y -= 20;

    // ─── NOTES & TERMS ───
    if (invoice.notes) {
      if (y < 140) {
        page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
        y = 842 - 80;
      }
      page.drawText('NOTES & TERMS', {
        x: 50, y, size: 7, font: helveticaBold, color: LIGHT_GREY,
      });
      y -= 16;

      const notesText = String(invoice.notes);
      const maxWidth = width - 100;
      const lines = wrapText(notesText, helvetica, 9, maxWidth);
      lines.slice(0, 8).forEach((l) => {
        page.drawText(l, { x: 50, y, size: 9, font: helvetica, color: DARK_GREY });
        y -= 14;
      });
      y -= 14;
    }

    // ─── FOOTER ───
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      page.drawRectangle({ x: 0, y: 0, width, height: 842, color: WHITE });
    }

    // Thick black footer rule
    page.drawRectangle({
      x: 0, y: 38, width, height: 3,
      color: BLACK,
    });

    // Footer text
    page.drawText(`${companyName}  |  International DJ & Grammy Winning Producer  |  Payment is due by the date specified above`, {
      x: 50, y: 20, size: 7, font: helvetica, color: MED_GREY,
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