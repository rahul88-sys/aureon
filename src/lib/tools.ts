export type Tool = {
  slug: string;
  title: string;
  short: string;
  hint: string;
  accept: string;
  multiple?: boolean;
};

export const tools: Tool[] = [
  {
    slug: "image-to-pdf",
    title: "Image to PDF",
    short: "Turn a JPG or PNG into a clean PDF.",
    hint: "One image → one-page PDF",
    accept: "image/jpeg,image/png,image/webp",
  },
  {
    slug: "images-to-pdf",
    title: "Images to PDF",
    short: "Combine multiple images into one PDF.",
    hint: "Many images → multi-page PDF",
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
  },
  {
    slug: "png-to-jpg",
    title: "PNG to JPG",
    short: "Convert PNG images to JPG.",
    hint: "Smaller files for photos",
    accept: "image/png",
  },
  {
    slug: "jpg-to-png",
    title: "JPG to PNG",
    short: "Convert JPG images to PNG.",
    hint: "Lossless / transparency-ready",
    accept: "image/jpeg",
  },
  {
    slug: "webp-convert",
    title: "Image to WebP",
    short: "Convert JPG or PNG to WebP.",
    hint: "Modern, smaller web images",
    accept: "image/jpeg,image/png",
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}
