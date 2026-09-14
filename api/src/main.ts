import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

  app.use(cookieParser());
  app.enableCors({
    origin: frontendUrl.split(',').map((v) => v.trim()),
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? env('PORT', '4000'));
  await app.listen(port);
  console.log(`Aureon API listening on http://localhost:${port}/api/health`);
}
void bootstrap();
