import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [AuthModule, PdfModule],
  controllers: [HealthController],
})
export class AppModule {}
