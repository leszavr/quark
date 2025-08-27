import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Включаем CORS
  app.enableCors();
  
  // Устанавливаем порт
  const port = process.env.PORT || 3004;
  await app.listen(port);
  
  console.log(`Media service запущен на порту ${port}`);
}
bootstrap();