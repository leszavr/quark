import * as sharp from 'sharp';
import { mediaConfig } from '../config/media.config';

export interface ProcessedImage {
  buffer: Buffer;
  info: sharp.OutputInfo;
}

export async function processImage(
  buffer: Buffer,
  options: { width?: number; format?: 'webp' | 'jpeg' } = {}
): Promise<ProcessedImage> {
  const { width = mediaConfig.maxWidth, format = 'webp' } = options;
  
  // Используем sharp напрямую
  let processor = sharp(buffer);
  
  // Изменяем размер, если указан
  if (width) {
    processor = processor.resize({ width, withoutEnlargement: true });
  }
  
  // Конвертируем в нужный формат
  if (format === 'webp') {
    processor = processor.webp({ quality: mediaConfig.quality });
  } else {
    processor = processor.jpeg({ quality: mediaConfig.quality });
  }
  
  const processedBuffer = await processor.toBuffer({ resolveWithObject: true });
  
  return {
    buffer: processedBuffer.data,
    info: processedBuffer.info
  };
}