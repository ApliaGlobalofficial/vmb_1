import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
  // Enable CORS for your front-end origin(s)
  app.enableCors({
    origin: ['http://3.6.61.72:5173', "https://mazedakhale.in", "https://www.mazedakhale.in",'http://localhost:5173'],
    // credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription('Registration & Login API with JWT')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // For Docker/local binding to all interfaces:
  // await app.listen(3000, '0.0.0.0');
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}

bootstrap();
