import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  const port = parseInt(process.env.PORT) || 3003;
  await app.listen(port);
  
  console.log('🔐 Quark Auth Service started on port', port);
  console.log('🌐 Health check: http://localhost:' + port + '/health');
  console.log('🔑 Auth endpoints: http://localhost:' + port + '/auth');
  
  // Register with Plugin Hub
  await registerWithPluginHub(port);
}

async function registerWithPluginHub(port: number) {
  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'auth-service',
        name: 'Auth Service',
        version: '1.0.0',
        url: `http://localhost:${port}`,
        healthEndpoint: `http://localhost:${port}/health`,
        metadata: {
          description: 'JWT Authentication and User Management Service',
          tags: ['auth', 'jwt', 'users', 'security'],
          endpoints: ['/auth/login', '/auth/register', '/auth/profile', '/users'],
          dependencies: ['postgresql', 'plugin-hub']
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Successfully registered with Plugin Hub');
    } else {
      console.log('⚠️ Failed to register with Plugin Hub:', response.statusText);
    }
  } catch (error) {
    console.log('⚠️ Plugin Hub registration failed:', error.message);
  }
}

bootstrap();
