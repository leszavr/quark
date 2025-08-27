import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadDto {
  @IsNotEmpty()
  file: Express.Multer.File;

  @IsEnum(['avatar', 'cover', 'post'])
  type: 'avatar' | 'cover' | 'post';
}