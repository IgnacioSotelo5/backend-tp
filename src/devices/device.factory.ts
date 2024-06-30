import { Injectable } from "@nestjs/common";
import { Lamp } from "./entities/lamp.entity";
import { Camera } from "./entities/camera.entity";
import { Device } from "./entities/device.entity";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { Thermostat } from "./entities/thermostat.entity";

@Injectable()
export class DeviceFactory{
    private deviceType: {[key: string] : new(name: string, status: boolean, ...args: any[]) => Device} = {}
    constructor() {
        this.registerDeviceType('lamp', Lamp);
        this.registerDeviceType('camera', Camera);
        this.registerDeviceType('thermostat', Thermostat);
      }
    
      private registerDeviceType(type: string, deviceClass: new (name: string, status: boolean, ...args: any[]) => Device) {
        this.deviceType[type] = deviceClass;
      }
    
      createDevice(type: string, dto: CreateDeviceDto): Device {
        const DeviceClass = this.deviceType[type];
        if (!DeviceClass) {
          throw new Error(`Unsupported device type: ${type}`);
        }
        
        const {name, status, settings} = dto
        const newDevice = new DeviceClass(name, status, settings);
        
        return newDevice
      }


}
    