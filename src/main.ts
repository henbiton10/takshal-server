import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  (app as any).useBodyParser('json', { limit: +(process.env.IMAGE_SIZE_LIMIT ?? '10mb') });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
