import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private sutService: AuthService
  ) {}

  @Get('/test')
  justTestEnd() {
    const test = this.authService.testPort();
    return test;
  }
}
