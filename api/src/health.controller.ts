import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      ok: true,
      service: 'aureon-api',
      auth: 'google-oauth + jwt',
      time: new Date().toISOString(),
    };
  }
}
