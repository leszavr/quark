import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { MediaService } from './media.service';
import { MediaFile } from '../interfaces/media-file.interface';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: 'avatar' | 'cover' | 'post' = 'post',
    @Req() req: Request
  ): Promise<MediaFile> {
    if (!file) {
      throw new HttpException('Файл не предоставлен', HttpStatus.BAD_REQUEST);
    }

    // Получаем userId из токена (в реальной реализации это будет сделано через Guard)
    const userId = (req as any).user?.id || 'anonymous';

    return this.mediaService.uploadFile(file, userId, type);
  }

  @Get(':id')
  async getFile(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.mediaService.getFileUrl(id);
    return { url };
  }

  @Get(':id/thumbnail')
  async getThumbnail(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.mediaService.getThumbnailUrl(id);
    return { url };
  }

  @Delete(':id')
  async deleteFile(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<{ message: string }> {
    // В реальной реализации проверка прав будет через Guard
    const userId = (req as any).user?.id || 'anonymous';

    await this.mediaService.deleteFile(id);
    return { message: 'Файл успешно удален' };
  }
}