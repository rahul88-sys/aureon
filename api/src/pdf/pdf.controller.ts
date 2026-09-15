import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { PdfService } from './pdf.service';

type AuthedRequest = Request & { user: AuthUser };

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdf: PdfService) {}

  @Post('parse')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async parse(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('file is required (multipart field "file")');
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new BadRequestException('Authorization Bearer token required');
    }
    const bearerToken = auth.slice('Bearer '.length).trim();

    const blob = await this.pdf.uploadToBlob(file, req.user.id);
    const parsed = await this.pdf.parseWithPython({
      blobUrl: blob.url,
      bearerToken,
    });

    return {
      ok: true,
      blobUrl: blob.url,
      pathname: blob.pathname,
      engine: parsed.engine,
      source: parsed.source,
      needsOcr: parsed.needsOcr,
      message: parsed.message,
      runs: parsed.runs,
    };
  }
}
