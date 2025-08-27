import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as Minio from 'minio';
import { processImage } from '../utils/image.processor';
import { MediaFile } from '../interfaces/media-file.interface';
import { minioConfig } from '../config/minio.config';
import { mediaConfig } from '../config/media.config';
import * as mime from 'mime';

@Injectable()
export class MediaService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    type: 'avatar' | 'cover' | 'post'
  ): Promise<MediaFile> {
    // Генерируем уникальный ID
    const fileId = uuidv4();
    
    // Обрабатываем изображение
    const processedImage = await processImage(file.buffer);
    const thumbnail = await processImage(file.buffer, { width: mediaConfig.thumbnailWidth });
    
    // Используем фиксированное расширение webp, так как мы конвертируем в этот формат
    const extension = 'webp';
    
    // Имя файла
    const fileName = `${fileId}.${extension}`;
    const thumbnailName = `${fileId}_thumb.${extension}`;
    
    // Загружаем основное изображение в MinIO
    await this.minioClient.putObject(
      minioConfig.bucket,
      fileName,
      processedImage.buffer,
      processedImage.info.size,
      { 'Content-Type': `image/${processedImage.info.format}` }
    );
    
    // Загружаем миниатюру в MinIO
    await this.minioClient.putObject(
      minioConfig.bucket,
      thumbnailName,
      thumbnail.buffer,
      thumbnail.info.size,
      { 'Content-Type': `image/${thumbnail.info.format}` }
    );
    
    // Возвращаем объект MediaFile
    const mediaFile: MediaFile = {
      id: fileId,
      url: `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucket}/${fileName}`,
      thumbnailUrl: `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucket}/${thumbnailName}`,
      originalName: file.originalname,
      mimeType: `image/${processedImage.info.format}`,
      size: processedImage.info.size,
      uploadedAt: new Date().toISOString(),
      userId,
      type
    };
    
    return mediaFile;
  }
  
  async getFileUrl(fileId: string): Promise<string> {
    const extension = 'webp'; // Предполагаем формат WebP
    const fileName = `${fileId}.${extension}`;
    return `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucket}/${fileName}`;
  }
  
  async getThumbnailUrl(fileId: string): Promise<string> {
    const extension = 'webp'; // Предполагаем формат WebP
    const fileName = `${fileId}_thumb.${extension}`;
    return `http://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucket}/${fileName}`;
  }
  
  async deleteFile(fileId: string): Promise<void> {
    const extension = 'webp'; // Предполагаем формат WebP
    const fileName = `${fileId}.${extension}`;
    const thumbnailName = `${fileId}_thumb.${extension}`;
    
    await this.minioClient.removeObject(minioConfig.bucket, fileName);
    await this.minioClient.removeObject(minioConfig.bucket, thumbnailName);
  }
}