import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  testPort() {
    const backendPort = this.configService.get<string>('BACKEND_PORT');
    return backendPort;
  }
}
