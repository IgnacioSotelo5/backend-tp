import { HttpException, HttpStatus } from '@nestjs/common'

export class ReadFileException extends HttpException {
  constructor(message: string = 'Error reading file') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
      },
      HttpStatus.BAD_REQUEST,
    )
  }
}
