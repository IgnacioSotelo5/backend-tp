import { HttpException, HttpStatus } from '@nestjs/common'

export class FileWriteException extends HttpException {
  constructor(message: string = 'Error writing file') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
      },
      HttpStatus.BAD_REQUEST,
    )
  }
}
