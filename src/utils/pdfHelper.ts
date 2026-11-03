import { PDFDocument } from 'pdf-lib';

/**
 * Reads a PDF file and returns its page count.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      updateMetadata: false,
      ignoreEncryption: false 
    });
    return pdfDoc.getPageCount();
  } catch (error: any) {
    console.error('Error fetching PDF page count:', error);
    if (error?.message?.includes('encrypted') || error?.message?.includes('Password')) {
      throw new Error('This PDF is encrypted or password-protected and cannot be processed.');
    }
    throw new Error('Failed to parse this file. Please verify it is a valid PDF.');
  }
}

/**
 * Merges multiple PDF files in the order they are provided.
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error('No files provided for merging.');
  }
  
  const mergedPdf = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: false
      });
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error: any) {
      console.error(`Error processing file "${file.name}" during merge:`, error);
      let errMsg = `Error at index ${i + 1} ("${file.name}"): `;
      if (error?.message?.includes('encrypted') || error?.message?.includes('Password')) {
        errMsg += 'The file is password-protected or encrypted.';
      } else {
        errMsg += 'Failed to load, it might be corrupt or malformed.';
      }
      throw new Error(errMsg);
    }
  }
  
  const mergedPdfBytes = await mergedPdf.save();
  return mergedPdfBytes;
}
