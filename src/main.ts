import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BadRequestException, ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Permite solo propiedades especificadas en el DTO e ignora las adicionales.
      forbidNonWhitelisted: true, // evita que las propiedades no especificadas en el dto ingresen lanzando excepciones.
      transform: true, // habilita la trasnformacion de tipos de datos según las reglas definidas en los DTO.
      transformOptions: {
        enableImplicitConversion: true, // permite la conversion implicita de tipos, por ejemplo si esperamos un string y recibimos un numero intentara convertirlo al tipo deseado 
      },
      //funcion fabrica de excepciones, maneja los errores de determinada manera
      exceptionFactory: (errors) => {
        //si el error tiene que ver con los id y su forma, en este caso evalua que el id sea de tipo uuid y lanza excepcion badrequest
        const uuidError = errors.find(
          (error) => error.property === 'id' && error.constraints.isUuid,
        )
        if (uuidError) {
          return new BadRequestException('El ID debe ser un UUID valido.')
        }
        //si no se trata de un error relacionado con 'id', lanza una excepcion badrequest generica
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
