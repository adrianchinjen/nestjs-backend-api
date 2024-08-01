import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestTokenDto } from './dto/auth_server_request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private sutService: AuthService
  ) {}

  @Post('/fetch_token')
  async fetch_token_access(@Body(ValidationPipe) requestUser: RequestTokenDto) {
    const requestedToken = await this.authService.fetch_token(requestUser);
    return requestedToken;
  }
}
