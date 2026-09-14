export type ToolCategory = "organize" | "edit" | "convert" | "images";
export type ToolStatus = "ready" | "soon";
export type ToolKind = "oneshot" | "editor" | "pages";

export type Tool = {
  slug: string;
  title: string;
  short: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  category: ToolCategory;
  status: ToolStatus;
  kind?: ToolKind;
  convertLabel?: string;
  /** Editor mode: full edit toolkit vs signature-focused */
  editorMode?: "edit" | "sign";
};

export const toolCategories: {
  id: ToolCategory;
  label: string;
  blurb: string;
}[] = [
  {
    id: "organize",
    label: "Organize",
    blurb: "Merge, split, compress, and rearrange pages.",
  },
  {
    id: "edit",
    label: "Edit & sign",
    blurb: "Annotate, draw, and sign PDFs in the browser.",
  },
  {
    id: "convert",
    label: "Convert",
    blurb: "Move between PDF and images — Office & OCR coming soon.",
  },
  {
    id: "images",
    label: "Images",
    blurb: "Quick image format converters.",
  },
];

export const tools: Tool[] = [
  // Organize — ready
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    short: "Combine multiple PDFs into one file.",
    hint: "Many PDFs → one",
    accept: "application/pdf",
    multiple: true,
    category: "organize",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Merge",
  },
  {
    slug: "split-pdf",
    title: "Split PDF",
    short: "Split a PDF into one file per page.",
    hint: "One PDF → many pages",
    accept: "application/pdf",
    category: "organize",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Split",
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    short: "Shrink PDF size by recompressing page images.",
    hint: "Smaller file size",
    accept: "application/pdf",
    category: "organize",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Compress",
  },
  {
    slug: "rotate-pdf",
    title: "Rotate PDF",
    short: "Rotate every page 90° clockwise.",
    hint: "Fix page orientation",
    accept: "application/pdf",
    category: "organize",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Rotate",
  },
  {
    slug: "delete-pages",
    title: "Delete pages",
    short: "Remove selected pages from a PDF.",
    hint: "Drop unwanted pages",
    accept: "application/pdf",
    category: "organize",
    status: "ready",
    kind: "pages",
    convertLabel: "Delete selected",
  },
  {
    slug: "crop-pdf",
    title: "Crop PDF",
    short: "Trim page margins to the area you keep.",
    hint: "Coming soon",
    accept: "application/pdf",
    category: "organize",
    status: "soon",
  },

  // Edit — ready
  {
    slug: "edit-pdf",
    title: "Edit PDF",
    short: "Add text, draw, and place images on your PDF.",
    hint: "Annotate in browser",
    accept: "application/pdf",
    category: "edit",
    status: "ready",
    kind: "editor",
    editorMode: "edit",
  },
  {
    slug: "sign-pdf",
    title: "Sign PDF",
    short: "Type, draw, or upload a signature and place it on the page.",
    hint: "eSign without Adobe",
    accept: "application/pdf",
    category: "edit",
    status: "ready",
    kind: "editor",
    editorMode: "sign",
  },
  {
    slug: "add-image-to-pdf",
    title: "Add image to PDF",
    short: "Place an image onto any page of your PDF.",
    hint: "Stamp logos & photos",
    accept: "application/pdf",
    category: "edit",
    status: "ready",
    kind: "editor",
    editorMode: "edit",
  },

  // Convert — ready
  {
    slug: "image-to-pdf",
    title: "Image to PDF",
    short: "Turn a JPG or PNG into a clean PDF.",
    hint: "One image → one-page PDF",
    accept: "image/jpeg,image/png,image/webp",
    category: "convert",
    status: "ready",
    kind: "oneshot",
  },
  {
    slug: "images-to-pdf",
    title: "Images to PDF",
    short: "Combine multiple images into one PDF.",
    hint: "Many images → multi-page PDF",
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    category: "convert",
    status: "ready",
    kind: "oneshot",
  },
  {
    slug: "jpg-to-pdf",
    title: "JPG to PDF",
    short: "Convert JPG photos into a PDF document.",
    hint: "Photo → PDF",
    accept: "image/jpeg",
    multiple: true,
    category: "convert",
    status: "ready",
    kind: "oneshot",
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    short: "Rasterize each PDF page as a JPG image.",
    hint: "PDF pages → photos",
    accept: "application/pdf",
    category: "convert",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Convert",
  },
  {
    slug: "pdf-to-png",
    title: "PDF to PNG",
    short: "Rasterize each PDF page as a PNG image.",
    hint: "PDF pages → PNG",
    accept: "application/pdf",
    category: "convert",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Convert",
  },

  // Convert — soon
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    short: "Convert PDF documents to editable Word files.",
    hint: "Coming soon",
    accept: "application/pdf",
    category: "convert",
    status: "soon",
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF",
    short: "Convert Word documents to PDF.",
    hint: "Coming soon",
    accept:
      ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "convert",
    status: "soon",
  },
  {
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    short: "Extract tables from PDF into Excel.",
    hint: "Coming soon",
    accept: "application/pdf",
    category: "convert",
    status: "soon",
  },
  {
    slug: "excel-to-pdf",
    title: "Excel to PDF",
    short: "Convert spreadsheets to PDF.",
    hint: "Coming soon",
    accept:
      ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: "convert",
    status: "soon",
  },
  {
    slug: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    short: "Turn PDF pages into a PowerPoint deck.",
    hint: "Coming soon",
    accept: "application/pdf",
    category: "convert",
    status: "soon",
  },
  {
    slug: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    short: "Convert presentations to PDF.",
    hint: "Coming soon",
    accept:
      ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    category: "convert",
    status: "soon",
  },
  {
    slug: "ocr-pdf",
    title: "OCR PDF",
    short: "Make scanned PDFs searchable with OCR.",
    hint: "Coming soon",
    accept: "application/pdf",
    category: "convert",
    status: "soon",
  },

  // Images — ready
  {
    slug: "png-to-jpg",
    title: "PNG to JPG",
    short: "Convert PNG images to JPG.",
    hint: "Smaller files for photos",
    accept: "image/png",
    category: "images",
    status: "ready",
    kind: "oneshot",
  },
  {
    slug: "jpg-to-png",
    title: "JPG to PNG",
    short: "Convert JPG images to PNG.",
    hint: "Lossless / transparency-ready",
    accept: "image/jpeg",
    category: "images",
    status: "ready",
    kind: "oneshot",
  },
  {
    slug: "webp-convert",
    title: "Image to WebP",
    short: "Convert JPG or PNG to WebP.",
    hint: "Modern, smaller web images",
    accept: "image/jpeg,image/png",
    category: "images",
    status: "ready",
    kind: "oneshot",
  },
  {
    slug: "compress-image",
    title: "Compress image",
    short: "Reduce JPG or PNG file size.",
    hint: "Lighter uploads",
    accept: "image/jpeg,image/png,image/webp",
    category: "images",
    status: "ready",
    kind: "oneshot",
    convertLabel: "Compress",
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function readyTools() {
  return tools.filter((t) => t.status === "ready");
}

export function toolsByCategory(category: ToolCategory) {
  return tools.filter((t) => t.category === category);
}
