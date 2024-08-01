import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestTokenDto } from './dto/auth_server_request.dto';
import axios from 'axios';

interface UserRequestToken {
  email: string;
  password: string;
}
@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async fetch_token(requestUser: RequestTokenDto) {
    const url = 'http://localhost:5080/api/v1/auth/token';
    const userSignInCredential: UserRequestToken = requestUser;

    try {
      const { data } = await axios.post(url, userSignInCredential, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return data;
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }
}
