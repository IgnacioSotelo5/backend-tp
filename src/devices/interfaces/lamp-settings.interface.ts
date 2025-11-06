import { LampColor } from "../enums/lamp-color.enum";
import { Device } from "./device.interface";

export interface LampSettings{
    brightness?: number
    color?: LampColor
}