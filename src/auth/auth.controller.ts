import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService, UserSignIn } from './auth.service';
import { RequestTokenDto } from './dto/auth_server_request.dto';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('auth/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('fetch_token')
  async fetch_token_access(@Body(ValidationPipe) requestUser: RequestTokenDto) {
    const requestedToken = await this.authService.fetch_token(requestUser);
    return requestedToken;
  }

  @Post('signup')
  async signup(@Body(ValidationPipe) userCredentials: CreateUserDto) {
    const userDetails = this.authService.userSignUp(userCredentials);
    return userDetails;
  }

  @Post('signin')
  async signin(@Body() userInput: UserSignIn) {
    const requestSignIn = await this.authService.userSignIn(userInput);
    return requestSignIn;
  }
}
