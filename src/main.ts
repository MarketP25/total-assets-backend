import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow your Vercel frontend to talk to backend
  app.enableCors({
    origin: [
      'https://frontend-1sp9zwrwx-maina-projects.vercel.app', // your live frontend
    ],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // allow cookies/headers/JWTs
  });

  await app.listen(3000);
}
void bootstrap();
