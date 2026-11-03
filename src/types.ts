export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  loadingPageCount: boolean;
  error?: string;
}

export type Theme = 'light' | 'dark';
