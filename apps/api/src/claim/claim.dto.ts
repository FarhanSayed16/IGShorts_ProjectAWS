import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SubmitClaimDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9._]+$/, {
    message: 'Instagram handle may only include letters, numbers, dots, and underscores',
  })
  handle!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;
}
