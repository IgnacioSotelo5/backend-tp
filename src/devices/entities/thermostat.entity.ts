import { ThermostatSettings } from '../interfaces/thermostat-settings.interface';
import { Device } from './device.entity';

export class Thermostat extends Device {
  constructor(name: string, status: boolean, settings: ThermostatSettings) {
    super(name, 'thermostat', status, settings)
  }
}