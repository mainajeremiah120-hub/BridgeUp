import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'ok',
      service: 'BridgeUp API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
