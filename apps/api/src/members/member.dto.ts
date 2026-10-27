import { IsEmail, IsString, MinLength } from 'class-validator';

export class MemberCredentialsDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class TrackUsernameDto {
  @IsString()
  @MinLength(1)
  username!: string;
}
