import { IsUUID } from 'class-validator'

export class findOneParams {
  @IsUUID()
  id: string
}
