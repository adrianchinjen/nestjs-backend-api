import { ConflictException, Injectable } from '@nestjs/common';
import { RequestTokenDto } from './dto/auth_server_request.dto';
import axios from 'axios';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';

interface UserRequestToken {
  email: string;
  password: string;
}
@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

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

  async userSignUp(userCredentials: CreateUserDto) {
    const { username, email, password } = userCredentials;

    const isUserExisting = await this.checkUserExisting(email, username);

    if (isUserExisting) {
      throw new ConflictException('User already exist');
    }

    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const authData = {
      username,
      email,
      password: hashedPassword
    };

    const saveAuth = await this.databaseService.auth.create({
      data: authData
    });

    const { id, roles } = saveAuth;

    const saveUser = await this.databaseService.users.create({
      data: {
        username,
        email,
        roles,
        auth_id: id
      }
    });

    return saveUser;
  }

  async checkUserExisting(email: string, username: string) {
    let isUserExisting = false;
    const isEmailExisting = await this.databaseService.auth.findUnique({
      where: { email }
    });

    const isUsernameExisting = await this.databaseService.auth.findUnique({
      where: { username }
    });

    if (isEmailExisting !== null) {
      isUserExisting = true;
      return isUserExisting;
    }

    if (isUsernameExisting !== null) {
      isUserExisting = true;
      return isUserExisting;
    }

    return isUserExisting;
  }
}
