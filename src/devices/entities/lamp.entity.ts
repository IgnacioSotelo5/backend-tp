import { LampSettings } from "../interfaces/lamp-settings.interface";
import { Device } from "./device.entity";

export class Lamp extends Device{
    brightness?: number
    color?: string
    constructor(name: string, status: boolean, settings: LampSettings){
      super(name, 'lamp', status, settings)

    }
  }