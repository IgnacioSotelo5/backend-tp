import { UUID, randomUUID } from "crypto"
import { Device } from "src/devices/entities/device.entity"

export class Escenario {
  id: UUID
  name: string
  description: string
  devices: Device[]

  constructor(name: string, description: string, devices: Device[]){
    this.id = randomUUID()
    this.name = name,
    this.description = description,
    this.devices = devices
  }
}
