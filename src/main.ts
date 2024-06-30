import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BadRequestException, ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const uuidError = errors.find(
          (error) => error.property === 'id' && error.constraints.isUuid,
        )
        if (uuidError) {
          return new BadRequestException('El ID debe ser un UUID valido.')
        }
        return new BadRequestException(errors)
      },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('SmartHomeAPI')
    .setDescription('Configura tus dispositivos de manera facil y rapida.')
    .setVersion('1.0')
    .addTag('SmartHome')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  await app.listen(3000)
}
bootstrap()
