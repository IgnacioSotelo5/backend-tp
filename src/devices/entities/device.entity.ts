import { UUID, randomUUID } from 'crypto'

export class Device {
  id: UUID
  name: string
  type: string
  status: boolean
  settings: any

  constructor(name: string, type: string, status: boolean, settings: any){
    this.id = randomUUID()
    this.name = name
    this.type = type
    this.status = status
    this.settings = settings
  }
}


