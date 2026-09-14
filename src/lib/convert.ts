import { jsPDF } from "jspdf";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    img.src = url;
  });
}

function canvasFromImage(
  img: HTMLImageElement,
  type: string,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Conversion failed"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function imagesToPdf(files: File[]) {
  if (!files.length) throw new Error("No images selected");
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true,
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;

  for (let i = 0; i < files.length; i += 1) {
    const img = await loadImage(files[i]);
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(files[i]);
    });
    const format = files[i].type.includes("png") ? "PNG" : "JPEG";
    if (i > 0) doc.addPage();
    doc.addImage(dataUrl, format, x, y, w, h);
  }

  const blob = doc.output("blob");
  const filename =
    files.length === 1
      ? `${files[0].name.replace(/\.[^.]+$/, "") || "image"}.pdf`
      : "images.pdf";
  return { blob, filename };
}

export async function convertImageFormat(
  files: File[],
  mime: "image/jpeg" | "image/png" | "image/webp",
  ext: string,
) {
  const file = files[0];
  if (!file) throw new Error("No image selected");
  const img = await loadImage(file);
  const blob = await canvasFromImage(img, mime);
  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return { blob, filename: `${base}.${ext}` };
}
