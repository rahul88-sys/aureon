import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { put } from '@vercel/blob';
import { env } from '../env';

export type PdfRunDto = {
  id: string;
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  confidence?: number;
};

type PythonPage = {
  index: number;
  width: number;
  height: number;
  runs: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    w: number;
    h: number;
    confidence?: number;
    font_hint?: string | null;
    font_size?: number | null;
    color?: string | null;
  }>;
};

type PythonExtractResponse = {
  ok?: boolean;
  engine: string;
  source: 'text-layer' | 'ocr' | 'none';
  pages: PythonPage[];
  needs_ocr?: boolean;
  message?: string | null;
  blob_url?: string | null;
};

@Injectable()
export class PdfService {
  private pdfServiceUrl() {
    return env('PDF_SERVICE_URL', 'http://localhost:8000').replace(/\/$/, '');
  }

  async uploadToBlob(file: Express.Multer.File, userId: string) {
    const token = env('BLOB_READ_WRITE_TOKEN');
    if (!token) {
      throw new ServiceUnavailableException(
        'BLOB_READ_WRITE_TOKEN is not configured',
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Empty upload');
    }
    if (!file.mimetype?.includes('pdf') && !file.originalname?.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Only PDF uploads are supported');
    }

    const safeName = (file.originalname || 'document.pdf').replace(
      /[^\w.\-]+/g,
      '_',
    );
    const pathname = `pdf/${userId}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file.buffer, {
      access: 'public',
      token,
      contentType: 'application/pdf',
      addRandomSuffix: true,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  }

  async parseWithPython(opts: {
    blobUrl: string;
    bearerToken: string;
    engine?: string;
  }): Promise<{
    engine: string;
    source: 'text-layer' | 'ocr' | 'none';
    needsOcr: boolean;
    message?: string;
    blobUrl: string;
    runs: PdfRunDto[];
  }> {
    const base = this.pdfServiceUrl();
    let res: Response;
    try {
      res = await fetch(`${base}/v1/parse`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${opts.bearerToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          blob_url: opts.blobUrl,
          engine: opts.engine || 'auto',
        }),
      });
    } catch (e) {
      throw new ServiceUnavailableException(
        `PDF service unreachable at ${base}. Start python/ or set PDF_SERVICE_URL.`,
      );
    }

    const body = (await res.json().catch(() => ({}))) as PythonExtractResponse & {
      detail?: string;
    };

    if (!res.ok) {
      const detail =
        typeof body.detail === 'string'
          ? body.detail
          : `PDF service error (${res.status})`;
      throw new BadRequestException(detail);
    }

    const runs: PdfRunDto[] = [];
    for (const page of body.pages || []) {
      for (const run of page.runs || []) {
        runs.push({
          id: run.id,
          pageIndex: page.index,
          text: run.text,
          x: run.x,
          y: run.y,
          w: run.w,
          h: run.h,
          fontSize: run.font_size ?? 12,
          fontFamily: run.font_hint || undefined,
          color: run.color || undefined,
          confidence: run.confidence,
        });
      }
    }

    return {
      engine: body.engine,
      source: body.source,
      needsOcr: Boolean(body.needs_ocr),
      message: body.message || undefined,
      blobUrl: body.blob_url || opts.blobUrl,
      runs,
    };
  }
}
