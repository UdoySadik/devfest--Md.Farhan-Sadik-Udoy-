/**
 * Package Generator Module (Phase 4 Full Implementation)
 * Assembles the final submission package using pdf-lib:
 * 1. English Cover Page with tender metadata and included documents list
 * 2. Matched documents merged in strict requirements `order` sequence
 * 3. Dynamic footers stamped on EVERY page: "<tender_id> | Page X of Y"
 * 4. Downloads as "<tender_id>_Package.pdf"
 */

/**
 * Generate the merged submission package PDF.
 * @param {object} state Current application state snapshot
 * @param {(percent: number, statusText: string) => void} [onProgress]
 * @returns {Promise<Blob>} The generated PDF Blob
 */
export async function generatePackage(state, onProgress = () => {}) {
  if (!state || !state.tender) {
    throw new Error('Tender data is missing.');
  }

  const { PDFLib } = window;
  if (!PDFLib) {
    throw new Error('pdf-lib library is not loaded. Please check your internet connection.');
  }

  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  onProgress(5, 'Initializing PDF document...');

  // 1. Determine included documents sorted by order
  // Skip optional documents that have no matched file
  const includedReqs = state.requirements
    .filter(req => Boolean(state.matches[req.id]))
    .sort((a, b) => a.order - b.order);

  if (includedReqs.length === 0) {
    throw new Error('Cannot generate package: No documents are matched.');
  }

  // Create new PDF
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  onProgress(15, 'Generating English cover page...');

  // 2. Generate Cover Page (A4: 595.28 x 841.89 points)
  // RULE: Cover page is ALWAYS in English!
  const coverPage = pdfDoc.addPage([595.28, 841.89]);
  const { width: coverWidth, height: coverHeight } = coverPage.getSize();

  // Draw header
  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 50,
    y: coverHeight - 70,
    size: 20,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.28)
  });

  coverPage.drawText('Official Tender Submission Document Package', {
    x: 50,
    y: coverHeight - 90,
    size: 11,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  // Divider line
  coverPage.drawLine({
    start: { x: 50, y: coverHeight - 105 },
    end: { x: coverWidth - 50, y: coverHeight - 105 },
    thickness: 1.5,
    color: rgb(0.39, 0.4, 0.95) // Accent blue/purple
  });

  // Tender Metadata Section
  let currentY = coverHeight - 135;
  const drawMetaField = (label, value) => {
    coverPage.drawText(label.toUpperCase(), {
      x: 50,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.45, 0.5, 0.6)
    });
    coverPage.drawText(value || '-', {
      x: 200,
      y: currentY,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.15, 0.25)
    });
    currentY -= 22;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  drawMetaField('Tender ID:', state.tender.tender_id);
  drawMetaField('Tender Title:', state.tender.title);
  drawMetaField('Procuring Entity:', state.tender.procuring_entity);
  drawMetaField('Bidder Name:', state.tender.bidder);
  drawMetaField('Submission Deadline:', state.tender.submission_deadline);
  drawMetaField('Generation Date:', todayStr);

  currentY -= 15;

  // Included Documents Header
  coverPage.drawText('INCLUDED DOCUMENTS TABLE', {
    x: 50,
    y: currentY,
    size: 12,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.28)
  });

  currentY -= 12;

  coverPage.drawLine({
    start: { x: 50, y: currentY },
    end: { x: coverWidth - 50, y: currentY },
    thickness: 0.8,
    color: rgb(0.8, 0.82, 0.88)
  });

  currentY -= 20;

  // Table header
  coverPage.drawText('Order', { x: 55, y: currentY, size: 9, font: fontBold, color: rgb(0.45, 0.5, 0.6) });
  coverPage.drawText('Document Name (English)', { x: 100, y: currentY, size: 9, font: fontBold, color: rgb(0.45, 0.5, 0.6) });
  coverPage.drawText('Pages', { x: 380, y: currentY, size: 9, font: fontBold, color: rgb(0.45, 0.5, 0.6) });
  coverPage.drawText('Expiry Date', { x: 440, y: currentY, size: 9, font: fontBold, color: rgb(0.45, 0.5, 0.6) });

  currentY -= 8;
  coverPage.drawLine({
    start: { x: 50, y: currentY },
    end: { x: coverWidth - 50, y: currentY },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.92)
  });

  currentY -= 16;

  // List each included document in order
  for (const req of includedReqs) {
    const fileId = state.matches[req.id];
    const file = state.uploadedFiles.find(f => f.fileId === fileId);
    const pCount = file ? file.pageCount : 1;
    const expiry = state.expiryDates[req.id] || (req.has_expiry ? 'N/A' : 'None');

    // Light row background
    coverPage.drawText(String(req.order), { x: 62, y: currentY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.3) });
    coverPage.drawText(String(req.title_en || '-'), { x: 100, y: currentY, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.2) });
    coverPage.drawText(`${pCount} pg${pCount > 1 ? 's' : ''}`, { x: 380, y: currentY, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
    coverPage.drawText(expiry, { x: 440, y: currentY, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });

    currentY -= 20;

    // Safety check if cover page overflows
    if (currentY < 60) break;
  }

  onProgress(30, 'Appending matched documents in sequence...');

  // 3. Append Matched Documents in strict order
  let docIndex = 0;
  for (const req of includedReqs) {
    const fileId = state.matches[req.id];
    const file = state.uploadedFiles.find(f => f.fileId === fileId);

    if (file && file.arrayBuffer) {
      docIndex++;
      const percent = 30 + Math.floor((docIndex / includedReqs.length) * 45);
      onProgress(percent, `Appending document ${docIndex}/${includedReqs.length}: ${file.name}`);

      try {
        const srcDoc = await PDFDocument.load(file.arrayBuffer);
        const pageIndices = srcDoc.getPageIndices();
        const copiedPages = await pdfDoc.copyPages(srcDoc, pageIndices);

        for (const page of copiedPages) {
          pdfDoc.addPage(page);
        }
      } catch (copyErr) {
        console.error(`Error appending PDF ${file.name}:`, copyErr);
        throw new Error(`Failed to append document "${file.name}": ${copyErr.message}`);
      }
    }
  }

  onProgress(80, 'Stamping footers on all pages...');

  // 4. Stamp Footers on EVERY Page (Page 1 to totalPages)
  // Format: "<tender_id> | Page X of Y"
  const totalPages = pdfDoc.getPageCount();
  const tenderId = state.tender.tender_id;

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width } = page.getSize();
    const footerText = `${tenderId} | Page ${i + 1} of ${totalPages}`;

    const fontSize = 9;
    const textWidth = fontRegular.widthOfTextAtSize(footerText, fontSize);
    const x = (width - textWidth) / 2; // Centered
    const y = 22; // In bottom margin, clean of content

    page.drawText(footerText, {
      x,
      y,
      size: fontSize,
      font: fontRegular,
      color: rgb(0.35, 0.38, 0.45)
    });
  }

  onProgress(95, 'Finalizing and compressing PDF package...');

  // 5. Serialize to Bytes
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Package generated successfully!');
  return blob;
}

/**
 * Trigger browser download of generated PDF.
 * Filename format: <tender_id>_Package.pdf
 * @param {Blob} blob
 * @param {string} tenderId
 */
export function downloadPackage(blob, tenderId) {
  if (!blob) return;
  const safeId = (tenderId || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeId}_Package.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
