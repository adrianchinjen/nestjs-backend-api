import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestTokenDto } from './dto/auth_server_request.dto';
import axios from 'axios';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { user_role } from '@prisma/client';

export interface UserSignIn {
  email: string;
  password: string;
}

interface AuthDetails {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: user_role;
  // created_at: string;
  // updated_at: string;
}

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService
  ) {}

  async fetch_token(requestUser: RequestTokenDto) {
    const url = 'http://localhost:5080/api/v1/auth/token';
    const userSignInCredential: UserSignIn = requestUser;

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

    if (isUserExisting.exist) {
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

  async userSignIn(userSignIn: UserSignIn) {
    const reqEmail = userSignIn.email;
    const hashedPassword = userSignIn.password;
    // const tokenSecret = this.configService.get<string>('TOKEN_SECRET');

    const isUserExisting = await this.checkUserExisting(reqEmail);

    if (!isUserExisting.exist) {
      throw new UnauthorizedException('Email or password do not match');
    }

    const { password } = isUserExisting.details;
    // const isPasswordCorrect = await bcrypt.compareSync(password, hashedPassword);
    const isPasswordCorrect = await bcrypt.compareSync(hashedPassword, password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Email or password do not match');
    }

    return isPasswordCorrect;
  }

  async checkUserExisting(email: string, username?: string) {
    let isUserExisting = false;
    const isEmailExisting: AuthDetails = await this.databaseService.auth.findUnique({
      where: { email }
    });

    if (isEmailExisting !== null) {
      isUserExisting = true;
      return {
        exist: isUserExisting,
        details: {
          id: isEmailExisting.id,
          username: isEmailExisting.username,
          email: isEmailExisting.email,
          password: isEmailExisting.password,
          roles: isEmailExisting.roles
        }
      };
    }

    if (username) {
      const isUsernameExisting: AuthDetails = await this.databaseService.auth.findUnique({
        where: { username }
      });

      if (isUsernameExisting !== null) {
        isUserExisting = true;
        return {
          exist: isUserExisting,
          details: {
            id: isUsernameExisting.id,
            username: isUsernameExisting.username,
            email: isUsernameExisting.email,
            roles: isUsernameExisting.roles
          }
        };
      }
    }

    return {
      exist: isUserExisting,
      details: {}
    };
  }
}
