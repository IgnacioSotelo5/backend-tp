import { CameraSettings } from "../interfaces/camera-settings.interface";
import { Device } from "./device.entity";

export class Camera extends Device{
    constructor(name: string, status: boolean, settings: CameraSettings){
        super(name, 'camera', status, settings)
    }
}