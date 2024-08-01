import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestTokenDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
