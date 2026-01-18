import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with frontend origin from env
  const corsOrigin = process.env.API_CORS_ORIGIN || 'http://localhost:4200';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`✅ Server running on port ${port} (CORS enabled for ${corsOrigin})`);
}
bootstrap();
