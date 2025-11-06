import { randomUUID } from "crypto";
import { Device } from "../entities/device.entity";
import { LampColor } from "../enums/lamp-color.enum";

export const mockDevices: Device[] = [
    {
      id: randomUUID(),
      name: 'Lamp 1',
      type: 'lamp',
      status: false,
      settings: {
        brightness: 75,
        color: LampColor['WarmWhite']
      }
    },
    {
      id: randomUUID(),
      name: 'Thermostat 1',
      type: 'thermostat',
      status: true,
      settings: {}
    },
    {
      id: randomUUID(),
      name: 'Camera 2',
      type: 'camera',
      status: true,
      settings: {}
    }
  ]