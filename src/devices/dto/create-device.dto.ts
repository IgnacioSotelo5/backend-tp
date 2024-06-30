import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LampSettings } from '../interfaces/lamp-settings.interface';
import { ThermostatSettings } from '../interfaces/thermostat-settings.interface';
import { CameraSettings } from '../interfaces/camera-settings.interface';
import { UUID } from 'crypto';

class SettingsDto {}

class LampSettingsDto extends SettingsDto implements LampSettings {
  @IsNumber()
  brightness?: number;

  @IsString()
  color?: string;
}

class ThermostatSettingsDto extends SettingsDto implements ThermostatSettings {
  @IsNumber()
  temperature?: number;
}

class CameraSettingsDto extends SettingsDto implements CameraSettings {
  @IsString()
  resolution?: string;

  @IsNumber()
  frameRate?: number;
}

export class CreateDeviceDto {
  @IsUUID()
  @IsOptional()
  id: UUID
  
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @ValidateNested()
  @Type((options) => {
    const type = options.object['type'];
    switch (type) {
      case 'lamp':
        return LampSettingsDto;
      case 'thermostat':
        return ThermostatSettingsDto;
      case 'camera':
        return CameraSettingsDto;
      default:
        return SettingsDto;
    }
  })
  settings: LampSettings | ThermostatSettings | CameraSettings;
}
